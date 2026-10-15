import { createServer, type Server } from 'http'
import type { AddressInfo } from 'net'
import { createRequire } from 'module'
import {
  describe,
  beforeAll,
  beforeEach,
  afterEach,
  afterAll,
  it,
  expect,
} from 'vitest'
// express comes with @coko/server, which serves the real routes
// eslint-disable-next-line import/no-extraneous-dependencies
import express from 'express'
import { migrationManager, db, config, DbTestUtils } from '@coko/server'

import {
  CoarNotification,
  Form,
  Group,
  Manuscript,
  Token,
} from '../../../../models'

// Outbound HTTP (DOI registration agency, Crossref, the sender's inbox) goes
// through axios. Kotahi and @coko/server each have their own copy, so both get
// a fake adapter rather than reaching the network.
const requireFromHere = createRequire(__filename)

const axiosInstances = [
  requireFromHere('axios'),
  createRequire(requireFromHere.resolve('@coko/server'))('axios'),
]

const ORIGIN_INBOX = 'https://repository.test/inbox'
const DOI = '10.1101/2024.01.01.000001'
const UNKNOWN_DOI = '10.1101/0000.00.00.000000'
const TOKEN = 'test-coar-token'

const crossrefWork = {
  DOI,
  title: ['A preprint about tests'],
  abstract: '<jats:p>An abstract.</jats:p>',
  author: [
    {
      given: 'Ada',
      family: 'Lovelace',
      sequence: 'first',
      affiliation: [
        { name: 'Test University', id: [{ id: 'https://ror.org/test' }] },
      ],
    },
    // Crossref omits these fields for some authors
    { given: 'Grace', family: 'Hopper', sequence: 'additional' },
    {
      given: 'Alan',
      family: 'Turing',
      sequence: 'additional',
      affiliation: [{ name: 'Institute Without ROR' }],
    },
  ],
  published: { 'date-parts': [[2024, 1, 2]] },
  subject: ['Biology'],
  institution: [{ name: 'bioRxiv' }],
  resource: { primary: { URL: 'https://www.biorxiv.org/content/test' } },
}

type SentToOrigin = { type: string | string[]; summary?: string }

type AxiosConfig = { url: string; data?: string }

type AxiosResponse = {
  data: unknown
  status: number
  statusText: string
  headers: Record<string, string>
  config: AxiosConfig
}

type CoarPayload = {
  id: string
  object: Record<string, unknown>
  [key: string]: unknown
}

type InboxResult = { status: number; message: string }

let sentToOrigin: SentToOrigin[] = []

const respond = (
  axiosConfig: AxiosConfig,
  status: number,
  data: unknown,
): Promise<AxiosResponse> =>
  Promise.resolve({
    data,
    status,
    statusText: String(status),
    headers: {},
    config: axiosConfig,
  })

const fakeAdapter = (axiosConfig: AxiosConfig): Promise<AxiosResponse> => {
  const { url } = axiosConfig

  if (url.startsWith('https://doi.org/doiRA/')) {
    const doi = url.replace('https://doi.org/doiRA/', '')

    return respond(axiosConfig, 200, [
      doi === UNKNOWN_DOI
        ? { DOI: doi, status: 'DOI does not exist' }
        : { DOI: doi, RA: 'Crossref' },
    ])
  }

  if (url === `https://api.crossref.org/works/doi/${DOI}`) {
    return respond(axiosConfig, 200, { message: crossrefWork })
  }

  if (url === ORIGIN_INBOX) {
    sentToOrigin.push(JSON.parse(axiosConfig.data ?? '{}'))
    return respond(axiosConfig, 201, {})
  }

  return Promise.reject(new Error(`Unexpected outbound request: ${url}`))
}

const buildOffer = (overrides: Record<string, unknown> = {}): CoarPayload => ({
  '@context': [
    'https://www.w3.org/ns/activitystreams',
    'https://purl.org/coar/notify',
  ],
  id: `urn:uuid:${crypto.randomUUID()}`,
  type: ['Offer', 'coar-notify:ReviewAction'],
  actor: { id: 'mailto:author@example.org', name: 'Author', type: 'Person' },
  object: {
    id: 'https://www.biorxiv.org/content/test',
    'ietf:cite-as': `https://doi.org/${DOI}`,
    type: 'sorg:AboutPage',
  },
  origin: {
    id: 'https://repository.test',
    inbox: ORIGIN_INBOX,
    type: 'Service',
  },
  target: {
    id: 'https://kotahi.test',
    inbox: 'https://kotahi.test/api/coar/inbox/coar-group',
    type: 'Service',
  },
  ...overrides,
})

