import { createContext, useContext, useMemo, type ReactNode } from 'react'

import type { UploadResult } from '../features/images'

export type WaxAppSettings = {
  citationStyleName?: string
  uploadManuscriptImage?: (
    file: File,
    manuscriptId: string,
  ) => Promise<UploadResult>
}

const WaxAppContext = createContext<WaxAppSettings>({})

type WaxAppProviderProps = WaxAppSettings & { children: ReactNode }

export const WaxAppProvider = ({
  citationStyleName,
  uploadManuscriptImage,
  children,
}: WaxAppProviderProps): ReactNode => {
  const value = useMemo(
    () => ({ citationStyleName, uploadManuscriptImage }),
    [citationStyleName, uploadManuscriptImage],
  )

  return (
    <WaxAppContext.Provider value={value}>{children}</WaxAppContext.Provider>
  )
}

export const useWaxApp = (): WaxAppSettings => useContext(WaxAppContext)
