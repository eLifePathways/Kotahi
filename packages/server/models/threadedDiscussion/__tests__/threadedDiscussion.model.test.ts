import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import {
  db,
  config,
  DbTestUtils,
  migrationManager,
  useTransaction,
  uuid,
} from '@coko/server'

import ThreadedDiscussion from '../threadedDiscussion.model'
import Group from '../../group/group.model'
import Manuscript from '../../manuscript/manuscript.model'

describe('ThreadedDiscussion model', () => {
  let manuscriptId: string

  beforeAll(async () => {
    await config.init()
    db.init()
    await migrationManager.migrate()
  })

  beforeEach(async () => {
    await DbTestUtils.clearDb()
    const group = await Group.insert({})
    manuscriptId = (await Manuscript.insert({ groupId: group.id })).id
  })

  afterAll(async () => {
    await DbTestUtils.clearDb()
  })

  describe('findByIdForUpdate', () => {
    it('returns the discussion within a transaction', async () => {
      const discussion = await ThreadedDiscussion.insert({
        manuscriptId,
        threads: JSON.stringify([]),
      })

      const found = await useTransaction(async trx =>
        ThreadedDiscussion.findByIdForUpdate(discussion.id, { trx }),
      )

      expect(found?.id).toBe(discussion.id)
    })

    it('returns undefined when the discussion does not exist', async () => {
      expect(await ThreadedDiscussion.findByIdForUpdate(uuid())).toBeUndefined()
    })
  })

  describe('getManuscriptId', () => {
    it('returns the manuscript of the discussion', async () => {
      const discussion = await ThreadedDiscussion.insert({
        manuscriptId,
        threads: JSON.stringify([]),
      })

      expect(await ThreadedDiscussion.getManuscriptId(discussion.id)).toBe(
        manuscriptId,
      )
    })

    it('throws when the discussion does not exist', async () => {
      const id = uuid()

      await expect(ThreadedDiscussion.getManuscriptId(id)).rejects.toThrow(
        `threadedDiscussion with ID ${id} not found`,
      )
    })
  })

  describe('upsertAndFetch', () => {
    it('inserts a missing discussion and updates an existing one', async () => {
      const id = uuid()

      const inserted = await ThreadedDiscussion.upsertAndFetch({
        id,
        manuscriptId,
        threads: JSON.stringify([{ id: 'thread-1', comments: [] }]),
      })

      expect(inserted.id).toBe(id)

      await ThreadedDiscussion.upsertAndFetch({
        id,
        manuscriptId,
        threads: JSON.stringify([
          { id: 'thread-1', comments: [] },
          { id: 'thread-2', comments: [] },
        ]),
      })

      const stored = await ThreadedDiscussion.findById(id)

      expect(stored.threads.map((t: { id: string }) => t.id)).toEqual([
        'thread-1',
        'thread-2',
      ])
    })
  })
})