const buildUndo = (offerId: string): CoarPayload =>
  buildOffer({
    type: ['Undo'],
    inReplyTo: offerId,
    object: {
      id: offerId,
      type: ['Offer', 'coar-notify:ReviewAction'],
    },
  })

describe('COAR Notify inbox API', () => {
  let server: Server
  let baseUrl: string
  let originalAdapters: unknown[]
  let group: Group

  const post = async (
    body: unknown,
    {
      groupName = 'coar-group',
      authorization = `Bearer ${TOKEN}`,
    }: { groupName?: string; authorization?: string | null } = {},
  ): Promise<InboxResult> => {
    const response = await fetch(`${baseUrl}/api/coar/inbox/${groupName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/ld+json',
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    })

    return {
      status: response.status,
      message: ((await response.json()) as InboxResult).message,
    }
  }

  const manuscriptsWithDoi = async (): Promise<Manuscript[]> =>
    Manuscript.query().where({ doi: DOI, groupId: group.id })

  beforeAll(async () => {
    await config.init()
    db.init()
    await migrationManager.migrate()

    originalAdapters = axiosInstances.map(a => a.defaults.adapter)
    axiosInstances.forEach(a => {
      a.defaults.adapter = fakeAdapter
    })

    // The COAR controllers read config on load, so import after config.init()
    const { default: registerInbox } = await import('../inbox')

    const app = express()
    app.use(express.json({ type: ['application/json', 'application/ld+json'] }))
    registerInbox(app)

    server = createServer(app)
    await new Promise<void>(resolve => {
      server.listen(0, resolve)
    })
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
  })

  beforeEach(async () => {
    sentToOrigin = []

    group = await Group.insert({ name: 'coar-group', isArchived: false })

    await Form.insert({
      groupId: group.id,
      category: 'submission',
      purpose: 'submit',
      structure: {
        name: 'Submission',
        description: null,
        haspopup: 'false',
        popuptitle: null,
        popupdescription: null,
        children: [],
      },
    })

    await Token.generateToken('coar', TOKEN, group.id)
  })

  afterEach(async () => {
    await DbTestUtils.clearDb()
  })

  afterAll(async () => {
    axiosInstances.forEach((a, i) => {
      a.defaults.adapter = originalAdapters[i]
    })

    await new Promise<void>(resolve => {
      server.close(() => resolve())
    })
    await DbTestUtils.clearDb()
    await db.destroy()
  })

  describe('rejections', () => {
    it('rejects an unknown group', async () => {
      const result = await post(buildOffer(), { groupName: 'no-such-group' })

      expect(result).toEqual({ status: 404, message: 'Group not found' })
    })

    it('rejects a group without a COAR token', async () => {
      await Token.deleteByNameAndGroupId('coar', group.id)

      const result = await post(buildOffer())

      expect(result).toEqual({ status: 403, message: 'Unauthorised Request' })
    })

    it.each([
      ['a missing Authorization header', null],
      ['a wrong token', 'Bearer wrong-token'],
      ['a token without the Bearer prefix', TOKEN],
    ])('rejects %s', async (_, authorization) => {
      const result = await post(buildOffer(), { authorization })

      expect(result).toEqual({ status: 403, message: 'Unauthorised Request' })
    })

    it('rejects an empty payload', async () => {
      const result = await post({})

      expect(result).toEqual({ status: 400, message: 'No payload provided' })
    })

    it('rejects an invalid @context', async () => {
      const result = await post(
        buildOffer({ '@context': ['https://example.org'] }),
      )

      expect(result).toEqual({
        status: 400,
        message: 'Property `@context` is invalid',
      })
    })

    it('rejects a DOI that is not registered', async () => {
      const offer = buildOffer()
      offer.object['ietf:cite-as'] = `https://doi.org/${UNKNOWN_DOI}`

      const result = await post(offer)

      expect(result).toEqual({ status: 400, message: 'DOI does not exist' })
    })

    it('stores the rejected payload and flags it to the sender', async () => {
      const offer = buildOffer()

      await post(offer, { authorization: 'Bearer wrong-token' })

      const stored = await CoarNotification.query().where({
        groupId: group.id,
      })

      expect(stored.map(n => n.payload.id)).toContain(offer.id)
      expect(stored.every(n => !n.manuscriptId)).toBe(true)

      expect(sentToOrigin).toHaveLength(1)
      expect(sentToOrigin[0].type).toEqual([
        'Flag',
        'coar-notify:UnprocessableNotification',
      ])
      expect(sentToOrigin[0].summary).toBe('Unauthorised Request')
    })
  })

  describe('offers', () => {
    it('creates a manuscript linked to the offer', async () => {
      const offer = buildOffer()

      const result = await post(offer)

      expect(result).toEqual({
        status: 202,
        message: 'Notification created successfully.',
      })

      const [manuscript] = await manuscriptsWithDoi()
      expect(manuscript.status).toBe('new')
      expect(manuscript.submission.$title).toContain('A preprint about tests')
      expect(
        manuscript.submission.$authors.map(
          (a: { lastName: string; ror: { label: string }[] }) => [
            a.lastName,
            a.ror.map(r => r.label),
          ],
        ),
      ).toEqual([
        ['Lovelace', ['Test University']],
        ['Hopper', []],
        ['Turing', ['Institute Without ROR']],
      ])

      const notification = await CoarNotification.query()
        .whereRaw(`payload->>'id' = ?`, [offer.id])
        .first()

      expect(notification?.manuscriptId).toBe(manuscript.id)
      expect(sentToOrigin).toHaveLength(0)
    })

    it('rejects a second offer for the same DOI', async () => {
      await post(buildOffer())

      const result = await post(buildOffer())

      expect(result).toEqual({
        status: 400,
        message: 'Notification already exists with the same payload.',
      })
      expect(await manuscriptsWithDoi()).toHaveLength(1)
    })

    it('does not let a rejected offer block the DOI', async () => {
      await post(buildOffer(), { authorization: null })

      const result = await post(buildOffer())

      expect(result.status).toBe(202)
      expect(await manuscriptsWithDoi()).toHaveLength(1)
    })

    it('rejects an offer for a manuscript that already exists without one', async () => {
      await Manuscript.query().insert({
        doi: DOI,
        groupId: group.id,
        status: 'new',
        isHidden: false,
        submission: {},
        meta: {},
      })

      const result = await post(buildOffer())

      expect(result).toEqual({
        status: 400,
        message: 'Manuscript already exists with DOI.',
      })
      expect(await manuscriptsWithDoi()).toHaveLength(1)
      expect(sentToOrigin[0].summary).toBe(
        'Manuscript already exists with DOI.',
      )
    })

    it('rolls back the manuscript when storing the notification fails', async () => {
      // Postgres jsonb can't store \u0000, so the insert after the manuscript fails
      const offer = JSON.stringify(buildOffer()).replace(
        '"name":"Author"',
        '"name":"Auth\\u0000or"',
      )

      const result = await post(offer)

      expect(result).toEqual({
        status: 500,
        message: 'Failed to create notification.',
      })
      expect(await manuscriptsWithDoi()).toHaveLength(0)
    })
  })

  describe('undo', () => {
    it('archives the manuscript of the original offer', async () => {
      const offer = buildOffer()
      await post(offer)

      const result = await post(buildUndo(offer.id))

      expect(result).toEqual({
        status: 202,
        message: 'Manuscript archived successfully',
      })

      const [manuscript] = await manuscriptsWithDoi()
      expect(manuscript.isHidden).toBe(true)
    })

    it('rejects an undo for an unknown offer', async () => {
      const result = await post(buildUndo('urn:uuid:unknown'))

      expect(result).toEqual({ status: 404, message: 'Notification not found' })
    })

    it('rejects an undo for an offer that was rejected', async () => {
      const offer = buildOffer()
      await post(offer, { authorization: null })

      const result = await post(buildUndo(offer.id))

      expect(result).toEqual({ status: 404, message: 'Notification not found' })
    })

    it('rejects an undo whose inReplyTo does not match the object', async () => {
      const offer = buildOffer()
      await post(offer)

      const result = await post({
        ...buildUndo(offer.id),
        inReplyTo: 'urn:uuid:something-else',
      })

      expect(result).toEqual({
        status: 400,
        message: 'Property `inReplyTo` does not match `object.id`',
      })
    })
  })
})
