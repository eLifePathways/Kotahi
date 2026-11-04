const axios = require('axios')

const { callOn } = require('./utils')
const { systemPrompt } = require('./helpers')
const Config = require('../../models/config/config.model')

const COMPLETIONS_ENDPOINT = 'https://api.openai.com/v1/chat/completions'
const GPT_MODEL = 'gpt-4o-mini'

const getHeaders = async CHAT_GPT_KEY => {
  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${CHAT_GPT_KEY}`,
    },
    hasKey: !!CHAT_GPT_KEY,
  }
}

const userMessages = (msgs = {}) => ({
  role: 'user',
  content: Object.entries(msgs).flatMap(([type, inputSrc]) =>
    inputSrc.map(input =>
      callOn(type, {
        text: () => ({ type, [type]: input }),
        image_url: () => ({ type, [type]: { url: input } }),
        default: () => input,
      }),
    ),
  ),
})

const systemMessage = content => ({ role: 'system', content })

const openAi = async ({
  input,
  history = [],
  groupId,
  format = 'json_object',
  system: passedSystem = { text: `You're a helpful assistant` },
}) => {
  try {
    const activeConfig = await Config.getCached(groupId)
    const { apiKey } = activeConfig.formData?.integrations?.aiDesignStudio ?? {}
    const CHAT_GPT_KEY = apiKey
    const { headers, hasKey } = await getHeaders(CHAT_GPT_KEY)

    if (!hasKey) {
      throw new Error('Missing access key')
    }

    const system = systemMessage(systemPrompt(passedSystem))
    const messages = [system, ...history, userMessages(input)]

    const payload = {
      model: GPT_MODEL,
      messages,
      response_format: { type: format },
      max_tokens: 4096,
      temperature: 0,
    }

    const response = await axios.post(COMPLETIONS_ENDPOINT, payload, {
      headers,
    })

    return JSON.stringify(response.data.choices[0])
  } catch (e) {
    throw new Error(`openAi controller: ${e.message}`)
  }
}

module.exports = { openAi }
