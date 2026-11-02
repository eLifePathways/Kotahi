import { HttpError, NetworkError, TimeoutError } from './errors'

type FetchBody = NonNullable<Parameters<typeof fetch>[1]>['body']

export type RequestOptions = {
  method?: string
  headers?: Record<string, string>
  body?: FetchBody | Record<string, unknown> | unknown[]
  timeout?: number
  retries?: number
  retryDelay?: number
}

export type RequestResponse<T> = {
  status: number
  headers: Headers
  data: T
}

const DEFAULT_TIMEOUT = 30000
const DEFAULT_RETRY_DELAY = 1000
const MAX_RETRY_AFTER = 60000

const wait = (ms: number): Promise<void> =>
  new Promise(resolve => {
    setTimeout(resolve, ms)
  })

const parseBody = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) return response.json()
  return response.text()
}

// returns a boolean, but also restricts the types of body
const isJsonBody = (
  body: RequestOptions['body'],
): body is Record<string, unknown> | unknown[] => {
  if (Array.isArray(body)) return true
  if (body === null || typeof body !== 'object') return false

  // make sure that we have a plain object (as opposed to a class, blob etc, that would also be a typeof object in js)
  const prototype = Object.getPrototypeOf(body)
  return prototype === Object.prototype || prototype === null
}

const shouldRetry = (error: unknown): boolean =>
  error instanceof NetworkError ||
  (error instanceof HttpError && (error.status === 429 || error.status >= 500))

const getRetryAfter = (error: unknown): number | null => {
  if (!(error instanceof HttpError)) return null

  const value = error.headers.get('retry-after')
  if (!value) return null

  const seconds = Number(value)
  if (!Number.isNaN(seconds)) return seconds * 1000

  const date = Date.parse(value)
  if (Number.isNaN(date)) return null

  return Math.max(0, date - Date.now())
}

const send = async <T>(
  url: string,
  options: RequestOptions,
): Promise<RequestResponse<T>> => {
  const { method = 'GET', headers = {}, body } = options
  const timeout = options.timeout ?? DEFAULT_TIMEOUT
  const isJson = isJsonBody(body)

  let response: Response

  try {
    response = await fetch(url, {
      method,
      headers: isJson
        ? { 'content-type': 'application/json', ...headers }
        : headers,
      body: isJson ? JSON.stringify(body) : body,
      signal: AbortSignal.timeout(timeout),
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      throw new TimeoutError(url, timeout)
    }

    throw new NetworkError(url, error)
  }

  const data = await parseBody(response)

  if (!response.ok) {
    throw new HttpError(url, response.status, data, response.headers)
  }

  return { status: response.status, headers: response.headers, data: data as T }
}

const request = async <T>(
  url: string,
  options: RequestOptions = {},
): Promise<RequestResponse<T>> => {
  const { retries = 0, retryDelay = DEFAULT_RETRY_DELAY } = options

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await send<T>(url, options)
    } catch (error) {
      if (attempt === retries || !shouldRetry(error)) throw error

      const delay = getRetryAfter(error) ?? (attempt + 1) * retryDelay
      if (delay > MAX_RETRY_AFTER) throw error

      // eslint-disable-next-line no-await-in-loop
      await wait(delay)
    }
  }

  // we should never get here, only here to satisfy typescript
  throw new Error('Unreachable: the retry loop always returns or throws')
}

export default request
