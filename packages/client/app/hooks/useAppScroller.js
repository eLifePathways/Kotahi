/* eslint-disable react-hooks/exhaustive-deps, react-hooks/immutability, react-hooks/set-state-in-effect */
/* eslint-disable consistent-return */
/* eslint-disable no-return-assign */

import { useState, useEffect } from 'react'

export const useAppScroller = () => {
  const [ref, setRef] = useState(null)

  useEffect(() => {
    if (!ref) setRef(document.getElementById('main'))
  })

  const scrollToTop = () => {
    const elem = ref || document.getElementById('main')
    if (elem) return (elem.scrollTop = 0)
  }

  const scrollToBottom = () => {
    const elem = ref || document.getElementById('main')
    if (elem) return (elem.scrollTop = elem.scrollHeight - elem.clientHeight)
  }

  const scrollTo = pos => {
    const elem = ref || document.getElementById('main')
    if (elem) return (elem.scrollTop = pos)
  }

  return { scrollToTop, scrollTo, scrollToBottom, ref }
}
