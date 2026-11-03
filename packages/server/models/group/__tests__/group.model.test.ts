import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { db, config, DbTestUtils, migrationManager } from '@coko/server'

import Group from '../group.model'

describe('Group model', () => {
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

  describe('findByNamePrefix', () => {
    it('returns the groups whose name starts with the prefix', async () => {
      const one = await Group.insert({ name: 'e2e-one' })
      const two = await Group.insert({ name: 'e2e-two' })
      await Group.insert({ name: 'journal-e2e' })

      const groups = await Group.findByNamePrefix('e2e-')

      expect(groups.map(g => g.id).sort()).toEqual([one.id, two.id].sort())
    })
  })

  describe('archiveByIds', () => {
    it('archives the given groups only', async () => {
      const one = await Group.insert({ name: 'one' })
      const two = await Group.insert({ name: 'two' })
      const three = await Group.insert({ name: 'three' })

      expect(await Group.archiveByIds([one.id, two.id])).toBe(2)
      expect((await Group.findById(one.id)).isArchived).toBe(true)
      expect((await Group.findById(two.id)).isArchived).toBe(true)
      expect((await Group.findById(three.id)).isArchived).toBeFalsy()
    })
  })
})
