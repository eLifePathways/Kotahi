import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import request from '../request'
import { HttpError, NetworkError, TimeoutError } from '../errors'

const URL = 'https://service.example.org/items'

const jsonResponse = (
  status: number,
  body: unknown,
  headers: Record<string, string> = {},
): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  })

const fetchMock = vi.fn<typeof fetch>()

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  fetchMock.mockReset()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('request', () => {
  describe('responses', () => {
    it('returns the status, headers and parsed JSON body', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse(200, { id: 1 }, { 'x-request-id': 'abc' }),
      )

      const response = await request<{ id: number }>(URL)

      expect(response.status).toBe(200)
      expect(response.headers.get('x-request-id')).toBe('abc')
      expect(response.data).toEqual({ id: 1 })
    })

    it('returns non-JSON bodies as text', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response('<p>Hello</p>', {
          headers: { 'content-type': 'text/html' },
        }),
      )

      const { data } = await request<string>(URL)

      expect(data).toBe('<p>Hello</p>')
    })
  })

  describe('request bodies', () => {
    it('sends plain objects as JSON', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse(200, {}))

      await request(URL, { method: 'POST', body: { title: 'A paper' } })

      const [, init] = fetchMock.mock.calls[0]
      expect(init?.method).toBe('POST')
      expect(init?.body).toBe('{"title":"A paper"}')
      expect(init?.headers).toMatchObject({
        'content-type': 'application/json',
      })
    })

    it('sends arrays as JSON', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse(200, {}))

      await request(URL, { method: 'POST', body: [1, 2] })

      const [, init] = fetchMock.mock.calls[0]
      expect(init?.body).toBe('[1,2]')
    })

    it('lets the caller override the JSON content type', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse(200, {}))

      await request(URL, {
        method: 'POST',
        body: { title: 'A paper' },
        headers: { 'content-type': 'application/vnd.api+json' },
      })

      const [, init] = fetchMock.mock.calls[0]
      expect(init?.headers).toMatchObject({
        'content-type': 'application/vnd.api+json',
      })
    })

    it('sends form data as it is, without a JSON content type', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse(200, {}))
      const form = new FormData()
      form.append('docx', new Blob(['content']), 'file.docx')

      await request(URL, { method: 'POST', body: form })

      const [, init] = fetchMock.mock.calls[0]
      expect(init?.body).toBe(form)
      expect(init?.headers).not.toHaveProperty('content-type')
    })
  })

  describe('errors', () => {
    it('throws an HttpError with the status, body and headers for unsuccessful responses', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse(404, { message: 'Not found' }, { 'x-request-id': 'abc' }),
      )

      const error = await request(URL).catch(e => e)

      expect(error).toBeInstanceOf(HttpError)
      expect(error.status).toBe(404)
      expect(error.data).toEqual({ message: 'Not found' })
      expect(error.headers.get('x-request-id')).toBe('abc')
      expect(error.message).toBe(`Request to ${URL} failed with status 404`)
    })

    it('throws a NetworkError when the request fails before a response', async () => {
      const cause = new TypeError('fetch failed')
      fetchMock.mockRejectedValueOnce(cause)

      const error = await request(URL).catch(e => e)

      expect(error).toBeInstanceOf(NetworkError)
      expect(error.cause).toBe(cause)
    })

    it('throws a TimeoutError when the timeout passes', async () => {
      fetchMock.mockImplementationOnce(
        (_, init) =>
          new Promise((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () =>
              reject(init.signal?.reason),
            )
          }),
      )

      const error = await request(URL, { timeout: 10 }).catch(e => e)

      expect(error).toBeInstanceOf(TimeoutError)
      expect(error.message).toBe(`Request to ${URL} timed out after 10ms`)
    })
  })

  describe('retries', () => {
    it('does not retry by default', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse(500, {}))

      await expect(request(URL)).rejects.toBeInstanceOf(HttpError)
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it.each([500, 503, 429])('retries %s responses', async status => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse(status, {}))
        .mockResolvedValueOnce(jsonResponse(200, { ok: true }))

      const { data } = await request(URL, { retries: 1, retryDelay: 1 })

      expect(data).toEqual({ ok: true })
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    it('retries network errors', async () => {
      fetchMock
        .mockRejectedValueOnce(new TypeError('fetch failed'))
        .mockResolvedValueOnce(jsonResponse(200, { ok: true }))

      const { data } = await request(URL, { retries: 1, retryDelay: 1 })

      expect(data).toEqual({ ok: true })
    })

    it.each([400, 401, 404])('does not retry %s responses', async status => {
      fetchMock.mockResolvedValueOnce(jsonResponse(status, {}))

      await expect(
        request(URL, { retries: 2, retryDelay: 1 }),
      ).rejects.toBeInstanceOf(HttpError)

      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('throws the last error once the retries run out', async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse(500, { attempt: 1 }))
        .mockResolvedValueOnce(jsonResponse(500, { attempt: 2 }))
        .mockResolvedValueOnce(jsonResponse(502, { attempt: 3 }))

      const error = await request(URL, { retries: 2, retryDelay: 1 }).catch(
        e => e,
      )

      expect(error.status).toBe(502)
      expect(error.data).toEqual({ attempt: 3 })
      expect(fetchMock).toHaveBeenCalledTimes(3)
    })

    it('waits longer before each retry', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout'] })

      fetchMock
        .mockResolvedValueOnce(jsonResponse(500, {}))
        .mockResolvedValueOnce(jsonResponse(500, {}))
        .mockResolvedValueOnce(jsonResponse(200, {}))

      const pending = request(URL, { retries: 2, retryDelay: 100 })

      await vi.advanceTimersByTimeAsync(99)
      expect(fetchMock).toHaveBeenCalledTimes(1)
      await vi.advanceTimersByTimeAsync(1)
      expect(fetchMock).toHaveBeenCalledTimes(2)

      await vi.advanceTimersByTimeAsync(199)
      expect(fetchMock).toHaveBeenCalledTimes(2)
      await vi.advanceTimersByTimeAsync(1)
      expect(fetchMock).toHaveBeenCalledTimes(3)

      await pending
    })
  })

  describe('Retry-After', () => {
    const NOW = new Date('2026-01-01T12:00:00Z')

    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'Date'] })
      vi.setSystemTime(NOW)
    })

    const expectRetryAfter = async (
      retryAfter: string,
      expectedDelay: number,
    ): Promise<void> => {
      fetchMock
        .mockResolvedValueOnce(
          jsonResponse(429, {}, { 'retry-after': retryAfter }),
        )
        .mockResolvedValueOnce(jsonResponse(200, {}))

      const pending = request(URL, { retries: 1, retryDelay: 1 })

      await vi.advanceTimersByTimeAsync(expectedDelay - 1)
      expect(fetchMock).toHaveBeenCalledTimes(1)
      await vi.advanceTimersByTimeAsync(1)
      expect(fetchMock).toHaveBeenCalledTimes(2)

      await pending
    }

    /* eslint-disable-next-line vitest/expect-expect */
    it('waits the number of seconds given', async () => {
      await expectRetryAfter('2', 2000)
    })

    /* eslint-disable-next-line vitest/expect-expect */
    it('waits until the date given', async () => {
      const date = new Date(NOW.getTime() + 3000).toUTCString()
      await expectRetryAfter(date, 3000)
    })

    it('falls back to the retry delay when the header is not valid', async () => {
      fetchMock
        .mockResolvedValueOnce(
          jsonResponse(429, {}, { 'retry-after': 'whenever' }),
        )
        .mockResolvedValueOnce(jsonResponse(200, {}))

      const pending = request(URL, { retries: 1, retryDelay: 50 })

      await vi.advanceTimersByTimeAsync(50)
      expect(fetchMock).toHaveBeenCalledTimes(2)

      await pending
    })

    it('gives up straight away when asked to wait more than 60 seconds', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse(429, {}, { 'retry-after': '61' }),
      )

      const error = await request(URL, { retries: 3, retryDelay: 1 }).catch(
        e => e,
      )

      expect(error.status).toBe(429)
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })
  })
})
