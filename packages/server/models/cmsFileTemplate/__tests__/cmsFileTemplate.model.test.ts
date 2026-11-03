import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { db, config, DbTestUtils, migrationManager } from '@coko/server'

import CmsFileTemplate from '../cmsFileTemplate.model'
import Group from '../../group/group.model'

describe('CmsFileTemplate model', () => {
  beforeAll(async () => {
    await config.init()
    db.init()
    await migrationManager.migrate()
  })

  beforeEach(async () => {
    await DbTestUtils.clearDb()
  })

  afterAll(async () => {
    await DbTestUtils.clearDb()
  })

  describe('setRootFolder', () => {
    it("makes the folder the group's only root folder", async () => {
      const group = await Group.insert({})
      const otherGroup = await Group.insert({})

      const oldRoot = await CmsFileTemplate.insert({
        name: 'old',
        groupId: group.id,
        rootFolder: true,
      })

      const newRoot = await CmsFileTemplate.insert({
        name: 'new',
        groupId: group.id,
        rootFolder: false,
      })

      const otherGroupRoot = await CmsFileTemplate.insert({
        name: 'other',
        groupId: otherGroup.id,
        rootFolder: true,
      })

      const result = await CmsFileTemplate.setRootFolder(newRoot.id, group.id)

      expect(result?.id).toBe(newRoot.id)
      expect(result?.rootFolder).toBe(true)
      expect((await CmsFileTemplate.findById(oldRoot.id)).rootFolder).toBe(
        false,
      )
      expect(
        (await CmsFileTemplate.findById(otherGroupRoot.id)).rootFolder,
      ).toBe(true)
    })

    it('returns undefined for a folder in another group', async () => {
      const group = await Group.insert({})
      const otherGroup = await Group.insert({})

      const folder = await CmsFileTemplate.insert({
        name: 'folder',
        groupId: otherGroup.id,
        rootFolder: false,
      })

      expect(
        await CmsFileTemplate.setRootFolder(folder.id, group.id),
      ).toBeUndefined()
    })
  })
})
