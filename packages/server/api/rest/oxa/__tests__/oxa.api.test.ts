import { createServer, type Server } from 'http'
import type { AddressInfo } from 'net'
import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
// eslint-disable-next-line import/no-extraneous-dependencies
import express from 'express'
import { config, db, migrationManager } from '@coko/server'

import DbTestUtils from '../../../../models/DbTestUtils'
import Form from '../../../../models/form/form.model'
import Group from '../../../../models/group/group.model'
import Manuscript from '../../../../models/manuscript/manuscript.model'
import registerEndpoint from '../endpoint'

describe('GET /api/oxa/:manuscriptId', () => {
  let server: Server
  let baseUrl: string

  beforeAll(async () => {
    await config.init()
    db.init()
    await migrationManager.migrate()

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

  const insertManuscript = async (published: boolean): Promise<Manuscript> => {
    const group = await Group.insert({})

    // @ts-ignore
    await Form.insert({
      groupId: group.id,
      purpose: 'submit',
      category: 'submission',
      structure: {
        name: 'Submission',
        children: [
          {
            name: 'submission.$title',
            component: 'TextField',
            permitPublishing: 'always',
          },
        ] as Form.FormField[],
      },
    })

    return Manuscript.insert({
      groupId: group.id,
      meta: { source: '<p class="paragraph">Body</p>' },
      submission: { $title: 'Title' },
      ...(published
        ? { status: 'published', published: new Date().toISOString() }
        : {}),
    })
  }

  it('returns the OXA document of a published manuscript', async () => {
    const manuscript = await insertManuscript(true)

    const response = await fetch(`${baseUrl}/api/oxa/${manuscript.id}`)

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('application/json')

    expect(await response.json()).toEqual({
      type: 'Document',
      title: [{ type: 'Text', value: 'Title' }],
      children: [
        { type: 'Paragraph', children: [{ type: 'Text', value: 'Body' }] },
      ],
    })
  })

  it('returns 404 for unpublished, unknown and malformed ids', async () => {
    const unpublished = await insertManuscript(false)
    const group = await Group.insert({})

    const statuses = await Promise.all(
      [unpublished.id, group.id, 'not-a-uuid'].map(
        async id => (await fetch(`${baseUrl}/api/oxa/${id}`)).status,
      ),
    )

    expect(statuses).toEqual([404, 404, 404])
  })
})
