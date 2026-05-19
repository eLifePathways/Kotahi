/* eslint-disable react/prop-types */

import React from 'react'

const ConfigContext = React.createContext()

const ConfigProvider = ({ config, children }) => (
  <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
)

export { ConfigContext, ConfigProvider }
