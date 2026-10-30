import {
  describe,
  beforeAll,
  beforeEach,
  afterEach,
  afterAll,
  it,
  expect,
  vi,
} from 'vitest'
import { db, config, DbTestUtils, migrationManager, uuid } from '@coko/server'

import Group from '../../models/group/group.model'
import Config from '../../models/config/config.model'
import Form from '../../models/form/form.model'
import { prefillSubmission } from '../submissionPrefill.controllers'

const titleField = {
  id: uuid(),
  component: 'TextField',
  name: 'submission.$title',
  aiPrompt: 'The title of the paper',
}

const authorsField = {
  id: uuid(),
  component: 'AuthorsInput',
  name: 'submission.$authors',
  aiPrompt: 'The authors of the paper',
}

const abstractField = {
  id: uuid(),
  component: 'AbstractEditor',
  name: 'submission.$abstract',
}

const aiConfig = {
  groupIdentity: { toggleAi: true, AiSubmission: true },
  integrations: { aiDesignStudio: { apiKey: 'sk-test' } },
}

const completion = (content: Record<string, unknown>): Response =>
  new Response(
    JSON.stringify({
      choices: [{ message: { content: JSON.stringify(content) } }],
    }),
    { status: 200, headers: { 'content-type': 'application/json' } },
  )

const fetchMock = vi.fn<typeof fetch>()

const sentBody = (): Record<string, any> =>
  JSON.parse(String(fetchMock.mock.calls[0][1]?.body))

const setUpGroup = async ({
  formData = aiConfig,
  fields = [titleField, authorsField, abstractField],
  withForm = true,
}: {
  formData?: Record<string, unknown>
  fields?: Record<string, unknown>[]
  withForm?: boolean
} = {}): Promise<string> => {
  const group = await Group.insert({})

  await Config.insert({ groupId: group.id, active: true, formData })

  if (withForm) {
    // @ts-ignore
    await Form.insert({
      groupId: group.id,
      purpose: 'submit',
      category: 'submission',
      structure: { name: 'Submission', children: fields },
    })
  }

  return group.id
}

