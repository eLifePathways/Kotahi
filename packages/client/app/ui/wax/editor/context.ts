import { createContext, type RefObject } from 'react'
import type { Schema } from 'prosemirror-model'
import type { EditorState } from 'prosemirror-state'

import type { TransactionContext, WaxFeature } from '../features/types'
import type { WaxStore } from './store'

export type LatestProps = {
  value: string
  readonly: boolean
  placeholder: string
  focusOnMount: boolean
  transactionContext: TransactionContext
  onSave: (html: string) => void
}

export type WaxContextValue = {
  schema: Schema
  features: WaxFeature[]
  store: WaxStore
  latest: RefObject<LatestProps>
  ensureState: () => EditorState
}

export const WaxContext = createContext<WaxContextValue | null>(null)
