import request, { type RequestOptions } from './request'
import { HttpError } from './errors'

export type ConnectorOptions = {
  baseUrl: string
  timeout?: number
  retries?: number
  retryDelay?: number
  headers?: Record<string, string>
}

type ConnectorRequestOptions = Omit<
  RequestOptions,
  'timeout' | 'retries' | 'retryDelay'
> & {
  authenticate?: boolean
}

class Connector {
  protected readonly baseUrl: string
  private readonly timeout?: number
  private readonly retries?: number
  private readonly retryDelay?: number
  private readonly headers: Record<string, string>

  constructor(options: ConnectorOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, '')
    this.timeout = options.timeout
    this.retries = options.retries
    this.retryDelay = options.retryDelay
    this.headers = options.headers ?? {}
  }

  // eslint-disable-next-line class-methods-use-this
  protected async getAuthHeaders(): Promise<Record<string, string>> {
    return {}
  }

  // eslint-disable-next-line class-methods-use-this
  protected async onUnauthorized(): Promise<boolean> {
    return false
  }

  protected async request<T>(
    path: string,
    options: ConnectorRequestOptions = {},
  ): Promise<T> {
    const { authenticate = true, ...requestOptions } = options

    const send = async (): Promise<T> => {
      const authHeaders = authenticate ? await this.getAuthHeaders() : {}

      const url = `${this.baseUrl}/${path.replace(/^\/+/, '')}`

      const { data } = await request<T>(url, {
        ...requestOptions,
        headers: { ...this.headers, ...authHeaders, ...requestOptions.headers },
        timeout: this.timeout,
        retries: this.retries,
        retryDelay: this.retryDelay,
      })

      return data
    }

    try {
      return await send()
    } catch (error) {
      const isUnauthorized = error instanceof HttpError && error.status === 401

      if (authenticate && isUnauthorized && (await this.onUnauthorized())) {
        return send()
      }

      throw error
    }
  }
}

export default Connector
