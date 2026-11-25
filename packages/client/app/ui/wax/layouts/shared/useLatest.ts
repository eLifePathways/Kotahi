import { useLayoutEffect, useRef, type RefObject } from 'react'

const useLatest = <T>(value: T): RefObject<T> => {
  const ref = useRef(value)

  useLayoutEffect(() => {
    ref.current = value
  })

  return ref
}

export default useLatest
