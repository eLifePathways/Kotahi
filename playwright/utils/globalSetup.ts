import { apiUrl } from './constants'

const globalSetup = async (): Promise<void> => {
  await fetch(`${apiUrl}/deleteTestGroupsByPrefix/pw-`, { method: 'POST' })
}

export default globalSetup
