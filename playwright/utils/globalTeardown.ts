import { apiUrl } from './constants'

const globalTeardown = async (): Promise<void> => {
  await fetch(`${apiUrl}/deleteTestGroupsByPrefix/pw-`, { method: 'POST' })
  await fetch(`${apiUrl}/deleteSharedUsers`, { method: 'POST' })
}

export default globalTeardown
