import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import CokoServiceConnector, {
  type CokoServiceConfig,
} from '../CokoServiceConnector'

const CONFIG: CokoServiceConfig = {
  clientId: 'client',
  clientSecret: 'secret',
  protocol: 'http',
  host: 'xsweet',
  port: 3004,
}

const jsonResponse = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })

class TestService extends CokoServiceConnector {
  call<T>(path: string): Promise<T> {
    return this.request<T>(path)
  }
}

type Service = {
  healthy: boolean
  authFails: boolean
  tokens: string[]
  validToken: () => string
  rejectNextRequest: boolean
}

const fetchMock = vi.fn<typeof fetch>()
let service: Service

const mockService = (): void => {
  fetchMock.mockImplementation(async (url, init) => {
    const { pathname } = new URL(String(url))
    const headers = (init?.headers ?? {}) as Record<string, string>

    if (pathname === '/healthcheck') {
      return jsonResponse(200, { message: service.healthy ? 'Coolio' : 'Nope' })
    }

    if (pathname === '/api/auth') {
      if (service.authFails) return jsonResponse(403, {})
      const token = `token-${service.tokens.length + 1}`
      service.tokens.push(token)
      return jsonResponse(200, { accessToken: token })
    }

    if (service.rejectNextRequest) {
      service.rejectNextRequest = false
      return jsonResponse(401, {})
    }

    if (headers.authorization !== `Bearer ${service.validToken()}`) {
      return jsonResponse(401, {})
    }

    return jsonResponse(200, { path: pathname })
  })
}

const callsTo = (pathname: string): Parameters<typeof fetch>[] =>
  fetchMock.mock.calls.filter(
    ([url]) => new URL(String(url)).pathname === pathname,
  )

beforeEach(() => {
  service = {
    healthy: true,
    authFails: false,
    tokens: [],
    validToken: (): string => service.tokens[service.tokens.length - 1],
    rejectNextRequest: false,
  }

  vi.stubGlobal('fetch', fetchMock)
  mockService()
})

afterEach(() => {
  fetchMock.mockReset()
  vi.unstubAllGlobals()
})

describe('CokoServiceConnector', () => {
  describe('service URL', () => {
    it('builds the URL from the protocol, host and port', async () => {
      await new TestService(CONFIG).healthCheck()

      expect(String(fetchMock.mock.calls[0][0])).toBe(
        'http://xsweet:3004/healthcheck',
      )
    })

    it('leaves out the port when there is none', async () => {
      await new TestService({ ...CONFIG, port: undefined }).healthCheck()

      expect(String(fetchMock.mock.calls[0][0])).toBe(
        'http://xsweet/healthcheck',
      )
    })
  })

  describe('healthCheck', () => {
    it('is true when the service answers "Coolio"', async () => {
      expect(await new TestService(CONFIG).healthCheck()).toBe(true)
    })

    it('is false otherwise', async () => {
      service.healthy = false
      expect(await new TestService(CONFIG).healthCheck()).toBe(false)
    })

    it('does not authenticate', async () => {
      await new TestService(CONFIG).healthCheck()

      expect(callsTo('/api/auth')).toHaveLength(0)
      expect(fetchMock.mock.calls[0][1]?.headers).not.toHaveProperty(
        'authorization',
      )
    })
  })

  describe('authentication', () => {
    it('gets a token with the client credentials before the first request', async () => {
      const data = await new TestService(CONFIG).call('/api/items')

      expect(data).toEqual({ path: '/api/items' })

      const [[, authInit]] = callsTo('/api/auth')
      const expected = Buffer.from('client:secret').toString('base64')

      expect(authInit?.method).toBe('POST')
      expect(authInit?.headers).toMatchObject({
        authorization: `Basic ${expected}`,
      })
    })

    it('checks that the service is up before getting a token', async () => {
      await new TestService(CONFIG).call('/api/items')

      const paths = fetchMock.mock.calls.map(
        ([url]) => new URL(String(url)).pathname,
      )

      expect(paths).toEqual(['/healthcheck', '/api/auth', '/api/items'])
    })

    it('reuses the token for later requests', async () => {
      const connector = new TestService(CONFIG)

      await connector.call('/api/items')
      await connector.call('/api/items')

      expect(callsTo('/api/auth')).toHaveLength(1)
    })

    it('gets a single token for concurrent requests', async () => {
      const connector = new TestService(CONFIG)

      await Promise.all([
        connector.call('/api/items'),
        connector.call('/api/items'),
        connector.call('/api/items'),
      ])

      expect(callsTo('/api/auth')).toHaveLength(1)
    })

    it('gets a new token and retries when a request is unauthorized', async () => {
      const connector = new TestService(CONFIG)
      await connector.call('/api/items')

      service.rejectNextRequest = true
      const data = await connector.call('/api/items')

      expect(data).toEqual({ path: '/api/items' })
      expect(service.tokens).toEqual(['token-1', 'token-2'])

      const lastCall = fetchMock.mock.calls[fetchMock.mock.calls.length - 1]
      expect(lastCall[1]?.headers).toMatchObject({
        authorization: 'Bearer token-2',
      })
    })

    it('throws when the service is down', async () => {
      service.healthy = false

      await expect(new TestService(CONFIG).call('/api/items')).rejects.toThrow(
        'Service at http://xsweet:3004 is down',
      )
    })

    it('tries to get a token again after a failure', async () => {
      const connector = new TestService(CONFIG)
      service.authFails = true

      await expect(connector.call('/api/items')).rejects.toThrow()

      service.authFails = false
      const data = await connector.call('/api/items')

      expect(data).toEqual({ path: '/api/items' })
      expect(callsTo('/api/auth')).toHaveLength(2)
    })
  })
})
