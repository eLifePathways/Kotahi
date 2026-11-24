import { createContext, type RefObject } from 'react'
import type { Schema } from 'prosemirror-model'

import type { WaxFeature } from '../features/types'
import type { NodeViews, PortalStore } from './nodeViews'
import type { WaxStore } from './store'

export type WaxUser = {
  userId?: string
  username?: string
  [key: string]: unknown
}

export type LatestProps = {
  value: string
  readonly: boolean
  placeholder: string
  focusOnMount: boolean
  trackChanges: boolean
  user: WaxUser | undefined
  onSave: (html: string) => void
}

export type WaxEngine = {
  schema: Schema
  features: WaxFeature[]
  nodeViews: NodeViews
  portalStore: PortalStore
  store: WaxStore
  latest: RefObject<LatestProps>
}

export const WaxEngineContext = createContext<WaxEngine | null>(null)
