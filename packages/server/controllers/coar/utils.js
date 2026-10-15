const { default: axios } = require('axios')
const { logger, request } = require('@coko/server')

const apiUrl = 'https://api.ror.org/v2/organizations'

// Truncated exponential backoff with jitter: waits of roughly 1s, 2s and 4s
// (plus up to 1s of jitter each), unless the inbox asks for a Retry-After.
const INBOX_MAX_RETRIES = 3
const INBOX_BASE_DELAY_MS = 1000
const INBOX_MAX_JITTER_MS = 1000
const INBOX_MAX_DELAY_MS = 10000

const RETRYABLE_STATUSES = [408, 429, 500, 502, 503, 504]

const getRorOrganisation = async value => {
  const id = value.split('/').pop()

  try {
    const { data } = await axios.get(`${apiUrl}/${id}`, {})

    const rorDisplay =
      data.names?.find(n => n.types.includes('ror_display'))?.value ?? ''

    return rorDisplay
    /* eslint-disable-next-line */
  } catch (error) {
    logger.error('Failed to get organisation for ROR', id)
    return ''
  }
}

const isRetryable = error => {
  const status = error.response?.status

  // No response means the request never reached the inbox (e.g. DNS, reset)
  if (!status) return !!error.request

  return RETRYABLE_STATUSES.includes(status)
}

// Retry-After is either a number of seconds or an HTTP date
const getRetryAfterMs = error => {
  const retryAfter = error.response?.headers?.['retry-after']

  if (!retryAfter) return null

  const seconds = Number(retryAfter)

  if (!Number.isNaN(seconds)) return seconds * 1000

  const date = Date.parse(retryAfter)

  return Number.isNaN(date) ? null : Math.max(date - Date.now(), 0)
}

const getRetryDelayMs = (retryCount, error) => {
  const retryAfterMs = getRetryAfterMs(error)

  const delay =
    retryAfterMs ??
    INBOX_BASE_DELAY_MS * 2 ** retryCount + Math.random() * INBOX_MAX_JITTER_MS

  return Math.min(delay, INBOX_MAX_DELAY_MS)
}

const wait = ms =>
  new Promise(resolve => {
    setTimeout(resolve, ms)
  })

/**
 * POSTs a COAR Notify payload to an LDN inbox, retrying transient failures
 * (network errors, 408, 429 and 5xx gateway errors). Retries resend the same
 * payload, so the receiver can deduplicate on its id.
 * @param {string} url The destination inbox URL
 * @param {object} payload The COAR Notify payload to be sent
 * @returns {Promise<object>}
 */
const postToInbox = async (url, payload) => {
  const data = typeof payload === 'string' ? payload : JSON.stringify(payload)

  for (let retryCount = 0; ; retryCount += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await request({
        method: 'post',
        url,
        headers: { 'Content-Type': 'application/json' },
        data,
      })
    } catch (error) {
      if (retryCount >= INBOX_MAX_RETRIES || !isRetryable(error)) throw error

      const delay = getRetryDelayMs(retryCount, error)

      logger.warn(
        `COAR: POST to ${url} failed (${error.response?.status ?? error.code}), retrying in ${Math.round(delay)}ms`,
      )

      // eslint-disable-next-line no-await-in-loop
      await wait(delay)
    }
  }
}

module.exports = {
  getRorOrganisation,
  postToInbox,
}
