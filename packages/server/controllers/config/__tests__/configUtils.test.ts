import { describe, it, expect } from 'vitest'

import {
  hideSensitiveInformation,
  revertHiddenSensitiveInformation,
} from '../configUtils'

const secrets = (): Record<string, any> => ({
  publishing: {
    crossref: { login: 'crossref-user', password: 'crossref-pass' },
    datacite: { password: 'datacite-pass' },
    doaj: { password: 'doaj-pass' },
    hypothesis: { apiKey: 'hypothesis-key', group: 'hypothesis-group' },
    webhook: { url: 'https://hook.example.org', token: 'webhook-token' },
  },
  integrations: {
    aiDesignStudio: { apiKey: 'sk-openai' },
    localContextApiKey: { apiKey: 'local-contexts-key' },
    kotahiApis: { tokens: 'kotahi-token' },
    coarNotify: { authToken: 'coar-token' },
  },
  emailNotification: { user: 'mailer', pass: 'email-pass' },
  notification: { gmailAuthPassword: 'gmail-pass' },
})

const MASK = '**********'

describe('hideSensitiveInformation', () => {
  it('masks the credentials Kotahi uses for other services, hiding their length', async () => {
    const { formData } = await hideSensitiveInformation({ formData: secrets() })

    expect(formData.publishing.crossref.password).toBe(MASK)
    expect(formData.publishing.datacite.password).toBe(MASK)
    expect(formData.publishing.doaj.password).toBe(MASK)
    expect(formData.publishing.hypothesis.apiKey).toBe(MASK)
    expect(formData.publishing.webhook.token).toBe(MASK)
    expect(formData.integrations.aiDesignStudio.apiKey).toBe(MASK)

    expect(formData.integrations.localContextApiKey.apiKey).toBe(MASK)

    expect(formData.emailNotification.pass).toBe(MASK)
    expect(formData.notification.gmailAuthPassword).toBe(MASK)
  })

  it('leaves other fields as they are, including tokens admins hand out', async () => {
    const { formData } = await hideSensitiveInformation({ formData: secrets() })

    expect(formData.publishing.crossref.login).toBe('crossref-user')
    expect(formData.publishing.hypothesis.group).toBe('hypothesis-group')
    expect(formData.publishing.webhook.url).toBe('https://hook.example.org')
    expect(formData.emailNotification.user).toBe('mailer')
    expect(formData.integrations.kotahiApis.tokens).toBe('kotahi-token')
    expect(formData.integrations.coarNotify.authToken).toBe('coar-token')
  })

  it('does not add fields that are not set', async () => {
    const { formData } = await hideSensitiveInformation({
      formData: { publishing: {} },
    })

    expect(formData).toEqual({ publishing: {} })
  })
})

describe('revertHiddenSensitiveInformation', () => {
  it('puts back the stored values of secrets that are still masked', async () => {
    const existingConfig = { formData: secrets() }

    const { formData: masked } = await hideSensitiveInformation({
      formData: secrets(),
    })

    const formData = await revertHiddenSensitiveInformation(
      existingConfig,
      masked,
    )

    expect(formData).toEqual(secrets())
  })

  it('keeps secrets that were changed', async () => {
    const existingConfig = { formData: secrets() }

    const formData = await revertHiddenSensitiveInformation(existingConfig, {
      ...secrets(),
      integrations: {
        ...secrets().integrations,
        aiDesignStudio: { apiKey: 'sk-new' },
      },
    })

    expect(formData.integrations.aiDesignStudio.apiKey).toBe('sk-new')
  })

  it('keeps secrets that were cleared', async () => {
    const existingConfig = { formData: secrets() }

    const formData = await revertHiddenSensitiveInformation(existingConfig, {
      ...secrets(),
      emailNotification: { user: 'mailer', pass: '' },
    })

    expect(formData.emailNotification.pass).toBe('')
  })
})
