/* eslint-disable react/prop-types */

import { createContext, useState } from 'react'
import { ThemeProvider } from 'styled-components'

const ThemeUpdateContext = createContext()

const DynamicThemeProvider = ({ theme, children }) => {
  const [myTheme, setMyTheme] = useState(theme)

  return (
    <ThemeProvider theme={myTheme}>
      <ThemeUpdateContext.Provider value={setMyTheme}>
        {children}
      </ThemeUpdateContext.Provider>
    </ThemeProvider>
  )
}

export { ThemeUpdateContext, DynamicThemeProvider }
