/* eslint-disable react/prop-types */

import { createContext } from 'react'

const WaxAppContext = createContext({
  textStyles: undefined,
  citationStyleName: undefined,
  uploadManuscriptImage: undefined,
})

export const WaxAppProvider = ({
  textStyles,
  citationStyleName,
  uploadManuscriptImage,
  children,
}) => (
  <WaxAppContext.Provider
    value={{ textStyles, citationStyleName, uploadManuscriptImage }}
  >
    {children}
  </WaxAppContext.Provider>
)

export default WaxAppContext
