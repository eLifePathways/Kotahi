export class RequestError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'RequestError'
  }
}

export class NetworkError extends RequestError {
  constructor(url: string, cause: unknown) {
    super(`Request to ${url} failed before getting a response`, { cause })
    this.name = 'NetworkError'
  }
}

export class TimeoutError extends RequestError {
  constructor(url: string, timeout: number) {
    super(`Request to ${url} timed out after ${timeout}ms`)
    this.name = 'TimeoutError'
  }
}

export class HttpError extends RequestError {
  readonly status: number
  readonly data: unknown
  readonly headers: Headers

  constructor(url: string, status: number, data: unknown, headers: Headers) {
    super(`Request to ${url} failed with status ${status}`)
    this.name = 'HttpError'
    this.status = status
    this.data = data
    this.headers = headers
  }
}
