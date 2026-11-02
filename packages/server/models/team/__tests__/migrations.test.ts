import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { db, config, migrationManager, DbTestUtils } from '@coko/server'

import Group from '../../group/group.model'
import Manuscript from '../../manuscript/manuscript.model'
import Team from '../team.model'

const LOWERCASE_GROUP_MIGRATION =
  '1793265002-lowercase-group-team-object-type.ts'
const MIGRATION_BEFORE_LOWERCASE_GROUP =
  '1793088854-create-missing-manuscript-teams.ts'

const objectTypesOf = async (objectId: string): Promise<string[]> =>
  (await Team.find({ objectId })).result.map(team => team.objectType)

describe('Team Migrations', () => {
  beforeAll(async () => {
    await config.init()
    db.init()
  })

  beforeEach(async () => {
    await DbTestUtils.dropAllTables()
  })

  afterAll(async () => {
    await DbTestUtils.clearDb()
  })

  describe('lowercase group team object type', () => {
    beforeEach(async () => {
      await migrationManager.migrate({ to: MIGRATION_BEFORE_LOWERCASE_GROUP })
    })

    it("changes group teams' object type to lowercase", async () => {
      const group = await Group.insert({})

      await Promise.all(
        [
          ['user', 'User'],
          ['groupManager', 'Group Manager'],
        ].map(([role, displayName]) =>
          Team.insert({
            role,
            displayName,
            objectId: group.id,
            objectType: 'Group',
          }),
        ),
      )

      await migrationManager.migrate({ to: LOWERCASE_GROUP_MIGRATION })

      expect(await objectTypesOf(group.id)).toEqual(['group', 'group'])
    })

    it('leaves manuscript and global teams alone', async () => {
      const manuscript = await Manuscript.insert({})
      await Manuscript.createTeams(manuscript.id)
      const { result: globalTeamsBefore } = await Team.find({ global: true })

      await migrationManager.migrate({ to: LOWERCASE_GROUP_MIGRATION })

      const { result: globalTeamsAfter } = await Team.find({ global: true })

      expect(new Set(await objectTypesOf(manuscript.id))).toEqual(
        new Set(['manuscript']),
      )

      expect(globalTeamsAfter).toEqual(globalTeamsBefore)
    })

    it('changes the object type back when rolled back', async () => {
      const group = await Group.insert({})

      await Team.insert({
        role: 'user',
        displayName: 'User',
        objectId: group.id,
        objectType: 'Group',
      })

      await migrationManager.migrate({ to: LOWERCASE_GROUP_MIGRATION })
      await migrationManager.rollback({ step: 1 })

      expect(await objectTypesOf(group.id)).toEqual(['Group'])
    })
  })
})
