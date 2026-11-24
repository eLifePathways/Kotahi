import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import type { WaxFeature } from '../features/types'
import {
  WaxEngineContext,
  type LatestProps,
  type WaxEngine,
  type WaxUser,
} from './context'
import { parse } from './htmlFormat'
import { createPortalStore, NodeViewPortals, type NodeViews } from './nodeViews'
import buildSchema from './schema'
import createStore from './store'

const SAVED_HISTORY_SIZE = 20

const noop = (): void => {}
const noNodeViews: NodeViews = {}

export type WaxProviderProps = {
  features: WaxFeature[]
  nodeViews?: NodeViews
  value?: string
  onChange?: (html: string) => void
  readonly?: boolean
  placeholder?: string
  focusOnMount?: boolean
  trackChanges?: boolean
  user?: WaxUser
  children?: ReactNode
}

const WaxProvider = ({
  features,
  nodeViews = noNodeViews,
  value = '',
  onChange = noop,
  readonly = false,
  placeholder = '',
  focusOnMount = false,
  trackChanges = false,
  user,
  children,
}: WaxProviderProps): ReactNode => {
  const [store] = useState(createStore)
  const [portalStore] = useState(createPortalStore)
  const schema = useMemo(() => buildSchema(features), [features])
  const savedValues = useRef<string[]>([value])

  const latest = useRef<LatestProps>({
    value,
    readonly,
    placeholder,
    focusOnMount,
    trackChanges,
    user,
    onSave: noop,
  })

  useLayoutEffect(() => {
    latest.current = {
      value,
      readonly,
      placeholder,
      focusOnMount,
      trackChanges,
      user,
      onSave: (html: string): void => {
        savedValues.current = [...savedValues.current, html].slice(
          -SAVED_HISTORY_SIZE,
        )
        onChange(html)
      },
    }
  })

  useEffect(() => {
    if (savedValues.current.includes(value)) return
    if (features.some(feature => feature.name === 'yjs')) return

    const { view } = store.getSnapshot()
    if (!view || view.isDestroyed) return

    const doc = parse(view.state.schema, value)
    savedValues.current = [...savedValues.current, value].slice(
      -SAVED_HISTORY_SIZE,
    )
    if (doc.eq(view.state.doc)) return

    view.dispatch(
      view.state.tr
        .replaceWith(0, view.state.doc.content.size, doc.content)
        .setMeta('addToHistory', false)
        .setMeta('externalUpdate', true),
    )
  }, [features, store, value])

  useEffect(() => {
    const { view } = store.getSnapshot()
    if (view && !view.isDestroyed) view.setProps({ editable: () => !readonly })
  }, [store, readonly])

  const engine = useMemo<WaxEngine>(
    () => ({ schema, features, nodeViews, portalStore, store, latest }),
    [schema, features, nodeViews, portalStore, store],
  )

  return (
    <WaxEngineContext.Provider value={engine}>
      {children}
      <NodeViewPortals store={portalStore} />
    </WaxEngineContext.Provider>
  )
}

export default WaxProvider
