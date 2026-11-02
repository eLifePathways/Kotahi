import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { db, config, DbTestUtils, migrationManager } from '@coko/server'

import User from '../user.model'
import Group from '../../group/group.model'
import Manuscript from '../../manuscript/manuscript.model'
import Team from '../../team/team.model'

describe('User model', () => {
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

  describe('hasGlobalRole', () => {
    it('is true for members of the global team with the role', async () => {
      const user = await User.insert({})
      const team = await Team.insert({
        role: 'admin',
        displayName: 'Admin',
        global: true,
      })

      await Team.addMember(team.id, user.id)

      expect(await User.hasGlobalRole(user.id, 'admin')).toBe(true)
    })

    it('is false for users who are not in the team', async () => {
      const user = await User.insert({})
      await Team.insert({ role: 'admin', displayName: 'Admin', global: true })

      expect(await User.hasGlobalRole(user.id, 'admin')).toBe(false)
    })

    it('is false when the user only has the role on an object', async () => {
      const user = await User.insert({})
      const group = await Group.insert({})

      const team = await Team.insert({
        role: 'groupManager',
        displayName: 'Group Manager',
        objectId: group.id,
        objectType: 'group',
      })

      await Team.addMember(team.id, user.id)

      expect(await User.hasGlobalRole(user.id, 'groupManager')).toBe(false)
    })
  })

  describe('hasRoleOnObject', () => {
    it("is true for members of the object's team with the role", async () => {
      const user = await User.insert({})
      const manuscript = await Manuscript.insert({})
      await Manuscript.createTeams(manuscript.id)
      await Manuscript.assignRole(user.id, manuscript.id, 'editor')

      expect(await User.hasRoleOnObject(user.id, 'editor', manuscript.id)).toBe(
        true,
      )
    })

    it('is false for a different role on the same object', async () => {
      const user = await User.insert({})
      const manuscript = await Manuscript.insert({})
      await Manuscript.createTeams(manuscript.id)
      await Manuscript.assignRole(user.id, manuscript.id, 'editor')

      expect(await User.hasRoleOnObject(user.id, 'author', manuscript.id)).toBe(
        false,
      )
    })

    it('is false for the same role on a different object', async () => {
      const user = await User.insert({})
      const manuscript = await Manuscript.insert({})
      const other = await Manuscript.insert({})
      await Manuscript.createTeams(manuscript.id)
      await Manuscript.createTeams(other.id)
      await Manuscript.assignRole(user.id, manuscript.id, 'editor')

      expect(await User.hasRoleOnObject(user.id, 'editor', other.id)).toBe(
        false,
      )
    })

    it('is false for users who are not in the team', async () => {
      const user = await User.insert({})
      const manuscript = await Manuscript.insert({})
      await Manuscript.createTeams(manuscript.id)

      expect(await User.hasRoleOnObject(user.id, 'editor', manuscript.id)).toBe(
        false,
      )
    })
  })
})
