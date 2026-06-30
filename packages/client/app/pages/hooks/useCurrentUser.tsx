import { createContext, useContext } from 'react'

type CurrentUser = { id: string /* ... */ }

export const CurrentUserContext = createContext<CurrentUser | null>(null)

/* eslint-disable-next-line @typescript-eslint/explicit-function-return-type */
export const useCurrentUser = () => {
  const user = useContext(CurrentUserContext)

  if (!user)
    throw new Error('useCurrentUser must be used inside AuthenticatedPage')

  return user
}
