import { useContext } from 'react'

import { ConfigContext } from '../../components/config/src'

export const useConfig = (): any => {
  const config = useContext(ConfigContext)
  return config
}
