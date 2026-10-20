import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { db, config, DbTestUtils, migrationManager } from '@coko/server'

import Team from '../team.model'
import Manuscript from '../../manuscript/manuscript.model'
import User from '../../user/user.model'

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
    await db.destroy()
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
})
