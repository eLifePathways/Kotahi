import {
  describe,
  afterEach,
  beforeAll,
  afterAll,
  it,
  expect,
  vi,
} from 'vitest'
import gql from 'graphql-tag'
import {
  createGraphqlTestServer,
  migrationManager,
  db,
  config,
  DbTestUtils,
  File,
} from '@coko/server'

import { Group, Manuscript } from '../../../../models'

const storedObject = (
  type: string,
  key: string,
): {
  type: string
  key: string
  mimetype: string
  extension: string
  size: number
} => ({
  type,
  key,
  mimetype: 'image/png',
  extension: 'png',
  size: 100,
})

describe('Manuscript files API', () => {
  beforeAll(async () => {
    await config.init()
    db.init()
    await migrationManager.migrate()
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    await DbTestUtils.clearDb()
  })

  afterAll(async () => {
    await DbTestUtils.clearDb()
    await db.destroy()
  })

  it('fetches and signs files once per request for files and meta.source', async () => {
    const group = await Group.insert({})

    const manuscript = await Manuscript.insert({
      groupId: group.id,
      status: 'published',
      published: new Date().toISOString(),
      meta: {},
    })

    const image = await File.insert({
      name: 'figure.png',
      objectId: manuscript.id,
      tags: ['manuscriptImage'],
      storedObjects: [
        storedObject('original', 'figure.png'),
        storedObject('medium', 'figure_medium.png'),
      ],
    })

    await Manuscript.query()
      .patch({
        meta: {
          source: `<p><img data-fileid="${image.id}" src="stale-url"></p>`,
        },
      })
      .findById(manuscript.id)

    const relatedQuery = vi.spyOn(Manuscript, 'relatedQuery')

    const QUERY = gql`
      query {
        manuscriptsPublishedSinceDate {
          id
          files {
            id
            storedObjects {
              type
              url
            }
          }
          meta {
            source
          }
        }
      }
    `

    const gqlServer = await createGraphqlTestServer()

    const result = await gqlServer.executeOperation(
      { query: QUERY },
      {
        contextValue: {
          req: { headers: { 'group-id': group.id } },
        },
      },
    )

    if (result.body.kind !== 'single') {
      throw new Error('Expected single result, got incremental')
    }

    expect(result.body.singleResult.errors).toBeUndefined()

    const [published] = result.body.singleResult.data
      ?.manuscriptsPublishedSinceDate as {
      files: { id: string; storedObjects: { type: string; url: string }[] }[]
      meta: { source: string }
    }[]

    const filesFetches = relatedQuery.mock.calls.filter(
      ([relation]) => relation === 'files',
    )

    expect(filesFetches).toHaveLength(1)

    const mediumUrl = published.files[0].storedObjects.find(
      o => o.type === 'medium',
    )?.url

    expect(mediumUrl).toBeTruthy()

    const src = published.meta.source
      .match(/src="([^"]*)"/)?.[1]
      .replace(/&amp;/g, '&')

    expect(src).toBe(mediumUrl)
  })
})
