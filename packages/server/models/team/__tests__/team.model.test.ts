import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { db, config, migrationManager } from '@coko/server'

import DbTestUtils from '../../DbTestUtils'
import Team from '../team.model'
import Manuscript from '../../manuscript/manuscript.model'
import User from '../../user/user.model'
import TeamMember from '../../teamMember/teamMember.model'

const displayNames: Record<string, string> = {
  seniorEditor: 'Senior Editor',
  handlingEditor: 'Handling Editor',
  author: 'Author',
  collaborativeReviewer: 'Collaborative Reviewers',
}

const addTeam = async (
  objectId: string,
  role: string,
  userIds: string[] = [],
): Promise<Team> => {
  const team = await Team.insert({
    objectId,
    objectType: 'manuscript',
    role,
    displayName: displayNames[role],
  })

  for (const userId of userIds) {
    // eslint-disable-next-line no-await-in-loop
    await Team.addMember(team.id, userId)
  }

  return team
}

describe('Team model', () => {
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

  describe('findWithUsers', () => {
    it("gets an object's teams with the given roles, with their users", async () => {
      const manuscript = await Manuscript.insert({})
      const otherManuscript = await Manuscript.insert({})
      const senior = await User.insert({ username: 'Senior' })
      const handlingOne = await User.insert({ username: 'Handling one' })
      const handlingTwo = await User.insert({ username: 'Handling two' })
      const author = await User.insert({ username: 'Author' })

      const seniorTeam = await addTeam(manuscript.id, 'seniorEditor', [
        senior.id,
      ])

      const handlingTeam = await addTeam(manuscript.id, 'handlingEditor', [
        handlingOne.id,
        handlingTwo.id,
      ])

      await addTeam(manuscript.id, 'author', [author.id])
      await addTeam(otherManuscript.id, 'seniorEditor', [senior.id])

      const teams = await Team.findWithUsers(manuscript.id, [
        'seniorEditor',
        'handlingEditor',
      ])

      const usersByTeamId = Object.fromEntries(
        teams.map(team => [team.id, team.users.map(u => u.id).sort()]),
      )

      expect(usersByTeamId).toEqual({
        [seniorTeam.id]: [senior.id],
        [handlingTeam.id]: [handlingOne.id, handlingTwo.id].sort(),
      })
    })

    it('gives teams without members an empty users array', async () => {
      const manuscript = await Manuscript.insert({})
      await addTeam(manuscript.id, 'seniorEditor')

      const teams = await Team.findWithUsers(manuscript.id, ['seniorEditor'])

      expect(teams).toHaveLength(1)
      expect(teams[0].users).toEqual([])
    })

    it('returns no teams when none match', async () => {
      const manuscript = await Manuscript.insert({})
      await addTeam(manuscript.id, 'author')

      expect(await Team.findWithUsers(manuscript.id, ['seniorEditor'])).toEqual(
        [],
      )
    })
  })

  describe('findCollaborativeReviewerTeams', () => {
    it("gets the given manuscripts' collaborative reviewer teams, oldest first", async () => {
      const manuscriptOne = await Manuscript.insert({})
      const manuscriptTwo = await Manuscript.insert({})
      const unrequested = await Manuscript.insert({})
      const reviewerOne = await User.insert({ username: 'Reviewer one' })
      const reviewerTwo = await User.insert({ username: 'Reviewer two' })
      const editor = await User.insert({ username: 'Editor' })

      const teamOne = await addTeam(manuscriptOne.id, 'collaborativeReviewer', [
        reviewerOne.id,
      ])

      const teamTwo = await addTeam(manuscriptTwo.id, 'collaborativeReviewer', [
        reviewerOne.id,
        reviewerTwo.id,
      ])

      await addTeam(manuscriptOne.id, 'seniorEditor', [editor.id])
      await addTeam(unrequested.id, 'collaborativeReviewer', [reviewerTwo.id])

      await Team.patchById(teamOne.id, {
        role: 'collaborativeReviewer',
        created: new Date(Date.now() - 60 * 1000).toISOString(),
      })

      const teams = await Team.findCollaborativeReviewerTeams([
        manuscriptTwo.id,
        manuscriptOne.id,
      ])

      expect(teams.map(team => team.id)).toEqual([teamOne.id, teamTwo.id])
      expect(teams.map(team => team.objectId)).toEqual([
        manuscriptOne.id,
        manuscriptTwo.id,
      ])

      expect(teams[0].users.map(u => u.id)).toEqual([reviewerOne.id])
      expect(teams[1].users.map(u => u.id).sort()).toEqual(
        [reviewerOne.id, reviewerTwo.id].sort(),
      )
    })

    it('returns no teams for manuscripts without one', async () => {
      const manuscript = await Manuscript.insert({})

      expect(
        await Team.findCollaborativeReviewerTeams([manuscript.id]),
      ).toEqual([])
    })
  })

  describe('findActiveTeamsOfUserOnObject', () => {
    it('returns the roles the user holds on the object, ignoring invited and rejected memberships', async () => {
      const manuscript = await Manuscript.insert({})
      const otherManuscript = await Manuscript.insert({})
      await Manuscript.createTeams(manuscript.id)
      await Manuscript.createTeams(otherManuscript.id)
      const user = await User.insert({})

      await Manuscript.assignRole(user.id, manuscript.id, 'author')

      await Manuscript.assignRole(user.id, manuscript.id, 'editor', {
        status: 'accepted',
      })

      await Manuscript.assignRole(user.id, manuscript.id, 'reviewer', {
        status: 'invited',
      })

      await Manuscript.assignRole(
        user.id,
        manuscript.id,
        'collaborativeReviewer',
        { status: 'rejected' },
      )

      await Manuscript.assignRole(user.id, otherManuscript.id, 'handlingEditor')

      const teams = await Team.findActiveTeamsOfUserOnObject(
        user.id,
        manuscript.id,
      )

      expect(teams.map(t => t.role).sort()).toEqual(['author', 'editor'])
    })
  })

  describe('findNonInvitedMembersWithUser', () => {
    it("returns the members of the manuscript's teams with the roles, with their user, leaving out invited and rejected", async () => {
      const manuscript = await Manuscript.insert({})
      await Manuscript.createTeams(manuscript.id)
      const author = await User.insert({ username: 'author' })
      const reviewer = await User.insert({ username: 'reviewer' })
      const invited = await User.insert({ username: 'invited' })
      const rejected = await User.insert({ username: 'rejected' })
      const editor = await User.insert({ username: 'editor' })

      await Manuscript.assignRole(author.id, manuscript.id, 'author')

      await Manuscript.assignRole(reviewer.id, manuscript.id, 'reviewer', {
        status: 'completed',
      })

      await Manuscript.assignRole(invited.id, manuscript.id, 'reviewer', {
        status: 'invited',
      })

      await Manuscript.assignRole(rejected.id, manuscript.id, 'reviewer', {
        status: 'rejected',
      })

      await Manuscript.assignRole(editor.id, manuscript.id, 'editor')

      const members = await Team.findNonInvitedMembersWithUser(manuscript.id, [
        'author',
        'reviewer',
      ])

      expect(members.map(m => m.user.username).sort()).toEqual([
        'author',
        'reviewer',
      ])
    })
  })

  describe('findSharedReviewerMembers', () => {
    it('returns shared reviewers who completed their review, and the current user if shared', async () => {
      const manuscript = await Manuscript.insert({})
      await Manuscript.createTeams(manuscript.id)
      const current = await User.insert({})
      const completed = await User.insert({})
      const inProgress = await User.insert({})
      const notShared = await User.insert({})

      await Manuscript.assignRole(current.id, manuscript.id, 'reviewer', {
        status: 'inProgress',
        isShared: true,
      })

      await Manuscript.assignRole(completed.id, manuscript.id, 'reviewer', {
        status: 'completed',
        isShared: true,
      })

      await Manuscript.assignRole(inProgress.id, manuscript.id, 'reviewer', {
        status: 'inProgress',
        isShared: true,
      })

      await Manuscript.assignRole(notShared.id, manuscript.id, 'reviewer', {
        status: 'completed',
        isShared: false,
      })

      const members = await Team.findSharedReviewerMembers(
        manuscript.id,
        current.id,
      )

      expect(members.map(m => m.userId).sort()).toEqual(
        [current.id, completed.id].sort(),
      )
    })
  })

  describe('patchInvitedMemberStatus', () => {
    it("updates the user's membership only while it is invited", async () => {
      const manuscript = await Manuscript.insert({})
      await Manuscript.createTeams(manuscript.id)
      const invited = await User.insert({})
      const accepted = await User.insert({})

      const team = await Manuscript.assignRole(
        invited.id,
        manuscript.id,
        'reviewer',
        { status: 'invited' },
      )

      await Manuscript.assignRole(accepted.id, manuscript.id, 'reviewer', {
        status: 'accepted',
      })

      expect(
        await Team.patchInvitedMemberStatus(
          manuscript.id,
          'reviewer',
          invited.id,
          'accepted',
        ),
      ).toBe(1)

      expect(
        await Team.patchInvitedMemberStatus(
          manuscript.id,
          'reviewer',
          accepted.id,
          'rejected',
        ),
      ).toBe(0)

      const { result: members } = await TeamMember.find({ teamId: team.id })

      expect(members.map(m => m.status)).toEqual(['accepted', 'accepted'])
    })
  })
})
