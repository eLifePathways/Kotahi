import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import Connector, { type ConnectorOptions } from '../Connector'
import { HttpError } from '../errors'

const jsonResponse = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })

class TestConnector extends Connector {
  authHeaders: Record<string, string> = {}
  canRecoverFromUnauthorized = false
  getAuthHeadersCalls = 0
  onUnauthorizedCalls = 0

  constructor(options: Partial<ConnectorOptions> = {}) {
    super({ baseUrl: 'https://service.example.org/v1', ...options })
  }

  protected async getAuthHeaders(): Promise<Record<string, string>> {
    this.getAuthHeadersCalls += 1
    return this.authHeaders
  }

  protected async onUnauthorized(): Promise<boolean> {
    this.onUnauthorizedCalls += 1
    return this.canRecoverFromUnauthorized
  }

  call<T>(
    path: string,
    options?: Parameters<Connector['request']>[1],
  ): Promise<T> {
    return this.request<T>(path, options)
  }
}

const fetchMock = vi.fn<typeof fetch>()

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  fetchMock.mockReset()
  vi.unstubAllGlobals()
})

const requestedUrl = (call = 0): string => String(fetchMock.mock.calls[call][0])

const requestedHeaders = (call = 0): Record<string, string> =>
  fetchMock.mock.calls[call][1]?.headers as Record<string, string>

describe('Connector', () => {
  describe('URLs', () => {
    it.each([
      ['https://service.example.org/v1', 'items'],
      ['https://service.example.org/v1', '/items'],
      ['https://service.example.org/v1/', '/items'],
      ['https://service.example.org/v1//', '//items'],
    ])('joins %s and %s with a single slash', async (baseUrl, path) => {
      fetchMock.mockResolvedValueOnce(jsonResponse(200, {}))

      await new TestConnector({ baseUrl }).call(path)

      expect(requestedUrl()).toBe('https://service.example.org/v1/items')
    })
  })

  describe('responses', () => {
    it('returns only the response body', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse(200, { id: 1 }))

      const data = await new TestConnector().call('items')

      expect(data).toEqual({ id: 1 })
    })
  })

  describe('headers', () => {
    it('sends connector-wide headers with every request', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse(200, {}))
      const connector = new TestConnector({ headers: { 'x-client': 'kotahi' } })

      await connector.call('items')

      expect(requestedHeaders()).toMatchObject({ 'x-client': 'kotahi' })
    })

    it('lets auth headers override connector-wide headers, and request headers override both', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse(200, {}))

      const connector = new TestConnector({
        headers: { a: 'connector', b: 'connector', c: 'connector' },
      })

      connector.authHeaders = { b: 'auth', c: 'auth' }

      await connector.call('items', { headers: { c: 'request' } })

      expect(requestedHeaders()).toMatchObject({
        a: 'connector',
        b: 'auth',
        c: 'request',
      })
    })

    it('leaves out auth headers when authenticate is false', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse(200, {}))
      const connector = new TestConnector()
      connector.authHeaders = { authorization: 'Bearer token' }

      await connector.call('items', { authenticate: false })

      expect(requestedHeaders()).not.toHaveProperty('authorization')
      expect(connector.getAuthHeadersCalls).toBe(0)
    })
  })

  describe('unauthorized responses', () => {
    it('retries once with fresh auth headers when the connector recovers', async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse(401, {}))
        .mockResolvedValueOnce(jsonResponse(200, { ok: true }))

      const connector = new TestConnector()
      connector.canRecoverFromUnauthorized = true
      connector.authHeaders = { authorization: 'Bearer old' }

      const pending = connector.call('items')
      connector.authHeaders = { authorization: 'Bearer new' }

      expect(await pending).toEqual({ ok: true })
      expect(connector.onUnauthorizedCalls).toBe(1)
      expect(requestedHeaders(1)).toMatchObject({ authorization: 'Bearer new' })
    })

    it('does not retry a second time if the retry is also unauthorized', async () => {
      fetchMock.mockImplementation(async () => jsonResponse(401, {}))
      const connector = new TestConnector()
      connector.canRecoverFromUnauthorized = true

      const error = await connector.call('items').catch(e => e)

      expect(error).toBeInstanceOf(HttpError)
      expect(error.status).toBe(401)
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    it('throws when the connector cannot recover', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse(401, {}))
      const connector = new TestConnector()

      await expect(connector.call('items')).rejects.toBeInstanceOf(HttpError)
      expect(connector.onUnauthorizedCalls).toBe(1)
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('does not try to recover when authenticate is false', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse(401, {}))
      const connector = new TestConnector()
      connector.canRecoverFromUnauthorized = true

      await expect(
        connector.call('items', { authenticate: false }),
      ).rejects.toBeInstanceOf(HttpError)

      expect(connector.onUnauthorizedCalls).toBe(0)
    })

    it('does not try to recover from other errors', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse(403, {}))
      const connector = new TestConnector()
      connector.canRecoverFromUnauthorized = true

      await expect(connector.call('items')).rejects.toBeInstanceOf(HttpError)
      expect(connector.onUnauthorizedCalls).toBe(0)
    })
  })

  describe('options', () => {
    it("uses the connector's retry settings", async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse(500, {}))
        .mockResolvedValueOnce(jsonResponse(200, { ok: true }))

      const connector = new TestConnector({ retries: 1, retryDelay: 1 })

      expect(await connector.call('items')).toEqual({ ok: true })
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })
  })
})
