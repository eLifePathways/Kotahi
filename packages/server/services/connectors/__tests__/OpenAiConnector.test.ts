import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { z } from '@coko/server'

import OpenAiConnector from '../OpenAiConnector'

const completion = (content: string | null): Response =>
  new Response(JSON.stringify({ choices: [{ message: { content } }] }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })

const schema = z.strictObject({ title: z.string() })

const messages = [{ role: 'user' as const, content: 'Find the title' }]

const fetchMock = vi.fn<typeof fetch>()

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  fetchMock.mockReset()
  vi.unstubAllGlobals()
})

const sentBody = (): Record<string, any> =>
  JSON.parse(String(fetchMock.mock.calls[0][1]?.body))

describe('OpenAiConnector', () => {
  describe('chatCompletion', () => {
    it('posts to the chat completions endpoint with the API key', async () => {
      fetchMock.mockResolvedValueOnce(completion('{"title":"A paper"}'))

      await new OpenAiConnector('sk-test').chatCompletion({ messages, schema })

      const [url, init] = fetchMock.mock.calls[0]
      expect(String(url)).toBe('https://api.openai.com/v1/chat/completions')
      expect(init?.method).toBe('POST')
      expect(init?.headers).toMatchObject({ authorization: 'Bearer sk-test' })
    })

    it('sends the messages and default settings', async () => {
      fetchMock.mockResolvedValueOnce(completion('{"title":"A paper"}'))

      await new OpenAiConnector('sk-test').chatCompletion({ messages, schema })

      expect(sentBody()).toMatchObject({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 4096,
        temperature: 0,
      })
    })

    it('sends the schema as a strict JSON schema', async () => {
      fetchMock.mockResolvedValueOnce(completion('{"title":"A paper"}'))

      await new OpenAiConnector('sk-test').chatCompletion({
        messages,
        schema,
        schemaName: 'submission',
      })

      const { response_format: responseFormat } = sentBody()

      expect(responseFormat.type).toBe('json_schema')
      expect(responseFormat.json_schema.name).toBe('submission')
      expect(responseFormat.json_schema.strict).toBe(true)
      expect(responseFormat.json_schema.schema).not.toHaveProperty('$schema')

      expect(responseFormat.json_schema.schema).toMatchObject({
        type: 'object',
        properties: { title: { type: 'string' } },
        required: ['title'],
        additionalProperties: false,
      })
    })

    it('uses the given model and settings', async () => {
      fetchMock.mockResolvedValueOnce(completion('{"title":"A paper"}'))

      await new OpenAiConnector('sk-test').chatCompletion({
        messages,
        schema,
        model: 'gpt-4o',
        maxTokens: 100,
        temperature: 0.5,
      })

      expect(sentBody()).toMatchObject({
        model: 'gpt-4o',
        max_tokens: 100,
        temperature: 0.5,
      })
    })

    it('returns the reply parsed and validated with the schema', async () => {
      fetchMock.mockResolvedValueOnce(completion('{"title":"A paper"}'))

      const result = await new OpenAiConnector('sk-test').chatCompletion({
        messages,
        schema,
      })

      expect(result).toEqual({ title: 'A paper' })
    })

    it('throws when the reply does not match the schema', async () => {
      fetchMock.mockResolvedValueOnce(completion('{"title":42}'))

      await expect(
        new OpenAiConnector('sk-test').chatCompletion({ messages, schema }),
      ).rejects.toThrow()
    })

    it('throws when the reply has no content', async () => {
      fetchMock.mockResolvedValueOnce(completion(null))

      await expect(
        new OpenAiConnector('sk-test').chatCompletion({ messages, schema }),
      ).rejects.toThrow()
    })
  })
})