describe('prefillSubmission', () => {
  beforeAll(async () => {
    await config.init()
    db.init()
    await migrationManager.migrate()
  })

  beforeEach(async () => {
    await DbTestUtils.clearDb()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    fetchMock.mockReset()
    vi.unstubAllGlobals()
  })

  afterAll(async () => {
    await DbTestUtils.clearDb()
  })

  describe('when it should not run', () => {
    it.each([
      ['AI is off', { ...aiConfig, groupIdentity: { toggleAi: false } }],
      [
        'AI is not enabled for submissions',
        { ...aiConfig, groupIdentity: { toggleAi: true, AiSubmission: false } },
      ],
    ])('returns nothing when %s', async (_, formData) => {
      const groupId = await setUpGroup({ formData })

      expect(await prefillSubmission(groupId, '<p>Text</p>')).toEqual({})
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('returns nothing when the group has no active config', async () => {
      const group = await Group.insert({})

      expect(await prefillSubmission(group.id, '<p>Text</p>')).toEqual({})
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('returns nothing when no field has an AI prompt', async () => {
      const groupId = await setUpGroup({ fields: [abstractField] })

      expect(await prefillSubmission(groupId, '<p>Text</p>')).toEqual({})
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('returns nothing when the group has no submission form', async () => {
      const groupId = await setUpGroup({ withForm: false })

      expect(await prefillSubmission(groupId, '<p>Text</p>')).toEqual({})
      expect(fetchMock).not.toHaveBeenCalled()
    })
  })

  describe('the request to OpenAI', () => {
    it('asks for the fields that have an AI prompt, by their submission key', async () => {
      const groupId = await setUpGroup()
      fetchMock.mockResolvedValueOnce(
        completion({ $title: null, $authors: null }),
      )

      await prefillSubmission(groupId, '<p>Text</p>')

      const { schema } = sentBody().response_format.json_schema

      expect(Object.keys(schema.properties)).toEqual(['$title', '$authors'])
      expect(schema.required).toEqual(['$title', '$authors'])
    })

    it('describes each field with its AI prompt', async () => {
      const groupId = await setUpGroup()
      fetchMock.mockResolvedValueOnce(
        completion({ $title: null, $authors: null }),
      )

      await prefillSubmission(groupId, '<p>Text</p>')

      const { properties } = sentBody().response_format.json_schema.schema

      expect(properties.$title.description).toBe('The title of the paper')
      expect(properties.$authors.description).toBe('The authors of the paper')
    })

    it('asks for text fields as a string or null, and authors as a list of authors or null', async () => {
      const groupId = await setUpGroup()
      fetchMock.mockResolvedValueOnce(
        completion({ $title: null, $authors: null }),
      )

      await prefillSubmission(groupId, '<p>Text</p>')

      const { properties } = sentBody().response_format.json_schema.schema

      expect(properties.$title.anyOf).toEqual([
        { type: 'string' },
        { type: 'null' },
      ])

      const [authors, none] = properties.$authors.anyOf

      expect(none).toEqual({ type: 'null' })
      expect(authors.type).toBe('array')
      expect(Object.keys(authors.items.properties)).toEqual([
        'firstName',
        'lastName',
        'email',
        'middleName',
        'orcid',
      ])
    })

    it('sends the HTML without embedded images', async () => {
      const groupId = await setUpGroup()
      fetchMock.mockResolvedValueOnce(
        completion({ $title: null, $authors: null }),
      )

      await prefillSubmission(
        groupId,
        '<p>Text</p><img src="data:image/png;base64,AAAA">',
      )

      const userMessage = sentBody().messages.find(
        (message: { role: string }) => message.role === 'user',
      )

      expect(userMessage.content).toBe('HTML:\n<p>Text</p><img src="">')
    })

    it("uses the group's API key", async () => {
      const groupId = await setUpGroup()
      fetchMock.mockResolvedValueOnce(
        completion({ $title: null, $authors: null }),
      )

      await prefillSubmission(groupId, '<p>Text</p>')

      expect(fetchMock.mock.calls[0][1]?.headers).toMatchObject({
        authorization: 'Bearer sk-test',
      })
    })
  })

  describe('the result', () => {
    it('returns the values found', async () => {
      const groupId = await setUpGroup()

      const authors = [
        {
          firstName: 'Elena',
          lastName: 'Marković',
          email: 'elena@example.org',
          middleName: null,
          orcid: null,
        },
      ]

      fetchMock.mockResolvedValueOnce(
        completion({ $title: 'A paper', $authors: authors }),
      )

      expect(await prefillSubmission(groupId, '<p>Text</p>')).toEqual({
        $title: 'A paper',
        $authors: authors,
      })
    })

    it('leaves out fields with no value', async () => {
      const groupId = await setUpGroup()
      fetchMock.mockResolvedValueOnce(
        completion({ $title: '', $authors: null }),
      )

      expect(await prefillSubmission(groupId, '<p>Text</p>')).toEqual({})
    })
  })

  describe('failures', () => {
    it('returns nothing when the group has no API key', async () => {
      const groupId = await setUpGroup({
        formData: { groupIdentity: aiConfig.groupIdentity },
      })

      expect(await prefillSubmission(groupId, '<p>Text</p>')).toEqual({})
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('returns nothing when OpenAI returns an error', async () => {
      const groupId = await setUpGroup()

      fetchMock.mockResolvedValueOnce(
        new Response('{}', {
          status: 400,
          headers: { 'content-type': 'application/json' },
        }),
      )

      expect(await prefillSubmission(groupId, '<p>Text</p>')).toEqual({})
    })

    it('returns nothing when the reply does not match the schema', async () => {
      const groupId = await setUpGroup()
      fetchMock.mockResolvedValueOnce(completion({ $title: 42 }))

      expect(await prefillSubmission(groupId, '<p>Text</p>')).toEqual({})
    })
  })
})
