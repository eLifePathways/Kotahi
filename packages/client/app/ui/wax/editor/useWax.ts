import { useContext, useSyncExternalStore } from 'react'

import { WaxContext } from './context'
import type { WaxSnapshot } from './store'

const useWax = (): WaxSnapshot => {
  const context = useContext(WaxContext)
  if (!context) throw new Error('useWax must be used inside a WaxProvider')
  const { store } = context

  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  )
}

export default useWax
