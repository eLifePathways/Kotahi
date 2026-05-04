/* eslint-disable react-hooks/exhaustive-deps, react-hooks/use-memo */
/* eslint-disable react/prop-types */

import { useEffect, useCallback } from 'react'
import { throttle } from 'lodash'

function UserActivityTracker({ reportUserIsActive, children }) {
  const throttledReportUserIsActive = useCallback(
    throttle(reportUserIsActive, 60000, { leading: true }),
    [],
  )

  useEffect(() => {
    const listener = throttledReportUserIsActive
    window.addEventListener('mousemove', listener, true)
    window.addEventListener('keydown', listener, true)

    return () => {
      window.removeEventListener('mousemove', listener, true)
      window.removeEventListener('keydown', listener, true)
      reportUserIsActive()
    }
  }, [])

  return <>{children}</>
}

export default UserActivityTracker
