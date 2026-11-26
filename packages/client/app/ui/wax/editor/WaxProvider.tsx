import {
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { EditorState, type Transaction } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'

import type { WaxFeature } from '../features/types'
import { WaxContext, type WaxContextValue } from './context'
import { parse, serialize } from './htmlFormat'
import {
  createPortalStore,
  NodeViewPortals,
  nodeViewsPlugin,
  type NodeViews,
} from './nodeViews'
import createPlugins from './plugins'
import buildSchema from './schema'
import createStore from './store'

const noop = (): void => {}
const noNodeViews: NodeViews = {}

export type WaxProviderProps = {
  children?: ReactNode
  features: WaxFeature[]
  nodeViews?: NodeViews
  onChange?: (html: string) => void
  placeholder?: string
  value?: string
}

const WaxProvider = ({
  children,
  features: currentFeatures,
  nodeViews: initialNodeViews = noNodeViews,
  onChange = noop,
  placeholder = '',
  value = '',
}: WaxProviderProps): ReactNode => {
  /**
   * Create all the basics once and keep until the provider unmounts.
   *
   * useMemo might seem like the way to go, but react actually does not
   * guarantee that a memoized value will not be recomputed, and we want these
   * calculated exactly once.
   */

  /**
   * Features stay locked once mounted. Only the features' sync function can run
   * again. (see useLayoutEffect further down)
   */
  const [features] = useState(currentFeatures)
  const [portalStore] = useState(createPortalStore)
  const [schema] = useState(() => buildSchema(features))

  const [store] = useState(() =>
    createStore(
      EditorState.create({
        doc: parse(schema, value),
        plugins: [
          ...createPlugins({ features, schema, placeholder }),
          nodeViewsPlugin(initialNodeViews, portalStore),
        ],
      }),
    ),
  )

  /**
   * The surface will tell the provider which element it is (via setMount).
   * The provider will keep track of that and render the prosemirror editor
   * view on it.
   */
  const [mount, setMount] = useState<HTMLElement | null>(null)

  /**
   * The onChange prop can change.
   * eg. onChange={v => doSomething(v)} will pass a new function on every render
   *
   * An effect event will make sure the latest onChange is always called. If
   * we'd used onChange directly in useLayoutEffect (its only caller), we'd need
   * to add it to the effect's dependencies, which would recreate the whole
   * prosemirror view every time the onChange prop changed.
   */
  const emitChange = useEffectEvent((html: string) => onChange(html))

  /**
   * Once there is an element to mount the view on (coming from WaxSurface),
   * create an EditorView on it.
   */
  useLayoutEffect(() => {
    if (!mount) return undefined

    const view = new EditorView(
      { mount },
      {
        state: store.getSnapshot().state,
        dispatchTransaction(this: EditorView, transaction: Transaction): void {
          const valueSync = !!transaction.getMeta('valueSync')

          /**
           * Features (eg. track changes) can intercept a transaction and apply
           * their own transformations. Find them and apply them on every
           * dispatch.
           *
           * Do not apply when the transaction is replacing the whole doc
           * because of a value change. eg. that could mark the whole doc
           * change as a tracked change.
           */
          const tr: Transaction = valueSync
            ? transaction
            : features.reduce(
                (next, feature) =>
                  feature.transformTransaction
                    ? feature.transformTransaction(next, this.state)
                    : next,
                transaction,
              )

          const previous = this.state.doc
          const next = this.state.apply(tr)
          this.updateState(next)
          store.setSnapshot({ view: this, state: next })

          /**
           * Many things are transactions that do not modify the document.
           * Selections, track changes show/hide, active comments, applying an
           * inline mark without a selection and much more fall under this
           * category.
           *
           * `!previous.eq(next.doc)` guards against running the onChange
           * function in all these cases.
           *
           * Receiving a new value from the props should also not fire the
           * onChange function.
           */
          if (!valueSync && !previous.eq(next.doc)) {
            emitChange(serialize(schema, next.doc.content))
          }
        },
      },
    )

    store.setSnapshot({ view, state: view.state })

    return (): void => {
      store.setSnapshot({ view: undefined, state: view.state })
      view.destroy()
    }
  }, [mount, schema, features, store])

  /**
   * Features are fixed. But they can also have a sync property that can change
   * their config. So on every features change, we find the ones that have a
   * sync function defined and run it.
   *
   * The clearest example of this use case is track changes being turned on/off.
   * Sync in this case will update the feature's config and affect its behavior.
   */
  useLayoutEffect(() => {
    const { view } = store.getSnapshot()
    if (!view) return
    currentFeatures.forEach(feature =>
      feature.sync?.(view.state, view.dispatch),
    )
  }, [mount, currentFeatures, store])

  /**
   * Handle the value changing.
   */
  useEffect(() => {
    // yjs owns the content, do nothing
    if (features.some(feature => feature.name === 'yjs')) return

    const { view, state } = store.getSnapshot()
    // make a new doc with the current schema and the new value
    const doc = parse(state.schema, value)
    if (doc.eq(state.doc)) return

    /**
     * Replace the whole document (from 0 to the end) in one transaction.
     * Make sure it cannot be undone.
     * Mark the transaction as a value change.
     */
    const tr = state.tr
      .replaceWith(0, state.doc.content.size, doc.content)
      .setMeta('addToHistory', false)
      .setMeta('valueSync', true)

    if (view && !view.isDestroyed) {
      view.dispatch(tr)
    } else {
      /**
       * Make sure the transaction is applied even if the surface has not
       * mounted yet (or between mounts).
       */
      store.setSnapshot({ view: undefined, state: state.apply(tr) })
    }
  }, [features, store, value])

  const context = useMemo<WaxContextValue>(() => ({ store, setMount }), [store])

  return (
    <WaxContext.Provider value={context}>
      {children}
      <NodeViewPortals store={portalStore} />
    </WaxContext.Provider>
  )
}

export default WaxProvider
