import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Schema } from 'prosemirror-model'
import { EditorState } from 'prosemirror-state'

import type { TransactionContext, WaxFeature } from '../features/types'
import { WaxContext, type LatestProps, type WaxContextValue } from './context'
import { parse } from './htmlFormat'
import {
  createPortalStore,
  NodeViewPortals,
  nodeViewsPlugin,
  type NodeViews,
  type PortalStore,
} from './nodeViews'
import createPlugins from './plugins'
import buildSchema from './schema'
import createStore from './store'

const SAVED_HISTORY_SIZE = 20

const noop = (): void => {}
const noNodeViews: NodeViews = {}
const noTransactionContext: TransactionContext = {}

type StateInputs = {
  schema: Schema
  features: WaxFeature[]
  nodeViews: NodeViews
  portalStore: PortalStore
  value: string
  placeholder: string
}

const createState = ({
  schema,
  features,
  nodeViews,
  portalStore,
  value,
  placeholder,
}: StateInputs): EditorState =>
  EditorState.create({
    doc: parse(schema, value),
    plugins: [
      ...createPlugins({ features, schema, placeholder }),
      nodeViewsPlugin(nodeViews, portalStore),
    ],
  })

export type WaxProviderProps = {
  children?: ReactNode
  features: WaxFeature[]
  focusOnMount?: boolean
  nodeViews?: NodeViews
  onChange?: (html: string) => void
  placeholder?: string
  readonly?: boolean
  transactionContext?: TransactionContext
  value?: string
}

const WaxProvider = ({
  children,
  features: initialFeatures,
  focusOnMount = false,
  nodeViews: initialNodeViews = noNodeViews,
  onChange = noop,
  placeholder = '',
  readonly = false,
  transactionContext = noTransactionContext,
  value = '',
}: WaxProviderProps): ReactNode => {
  const [portalStore] = useState(createPortalStore)
  const [features] = useState(initialFeatures)
  const [schema] = useState(() => buildSchema(features))

  const [store] = useState(() =>
    createStore(
      createState({
        schema,
        features,
        nodeViews: initialNodeViews,
        portalStore,
        value,
        placeholder,
      }),
    ),
  )

  const savedValues = useRef<string[]>([value])

  const latest = useRef<LatestProps>({
    value,
    readonly,
    placeholder,
    focusOnMount,
    transactionContext,
    onSave: noop,
  })

  useLayoutEffect(() => {
    latest.current = {
      value,
      readonly,
      placeholder,
      focusOnMount,
      transactionContext,
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

    const { view, state } = store.getSnapshot()
    const doc = parse(state.schema, value)
    savedValues.current = [...savedValues.current, value].slice(
      -SAVED_HISTORY_SIZE,
    )
    if (doc.eq(state.doc)) return

    const tr = state.tr
      .replaceWith(0, state.doc.content.size, doc.content)
      .setMeta('addToHistory', false)
      .setMeta('externalUpdate', true)

    if (view && !view.isDestroyed) view.dispatch(tr)
    else store.setSnapshot({ view: undefined, state: state.apply(tr) })
  }, [features, store, value])

  useEffect(() => {
    const { view } = store.getSnapshot()
    if (view && !view.isDestroyed) view.setProps({ editable: () => !readonly })
  }, [store, readonly])

  const context = useMemo<WaxContextValue>(
    () => ({ schema, features, store, latest }),
    [schema, features, store],
  )

  return (
    <WaxContext.Provider value={context}>
      {children}
      <NodeViewPortals store={portalStore} />
    </WaxContext.Provider>
  )
}

export default WaxProvider
