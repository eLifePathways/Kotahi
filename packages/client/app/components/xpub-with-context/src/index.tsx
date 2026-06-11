import React, { ReactNode, useState } from 'react'

const XpubContext = React.createContext<
  [
    { converting: boolean },
    React.Dispatch<React.SetStateAction<{ converting: boolean }>>,
  ]
>([{ converting: false }, (): void => {}])

type Props = {
  children: ReactNode
}

const XpubProvider = (props: Props): ReactNode => {
  const { children } = props
  const [state, setState] = useState({ converting: false })

  return (
    <XpubContext.Provider value={[state, setState]}>
      {children}
    </XpubContext.Provider>
  )
}

export { XpubContext, XpubProvider }
