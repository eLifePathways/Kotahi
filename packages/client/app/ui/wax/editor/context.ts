import { createContext } from 'react'

import type { WaxStore } from './store'

export type WaxContextValue = {
  store: WaxStore
  setMount: (element: HTMLElement | null) => void
}

export const WaxContext = createContext<WaxContextValue | null>(null)
