/* eslint-disable react/prop-types */

import React, { useState } from 'react'

const XpubContext = React.createContext([{ converting: false }, () => {}])

const XpubProvider = props => {
  const { children } = props
  const [state, setState] = useState({ converting: false })

  return (
    <XpubContext.Provider value={[state, setState]}>
      {children}
    </XpubContext.Provider>
  )
}

export { XpubContext, XpubProvider }
