import { createServer, type Server } from 'http'
import type { AddressInfo } from 'net'
import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
// eslint-disable-next-line import/no-extraneous-dependencies
import express from 'express'
import { config, db, migrationManager, fileStorage, File } from '@coko/server'

import DbTestUtils from '../../../../models/DbTestUtils'
import Form from '../../../../models/form/form.model'
import Group from '../../../../models/group/group.model'
import Manuscript from '../../../../models/manuscript/manuscript.model'
import registerEndpoint from '../endpoint'

describe('GET /api/files/:id', () => {
  let server: Server
  let baseUrl: string

  beforeAll(async () => {
    await config.init()
    db.init()
    await migrationManager.migrate()
    fileStorage.init()

    const app = express()
    registerEndpoint(app)
    server = createServer(app)

    await new Promise<void>(resolve => {
      server.listen(0, resolve)
    })

    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
  })

  beforeEach(async () => {
    await DbTestUtils.clearDb()
  })

  afterAll(async () => {
    await DbTestUtils.clearDb()

    await new Promise(resolve => {
      server.close(resolve)
    })
  })

  const insertImage = async (published: boolean): Promise<File> => {
    const group = await Group.insert({})

    // @ts-ignore
    await Form.insert({
      groupId: group.id,
      purpose: 'submit',
      category: 'submission',
      structure: { name: 'Submission', children: [] },
    })

    const manuscript = await Manuscript.insert({
      groupId: group.id,
      meta: {},
      ...(published
        ? { status: 'published', published: new Date().toISOString() }
        : {}),
    })

    const image = await File.insert({
      name: 'figure.png',
      objectId: manuscript.id,
      tags: ['manuscriptImage'],
      storedObjects: [
        {
          type: 'original',
          key: 'figure.png',
          mimetype: 'image/png',
          extension: 'png',
          size: 100,
        },
      ],
    } as Partial<File>)

    await Manuscript.patchById(manuscript.id, {
      meta: { source: `<p><img data-fileid="${image.id}" src="stale"></p>` },
    })

    return image
  }

  const request = (path: string): Promise<Response> =>
    fetch(`${baseUrl}${path}`, { redirect: 'manual' })

  it('redirects to a fresh signed URL', async () => {
    const image = await insertImage(true)

    const response = await request(`/api/files/${image.id}`)

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toContain('figure.png')
    expect(response.headers.get('location')).toContain('X-Amz-Signature')

    expect(response.headers.get('cache-control')).toBe('public, max-age=60')
  })

  it('answers 404 for files of unpublished manuscripts', async () => {
    const image = await insertImage(false)

    expect((await request(`/api/files/${image.id}`)).status).toBe(404)
  })

  it('answers 404 for sizes that do not exist', async () => {
    const image = await insertImage(true)

    expect((await request(`/api/files/${image.id}?size=small`)).status).toBe(
      404,
    )
  })

  it('answers 404 for ids that are not files', async () => {
    expect((await request('/api/files/not-a-uuid')).status).toBe(404)
  })
})
