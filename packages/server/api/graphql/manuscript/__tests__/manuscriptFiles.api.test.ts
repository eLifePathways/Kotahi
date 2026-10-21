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
  FileStorageConstructor,
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

  it('only returns and signs the images a published manuscript uses', async () => {
    const group = await Group.insert({})

    const manuscript = await Manuscript.insert({
      groupId: group.id,
      status: 'published',
      published: new Date().toISOString(),
      meta: {},
    })

    const imageFile = (name: string): Promise<File> =>
      File.insert({
        name,
        objectId: manuscript.id,
        tags: ['manuscriptImage'],
        storedObjects: [
          storedObject('original', name),
          storedObject('medium', `medium_${name}`),
        ],
      })

    const usedImage = await imageFile('used.png')
    await imageFile('orphan-1.png')
    await imageFile('orphan-2.png')

    const pdf = await File.insert({
      name: 'article.pdf',
      objectId: manuscript.id,
      tags: ['printReadyPdf'],
      storedObjects: [
        {
          ...storedObject('original', 'article.pdf'),
          mimetype: 'application/pdf',
          extension: 'pdf',
        },
      ],
    })

    await Manuscript.patchAndFetchById(manuscript.id, {
      meta: { source: `<p><img data-fileid="${usedImage.id}"></p>` },
    })

    const relatedQuery = vi.spyOn(Manuscript, 'relatedQuery')

    const getURL = vi.spyOn(
      FileStorageConstructor.prototype as unknown as {
        getURL: (key: string) => Promise<string>
      },
      'getURL',
    )

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
      files: { id: string }[]
      meta: { source: string }
    }[]

    expect(published.files.map(f => f.id).sort()).toEqual(
      [usedImage.id, pdf.id].sort(),
    )

    expect(published.meta.source).toContain('src="')

    expect(
      relatedQuery.mock.calls.filter(([relation]) => relation === 'files'),
    ).toHaveLength(1)

    // used image (original + medium) and the pdf; none of the orphans
    expect(getURL.mock.calls.map(([key]) => key).sort()).toEqual(
      ['article.pdf', 'medium_used.png', 'used.png'].sort(),
    )
  })
})
