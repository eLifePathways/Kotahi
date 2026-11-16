import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { db, config, migrationManager } from '@coko/server'

import DbTestUtils from '../../DbTestUtils'
import ArticleImportHistory from '../articleImportHistory.model'
import ArticleImportSources from '../../articleImportSources/articleImportSources.model'
import Group from '../../group/group.model'

describe('ArticleImportHistory model', () => {
  let groupId: string
  let otherGroupId: string
  let sourceId: string
  let otherSourceId: string

  beforeAll(async () => {
    await config.init()
    db.init()
    await migrationManager.migrate()
  })

  beforeEach(async () => {
    await DbTestUtils.clearDb()
    groupId = (await Group.insert({})).id
    otherGroupId = (await Group.insert({})).id
    sourceId = (await ArticleImportSources.insert({ server: 'biorxiv' })).id
    otherSourceId = (await ArticleImportSources.insert({ server: 'medrxiv' }))
      .id
  })

  afterAll(async () => {
    await DbTestUtils.clearDb()
  })

  describe('patchBySourceAndGroup', () => {
    it('patches only the entries for the source in the group', async () => {
      const newDate = '2024-02-01T00:00:00.000Z'

      const match = await ArticleImportHistory.insert({
        date: '2024-01-01T00:00:00.000Z',
        sourceId,
        groupId,
      })

      const otherSource = await ArticleImportHistory.insert({
        date: '2024-01-01T00:00:00.000Z',
        sourceId: otherSourceId,
        groupId,
      })

      const otherGroup = await ArticleImportHistory.insert({
        date: '2024-01-01T00:00:00.000Z',
        sourceId,
        groupId: otherGroupId,
      })

      const count = await ArticleImportHistory.patchBySourceAndGroup(
        sourceId,
        groupId,
        { date: newDate },
      )

      expect(count).toBe(1)

      const dateOf = async (id: string): Promise<number> =>
        new Date(
          (await ArticleImportHistory.findById(id)).date as string,
        ).getTime()

      expect(await dateOf(match.id)).toBe(new Date(newDate).getTime())
      expect(await dateOf(otherSource.id)).not.toBe(new Date(newDate).getTime())
      expect(await dateOf(otherGroup.id)).not.toBe(new Date(newDate).getTime())
    })
  })

  describe('patchByDateAndGroup', () => {
    it('patches only the entries with the date in the group', async () => {
      const date = '2024-01-01T00:00:00.000Z'

      const match = await ArticleImportHistory.insert({
        date,
        sourceId,
        groupId,
      })

      const otherDate = await ArticleImportHistory.insert({
        date: '2024-03-01T00:00:00.000Z',
        sourceId,
        groupId,
      })

      const otherGroup = await ArticleImportHistory.insert({
        date,
        sourceId,
        groupId: otherGroupId,
      })

      const newDate = '2024-02-01T00:00:00.000Z'

      const count = await ArticleImportHistory.patchByDateAndGroup(
        date,
        groupId,
        { date: newDate },
      )

      expect(count).toBe(1)

      const dateOf = async (id: string): Promise<number> =>
        new Date(
          (await ArticleImportHistory.findById(id)).date as string,
        ).getTime()

      expect(await dateOf(match.id)).toBe(new Date(newDate).getTime())
      expect(await dateOf(otherDate.id)).toBe(
        new Date('2024-03-01T00:00:00.000Z').getTime(),
      )
      expect(await dateOf(otherGroup.id)).toBe(new Date(date).getTime())
    })
  })
})
