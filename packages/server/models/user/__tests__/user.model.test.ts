import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { db, config, migrationManager } from '@coko/server'

import DbTestUtils from '../../DbTestUtils'
import User from '../user.model'
import Group from '../../group/group.model'
import Manuscript from '../../manuscript/manuscript.model'
import Team from '../../team/team.model'
import Identity from '../../identity/identity.model'

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

  describe('group membership helpers', () => {
    const groupTeam = async (groupId: string, role: string): Promise<Team> =>
      Team.insert({
        role,
        displayName: {
          user: 'User',
          groupManager: 'Group Manager',
          groupAdmin: 'Group Admin',
        }[role] as string,
        objectId: groupId,
        objectType: 'group',
      })

    it('findUsersInGroup returns the users of the group ordered by username, with their default identity', async () => {
      const group = await Group.insert({})
      const otherGroup = await Group.insert({})
      const userTeam = await groupTeam(group.id, 'user')
      const otherUserTeam = await groupTeam(otherGroup.id, 'user')
      const managerTeam = await groupTeam(group.id, 'groupManager')
      const zed = await User.insert({ username: 'zed' })
      const amy = await User.insert({ username: 'Amy' })
      const manager = await User.insert({ username: 'manager' })
      const outsider = await User.insert({ username: 'outsider' })

      await Identity.insert({
        userId: amy.id,
        isDefault: true,
        type: 'orcid',
        identifier: '0000-0002-1825-0097',
      })

      await Team.addMember(userTeam.id, zed.id)
      await Team.addMember(userTeam.id, amy.id)
      await Team.addMember(managerTeam.id, manager.id)
      await Team.addMember(otherUserTeam.id, outsider.id)

      const users = (await User.findUsersInGroup(group.id)) as (User & {
        defaultIdentity?: { identifier: string }
      })[]

      expect(users.map(u => u.username)).toEqual(['Amy', 'zed'])
      expect(users[0].defaultIdentity?.identifier).toBe('0000-0002-1825-0097')
    })

    it('findGroupManagersAndAdmins returns the group managers and admins of the group', async () => {
      const group = await Group.insert({})
      const otherGroup = await Group.insert({})
      const managerTeam = await groupTeam(group.id, 'groupManager')
      const adminTeam = await groupTeam(group.id, 'groupAdmin')
      const userTeam = await groupTeam(group.id, 'user')
      const otherManagerTeam = await groupTeam(otherGroup.id, 'groupManager')
      const manager = await User.insert({ username: 'manager' })
      const admin = await User.insert({ username: 'admin' })
      const user = await User.insert({ username: 'user' })
      const otherManager = await User.insert({ username: 'other' })

      await Team.addMember(managerTeam.id, manager.id)
      await Team.addMember(adminTeam.id, admin.id)
      await Team.addMember(userTeam.id, user.id)
      await Team.addMember(otherManagerTeam.id, otherManager.id)

      const users = await User.findGroupManagersAndAdmins(group.id)

      expect(users.map(u => u.username)).toEqual(['admin', 'manager'])
    })

    it('findPaginated sorts and pages the users of the group, with a total count', async () => {
      const group = await Group.insert({})
      const userTeam = await groupTeam(group.id, 'user')

      const users = await Promise.all(
        ['carol', 'alice', 'bob'].map(username => User.insert({ username })),
      )

      await Promise.all(users.map(user => Team.addMember(userTeam.id, user.id)))
      await User.insert({ username: 'outsider' })

      const page = await User.findPaginated({
        allUsers: false,
        groupId: group.id,
        sort: 'username_ASC',
        offset: 1,
        limit: 1,
      })

      expect(page.totalCount).toBe(3)
      expect(page.users.map(u => u.username)).toEqual(['bob'])

      const everyone = await User.findPaginated({
        allUsers: true,
        groupId: group.id,
        sort: 'username_DESC',
      })

      expect(everyone.totalCount).toBe(4)
      expect(everyone.users.map(u => u.username)).toEqual([
        'outsider',
        'carol',
        'bob',
        'alice',
      ])
    })

    it('countInTeamsOfObject counts the users in any team on the object', async () => {
      const group = await Group.insert({})
      const userTeam = await groupTeam(group.id, 'user')
      const managerTeam = await groupTeam(group.id, 'groupManager')
      const one = await User.insert({})
      const two = await User.insert({})
      await User.insert({})

      await Team.addMember(userTeam.id, one.id)
      await Team.addMember(managerTeam.id, two.id)

      expect(await User.countInTeamsOfObject(group.id)).toBe(2)
    })

    it('getGroupAndGlobalRoles splits the roles into group and global ones', async () => {
      const group = await Group.insert({})
      const otherGroup = await Group.insert({})
      const user = await User.insert({})

      const adminTeam = await Team.insert({
        role: 'admin',
        displayName: 'Admin',
        global: true,
      })

      const managerTeam = await groupTeam(group.id, 'groupManager')
      const userTeam = await groupTeam(group.id, 'user')
      const otherGroupTeam = await groupTeam(otherGroup.id, 'groupAdmin')

      await Team.addMember(adminTeam.id, user.id)
      await Team.addMember(managerTeam.id, user.id)
      await Team.addMember(userTeam.id, user.id)
      await Team.addMember(otherGroupTeam.id, user.id)

      const { groupRoles, globalRoles } = await User.getGroupAndGlobalRoles(
        user.id,
        group.id,
      )

      expect(groupRoles.sort()).toEqual(['groupManager', 'user'])
      expect(globalRoles).toEqual(['admin'])
    })

    it('getGroupAndGlobalRoles throws without a group id', async () => {
      const user = await User.insert({})

      await expect(User.getGroupAndGlobalRoles(user.id, null)).rejects.toThrow(
        'groupId is required',
      )
    })
  })

  describe('lookups', () => {
    it('findByIdentity finds the user with an identity of the type and identifier', async () => {
      const user = await User.insert({})
      const otherUser = await User.insert({})

      await Identity.insert({
        userId: user.id,
        type: 'orcid',
        identifier: '0000-0002-1825-0097',
      })

      await Identity.insert({
        userId: otherUser.id,
        type: 'local',
        identifier: '0000-0002-1825-0097',
      })

      expect(
        (await User.findByIdentity('orcid', '0000-0002-1825-0097'))?.id,
      ).toBe(user.id)
      expect(
        await User.findByIdentity('orcid', '0000-0000-0000-0000'),
      ).toBeUndefined()
    })

    it('countAll counts every user', async () => {
      await User.insert({})
      await User.insert({})

      expect(await User.countAll()).toBe(2)
    })
  })

  describe('manuscript roles', () => {
    it('isEditorOfManuscript is true only for an editor role on that manuscript', async () => {
      const manuscript = await Manuscript.insert({})
      const otherManuscript = await Manuscript.insert({})
      await Manuscript.createTeams(manuscript.id)
      await Manuscript.createTeams(otherManuscript.id)
      const editor = await User.insert({})
      const handlingEditor = await User.insert({})
      const author = await User.insert({})

      await Manuscript.assignRole(editor.id, manuscript.id, 'editor')

      await Manuscript.assignRole(
        handlingEditor.id,
        otherManuscript.id,
        'handlingEditor',
      )

      await Manuscript.assignRole(author.id, manuscript.id, 'author')

      expect(await User.isEditorOfManuscript(editor.id, manuscript.id)).toBe(
        true,
      )
      expect(
        await User.isEditorOfManuscript(handlingEditor.id, manuscript.id),
      ).toBe(false)
      expect(
        await User.isEditorOfManuscript(handlingEditor.id, otherManuscript.id),
      ).toBe(true)
      expect(await User.isEditorOfManuscript(author.id, manuscript.id)).toBe(
        false,
      )
    })

    it('isEditorOfAnyManuscript is true for an editor role on any manuscript', async () => {
      const manuscript = await Manuscript.insert({})
      await Manuscript.createTeams(manuscript.id)
      const seniorEditor = await User.insert({})
      const author = await User.insert({})

      await Manuscript.assignRole(
        seniorEditor.id,
        manuscript.id,
        'seniorEditor',
      )
      await Manuscript.assignRole(author.id, manuscript.id, 'author')

      expect(await User.isEditorOfAnyManuscript(seniorEditor.id)).toBe(true)
      expect(await User.isEditorOfAnyManuscript(author.id)).toBe(false)
    })

    it('getTeams returns every team the user is a member of', async () => {
      const manuscript = await Manuscript.insert({})
      await Manuscript.createTeams(manuscript.id)
      const user = await User.insert({})

      await Manuscript.assignRole(user.id, manuscript.id, 'author')
      await Manuscript.assignRole(user.id, manuscript.id, 'reviewer')

      const teams = await User.getTeams(user.id)

      expect(teams.map(t => t.role).sort()).toEqual(['author', 'reviewer'])
    })

    it('getObjectIdsWithRoles returns the given objects on which the user has one of the roles', async () => {
      const one = await Manuscript.insert({})
      const two = await Manuscript.insert({})
      const three = await Manuscript.insert({})

      await Promise.all(
        [one, two, three].map(m => Manuscript.createTeams(m.id)),
      )

      const user = await User.insert({})

      await Manuscript.assignRole(user.id, one.id, 'reviewer')
      await Manuscript.assignRole(user.id, one.id, 'collaborativeReviewer')
      await Manuscript.assignRole(user.id, two.id, 'author')
      await Manuscript.assignRole(user.id, three.id, 'reviewer')

      const objectIds = await User.getObjectIdsWithRoles(
        user.id,
        ['reviewer', 'collaborativeReviewer'],
        [one.id, two.id],
      )

      expect(objectIds).toEqual([one.id, one.id])
    })
  })
})
