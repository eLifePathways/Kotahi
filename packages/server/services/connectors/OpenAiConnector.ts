import Config from '../../models/config/config.model'
import Connector from './Connector'

const OPENAI_URL = 'https://api.openai.com/v1'
const OPENAI_TIMEOUT = 60000
const OPENAI_RETRIES = 3
const DEFAULT_MODEL = 'gpt-4o-mini'
const DEFAULT_MAX_TOKENS = 4096

type ContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } }

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string | ContentPart[]
}

type ChatCompletionOptions = {
  messages: ChatMessage[]
  model?: string
  maxTokens?: number
  temperature?: number
}

type ChatCompletionResponse = {
  choices: { message: { content: string | null } }[]
}

class OpenAiConnector extends Connector {
  constructor(apiKey: string) {
    super({
      baseUrl: OPENAI_URL,
      timeout: OPENAI_TIMEOUT,
      retries: OPENAI_RETRIES,
      headers: { authorization: `Bearer ${apiKey}` },
    })
  }

  // each group has its own api key
  static async forGroup(groupId: string): Promise<OpenAiConnector> {
    const config = await Config.getActive(groupId)
    const apiKey = config?.formData?.integrations?.aiDesignStudio?.apiKey

    if (!apiKey) {
      throw new Error(`No OpenAI API key configured for group ${groupId}`)
    }

    return new OpenAiConnector(apiKey)
  }

  async chatCompletion<T>(options: ChatCompletionOptions): Promise<T> {
    const {
      messages,
      model = DEFAULT_MODEL,
      maxTokens = DEFAULT_MAX_TOKENS,
      temperature = 0,
    } = options

    const data = await this.request<ChatCompletionResponse>(
      '/chat/completions',
      {
        method: 'POST',
        body: {
          model,
          messages,
          max_tokens: maxTokens,
          temperature,
          response_format: { type: 'json_object' },
        },
      },
    )

    return JSON.parse(data.choices[0]?.message.content ?? '') as T
  }
}

export default OpenAiConnector
