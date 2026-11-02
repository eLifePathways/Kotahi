import Connector, { type ConnectorOptions } from './Connector'

export type CokoServiceConfig = {
  clientId: string
  clientSecret: string
  protocol: string
  host: string
  port?: string | number
}

class CokoServiceConnector extends Connector {
  private readonly config: CokoServiceConfig

  private accessToken: Promise<string> | null = null

  constructor(
    config: CokoServiceConfig,
    options: Omit<ConnectorOptions, 'baseUrl'> = {},
  ) {
    super({ ...options, baseUrl: CokoServiceConnector.serviceUrl(config) })
    this.config = config
  }

  private static serviceUrl(config: CokoServiceConfig): string {
    const { protocol, host, port } = config
    return `${protocol}://${host}${port ? `:${port}` : ''}`
  }

  async healthCheck(): Promise<boolean> {
    const data = await this.request<{ message?: string }>('/healthcheck', {
      authenticate: false,
    })

    return data.message === 'Coolio'
  }

  protected async getAuthHeaders(): Promise<Record<string, string>> {
    return { authorization: `Bearer ${await this.getAccessToken()}` }
  }

  protected async onUnauthorized(): Promise<boolean> {
    this.accessToken = null
    return true
  }

  private getAccessToken(): Promise<string> {
    if (!this.accessToken) {
      this.accessToken = this.fetchAccessToken().catch(error => {
        this.accessToken = null
        throw error
      })
    }

    return this.accessToken
  }

  private async fetchAccessToken(): Promise<string> {
    const isHealthy = await this.healthCheck()
    if (!isHealthy) throw new Error(`Service at ${this.baseUrl} is down`)

    const credentials = Buffer.from(
      `${this.config.clientId}:${this.config.clientSecret}`,
      'utf8',
    ).toString('base64')

    const data = await this.request<{ accessToken: string }>('/api/auth', {
      method: 'POST',
      authenticate: false,
      headers: { authorization: `Basic ${credentials}` },
    })

    return data.accessToken
  }
}

export default CokoServiceConnector
