import { useContext } from 'react'
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/with-selector'

import { WaxEngineContext } from './context'
import type { WaxSnapshot } from './store'

const selectAll = (snapshot: WaxSnapshot): WaxSnapshot => snapshot

function useWax(): WaxSnapshot
function useWax<T>(
  selector: (snapshot: WaxSnapshot) => T,
  isEqual?: (a: T, b: T) => boolean,
): T
function useWax<T>(
  selector: (snapshot: WaxSnapshot) => T = selectAll as (
    snapshot: WaxSnapshot,
  ) => T,
  isEqual: (a: T, b: T) => boolean = Object.is,
): T {
  const engine = useContext(WaxEngineContext)
  if (!engine) throw new Error('useWax must be used inside a WaxProvider')
  const { store } = engine

  return useSyncExternalStoreWithSelector(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
    selector,
    isEqual,
  )
}

export default useWax
