/* eslint react/prop-types: 0 */
/* eslint react/destructuring-assignment: 0 */
/* eslint-disable react/display-name */

import React, { useState, useCallback } from 'react'
import { uuid } from '@coko/client'

export const PortalContext = React.createContext({
  createPortal: () => {},
  portals: [],
})

export default props => {
  const [portals, setPortals] = useState([])

  const createPortal = useCallback(
    (element, component, node, view, getPos, decorations, context) => {
      setTimeout(() => {
        setPortals(prev => [
          ...prev,
          {
            id: uuid(),
            element,
            component,
            node,
            view,
            getPos,
            decorations,
            context,
          },
        ])
      })
    },
    [],
  )

  return (
    <PortalContext.Provider value={{ createPortal, portals }}>
      {props.children}
    </PortalContext.Provider>
  )
}
