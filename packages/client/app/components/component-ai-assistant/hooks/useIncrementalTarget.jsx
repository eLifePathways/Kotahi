/* eslint-disable no-unused-expressions */

import { useEffect, useRef } from 'react'
import { safeCall } from '../../../shared/generalUtils'

const useIncrementalTarget = delay => {
  const clicksRef = useRef(0)
  const timerRef = useRef(null)

  useEffect(() => {
    return () => {
      timerRef.current && clearTimeout(timerRef.current)
    }
  }, [])

  const handler = (e, cb) => {
    let { target } = e
    timerRef.current && clearTimeout(timerRef.current)

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < clicksRef.current; i++) {
      target = target?.parentNode ?? target
    }

    clicksRef.current += 1

    if (clicksRef.current > 0) {
      timerRef.current = setTimeout(() => {
        clicksRef.current = 0
      }, delay)
    }

    safeCall(cb)(target)
  }

  return handler
}

export default useIncrementalTarget
