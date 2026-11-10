import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import {
  db,
  config,
  DbTestUtils,
  migrationManager,
  File,
  useTransaction,
  uuid,
} from '@coko/server'

import Manuscript from '../manuscript.model'
import Channel from '../../channel/channel.model'
import ChannelMember from '../../channelMember/channelMember.model'
import Form from '../../form/form.model'
import Review from '../../review/review.model'
import Team from '../../team/team.model'
import User from '../../user/user.model'
import TeamMember from '../../teamMember/teamMember.model'
import Invitation from '../../invitation/invitation.model'
import Group from '../../group/group.model'
import Config from '../../config/config.model'
import Task from '../../task/task.model'
import Identity from '../../identity/identity.model'

const DAY = 24 * 60 * 60 * 1000

const daysAgo = (days: number): Date => new Date(Date.now() - days * DAY)

const fileStoredObjects = [
  {
    type: 'original',
    key: 'file.png',
    mimetype: 'image/png',
    extension: 'png',
    size: 1,
  },
]

const MANUSCRIPT_TEAMS = [
  ['author', 'Author'],
  ['reviewer', 'Reviewers'],
  ['collaborativeReviewer', 'Collaborative Reviewers'],
  ['editor', 'Editor'],
  ['seniorEditor', 'Senior Editor'],
  ['handlingEditor', 'Handling Editor'],
  ['managingEditor', 'Managing Editor'],
]

const teamsOf = async (manuscriptId: string): Promise<Team[]> =>
  Team.query().where({ objectId: manuscriptId })

const membersByRole = async (
  manuscriptId: string,
): Promise<Record<string, { userId: string; status: string | null }[]>> => {
  const members = await TeamMember.query()
    .join('teams', 'teams.id', 'team_members.teamId')
    .where('teams.objectId', manuscriptId)
    .select('teams.role', 'team_members.userId', 'team_members.status')

  return members.reduce(
    (byRole, member) => {
      const { role, userId, status } = member as unknown as {
        role: string
        userId: string
        status: string | null
      }

      return {
        ...byRole,
        [role]: [...(byRole[role] ?? []), { userId, status }],
      }
    },
    {} as Record<string, { userId: string; status: string | null }[]>,
  )
}

describe('Manuscript model', () => {
  let groupId: string

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

  it('gets reviews', async () => {
    const manuscript = await Manuscript.insert({})

    const reviewerOne = await User.insert({})
    const reviewerTwo = await User.insert({})
    const reviewerThree = await User.insert({})

    const reviewOne = await Review.insert({
      manuscriptId: manuscript.id,
      userId: reviewerOne.id,
    })

    const reviewTwo = await Review.insert({
      manuscriptId: manuscript.id,
      userId: reviewerTwo.id,
    })

    const reviewThree = await Review.insert({
      manuscriptId: manuscript.id,
      userId: reviewerThree.id,
    })

    const reviewerTeam = await Team.insert({
      objectId: manuscript.id,
      objectType: 'manuscript',
      role: 'reviewer',
      displayName: 'Reviewers',
    })

    await Team.addMember(reviewerTeam.id, reviewerOne.id, { status: 'invited' })
    await Team.addMember(reviewerTeam.id, reviewerTwo.id, {
      status: 'accepted',
    })
    await Team.addMember(reviewerTeam.id, reviewerThree.id, {
      status: 'accepted',
    })

    const reviews = await manuscript.getReviews()

    expect(reviews).toHaveLength(3)
    expect(reviews[0].id).toBe(reviewOne.id)
    expect(reviews[1].id).toBe(reviewTwo.id)
    expect(reviews[2].id).toBe(reviewThree.id)

    const invitedReviews = await manuscript.getReviews(['invited'])

    expect(invitedReviews).toHaveLength(1)
    expect(invitedReviews[0].id).toBe(reviewOne.id)

    const acceptedReviews = await manuscript.getReviews(['accepted'])

    expect(acceptedReviews).toHaveLength(2)
    expect(acceptedReviews[0].id).toBe(reviewTwo.id)
    expect(acceptedReviews[1].id).toBe(reviewThree.id)

    const allReviews = await manuscript.getReviews(['invited', 'accepted'])
    expect(allReviews).toHaveLength(3)
  })

  it('adds a reviewer', async () => {
    const manuscriptOne = await Manuscript.insert({})
    await Manuscript.createTeams(manuscriptOne.id)
    const reviewerOne = await User.insert({})
    const reviewerTwo = await User.insert({})

    let reviewerTeamOne = await Manuscript.addReviewer(
      manuscriptOne.id,
      reviewerOne.id,
      null,
      true,
    )

    expect(reviewerTeamOne.role).toBe('collaborativeReviewer')

    let reviewerTeamOneMembers = await TeamMember.query().where({
      teamId: reviewerTeamOne.id,
    })

    expect(reviewerTeamOneMembers.length).toBe(1)
    expect(reviewerTeamOneMembers[0].status).toBe('invited')

    reviewerTeamOne = await Manuscript.addReviewer(
      manuscriptOne.id,
      reviewerTwo.id,
      null,
      true,
    )

    reviewerTeamOneMembers = await TeamMember.query().where({
      teamId: reviewerTeamOne.id,
    })

    expect(reviewerTeamOneMembers.length).toBe(2)

    const manuscriptThree = await Manuscript.insert({})
    await Manuscript.createTeams(manuscriptThree.id)

    const reviewerThree = await User.insert({
      email: 'reviewer3@email.com',
      username: 'Reviewer Three',
    })

    const editor = await User.insert({})

    const inviteThree = await Invitation.insert({
      manuscriptId: manuscriptThree.id,
      toEmail: reviewerThree.email!,
      status: 'UNANSWERED',
      invitedPersonType: 'REVIEWER',
      invitedPersonName: reviewerThree.username,
      senderId: editor.id,
    })

    const reviewerTeamThree = await Manuscript.addReviewer(
      manuscriptThree.id,
      reviewerThree.id,
      inviteThree.id,
      false,
    )

    expect(reviewerTeamThree.role).toBe('reviewer')

    const reviewerTeamThreeMembers = await TeamMember.query().where({
      teamId: reviewerTeamThree.id,
    })

    expect(reviewerTeamThreeMembers.length).toBe(1)
    expect(reviewerTeamThreeMembers[0].status).toBe('accepted')
  })

  describe('userIsReviewerOfAnyVersion', () => {
    it('is true for a reviewer of the manuscript', async () => {
      const manuscript = await Manuscript.insert({})
      const reviewer = await User.insert({})
      await Manuscript.createTeams(manuscript.id)
      await Manuscript.addReviewer(manuscript.id, reviewer.id, null, false)

      expect(
        await Manuscript.userIsReviewerOfAnyVersion(manuscript.id, reviewer.id),
      ).toBe(true)
    })

    it('is true for a collaborative reviewer of the manuscript', async () => {
      const manuscript = await Manuscript.insert({})
      const reviewer = await User.insert({})
      await Manuscript.createTeams(manuscript.id)
      await Manuscript.addReviewer(manuscript.id, reviewer.id, null, true)

      expect(
        await Manuscript.userIsReviewerOfAnyVersion(manuscript.id, reviewer.id),
      ).toBe(true)
    })

    // regression check
    it('is false for a first version when the user only reviews another first version', async () => {
      const manuscriptA = await Manuscript.insert({})
      const manuscriptB = await Manuscript.insert({})
      const reviewer = await User.insert({})
      await Manuscript.createTeams(manuscriptA.id)
      await Manuscript.addReviewer(manuscriptA.id, reviewer.id, null, false)

      expect(
        await Manuscript.userIsReviewerOfAnyVersion(
          manuscriptB.id,
          reviewer.id,
        ),
      ).toBe(false)
    })

    it('is true for a first version when the user reviews a later version', async () => {
      const firstVersion = await Manuscript.insert({})

      const secondVersion = await Manuscript.insert({
        parentId: firstVersion.id,
      })

      const reviewer = await User.insert({})
      await Manuscript.createTeams(secondVersion.id)
      await Manuscript.addReviewer(secondVersion.id, reviewer.id, null, false)

      expect(
        await Manuscript.userIsReviewerOfAnyVersion(
          firstVersion.id,
          reviewer.id,
        ),
      ).toBe(true)
    })

    it('is true for a later version when the user reviews the first version', async () => {
      const firstVersion = await Manuscript.insert({})

      const secondVersion = await Manuscript.insert({
        parentId: firstVersion.id,
      })

      const reviewer = await User.insert({})
      await Manuscript.createTeams(firstVersion.id)
      await Manuscript.addReviewer(firstVersion.id, reviewer.id, null, false)

      expect(
        await Manuscript.userIsReviewerOfAnyVersion(
          secondVersion.id,
          reviewer.id,
        ),
      ).toBe(true)
    })

    it('is true for a later version when the user reviews a sibling version', async () => {
      const firstVersion = await Manuscript.insert({})

      const secondVersion = await Manuscript.insert({
        parentId: firstVersion.id,
      })

      const thirdVersion = await Manuscript.insert({
        parentId: firstVersion.id,
      })

      const reviewer = await User.insert({})
      await Manuscript.createTeams(secondVersion.id)
      await Manuscript.addReviewer(secondVersion.id, reviewer.id, null, false)

      expect(
        await Manuscript.userIsReviewerOfAnyVersion(
          thirdVersion.id,
          reviewer.id,
        ),
      ).toBe(true)
    })

    it('is false for a later version of a different manuscript', async () => {
      const manuscriptA = await Manuscript.insert({})
      const manuscriptB = await Manuscript.insert({})

      const manuscriptBSecondVersion = await Manuscript.insert({
        parentId: manuscriptB.id,
      })

      const reviewer = await User.insert({})
      await Manuscript.createTeams(manuscriptA.id)
      await Manuscript.addReviewer(manuscriptA.id, reviewer.id, null, false)

      expect(
        await Manuscript.userIsReviewerOfAnyVersion(
          manuscriptBSecondVersion.id,
          reviewer.id,
        ),
      ).toBe(false)
    })

    it('is false for a member of a non-reviewer team', async () => {
      const manuscript = await Manuscript.insert({})
      const author = await User.insert({})

      const authorTeam = await Team.insert({
        objectId: manuscript.id,
        objectType: 'manuscript',
        role: 'author',
        displayName: 'Author',
      })

      await Team.addMember(authorTeam.id, author.id)

      expect(
        await Manuscript.userIsReviewerOfAnyVersion(manuscript.id, author.id),
      ).toBe(false)
    })

    it('is false when the manuscript does not exist', async () => {
      const manuscript = await Manuscript.insert({})
      const reviewer = await User.insert({})
      await Manuscript.createTeams(manuscript.id)
      await Manuscript.addReviewer(manuscript.id, reviewer.id, null, false)

      expect(
        await Manuscript.userIsReviewerOfAnyVersion(
          '00000000-0000-0000-0000-000000000000',
          reviewer.id,
        ),
      ).toBe(false)
    })
  })

  it('finds an editor image file by source hash', async () => {
    const manuscript = await Manuscript.insert({})
    const otherManuscript = await Manuscript.insert({})

    const storedObjects = [
      {
        type: 'original',
        key: 'abc.png',
        mimetype: 'image/png',
        extension: 'png',
        size: 1,
      },
    ]

    const image = await File.insert({
      name: 'abc.png',
      tags: ['manuscriptImage'],
      objectId: manuscript.id,
      meta: { sourceHash: 'hash-1' },
      storedObjects,
    })

    // Same hash, but wrong tag or wrong manuscript
    await File.insert({
      name: 'abc.png',
      tags: ['supplementary'],
      objectId: manuscript.id,
      meta: { sourceHash: 'hash-2' },
      storedObjects,
    })
    await File.insert({
      name: 'abc.png',
      tags: ['manuscriptImage'],
      objectId: otherManuscript.id,
      meta: { sourceHash: 'hash-3' },
      storedObjects,
    })

    const found = await Manuscript.findImageFileBySourceHash(
      manuscript.id,
      'hash-1',
    )

    expect(found?.id).toBe(image.id)

    expect(
      await Manuscript.findImageFileBySourceHash(manuscript.id, 'hash-2'),
    ).toBeUndefined()
    expect(
      await Manuscript.findImageFileBySourceHash(manuscript.id, 'hash-3'),
    ).toBeUndefined()
    expect(
      await Manuscript.findImageFileBySourceHash(manuscript.id, 'missing'),
    ).toBeUndefined()
  })

  it('returns the latest version of a manuscript family for a role held on an earlier version', async () => {
    const group = await Group.insert({})
    const user = await User.insert({})

    const rootManuscript = await Manuscript.insert({ groupId: group.id })

    const latestManuscript = await Manuscript.insert({
      groupId: group.id,
      parentId: rootManuscript.id,
    })

    await db('manuscripts')
      .where({ id: rootManuscript.id })
      .update({ created: '2000-01-01T00:00:00.000Z' })

    const reviewerTeam = await Team.insert({
      objectId: rootManuscript.id,
      objectType: 'manuscript',
      role: 'reviewer',
      displayName: 'Reviewers',
    })

    await Team.addMember(reviewerTeam.id, user.id, { status: 'accepted' })

    const results =
      await Manuscript.getLatestVersionsOfManuscriptsUserHasRolesIn(
        user.id,
        group.id,
        ['reviewer'],
      )

    expect(results).toHaveLength(1)
    expect(results[0].id).toBe(latestManuscript.id)
  })

  it('falls back to the manuscript itself when there are no further versions', async () => {
    const group = await Group.insert({})
    const user = await User.insert({})
    const manuscript = await Manuscript.insert({ groupId: group.id })

    const editorTeam = await Team.insert({
      objectId: manuscript.id,
      objectType: 'manuscript',
      role: 'editor',
      displayName: 'Editor',
    })

    await Team.addMember(editorTeam.id, user.id)

    const results =
      await Manuscript.getLatestVersionsOfManuscriptsUserHasRolesIn(
        user.id,
        group.id,
        ['editor'],
      )

    expect(results).toHaveLength(1)
    expect(results[0].id).toBe(manuscript.id)
  })

  it('excludes manuscripts where the user does not have one of the given roles', async () => {
    const group = await Group.insert({})
    const user = await User.insert({})
    const manuscript = await Manuscript.insert({ groupId: group.id })

    const authorTeam = await Team.insert({
      objectId: manuscript.id,
      objectType: 'manuscript',
      role: 'author',
      displayName: 'Author',
    })

    await Team.addMember(authorTeam.id, user.id, { status: 'accepted' })

    const results =
      await Manuscript.getLatestVersionsOfManuscriptsUserHasRolesIn(
        user.id,
        group.id,
        ['editor'],
      )

    expect(results).toHaveLength(0)
  })

  it('excludes manuscripts belonging to a different group', async () => {
    const group = await Group.insert({})
    const otherGroup = await Group.insert({})
    const user = await User.insert({})
    const manuscript = await Manuscript.insert({ groupId: otherGroup.id })

    const editorTeam = await Team.insert({
      objectId: manuscript.id,
      objectType: 'manuscript',
      role: 'editor',
      displayName: 'Editor',
    })

    await Team.addMember(editorTeam.id, user.id)

    const results =
      await Manuscript.getLatestVersionsOfManuscriptsUserHasRolesIn(
        user.id,
        group.id,
        ['editor'],
      )

    expect(results).toHaveLength(0)
  })

  it('excludes hidden manuscripts', async () => {
    const group = await Group.insert({})
    const user = await User.insert({})

    const manuscript = await Manuscript.insert({
      groupId: group.id,
      isHidden: true,
    })

    const editorTeam = await Team.insert({
      objectId: manuscript.id,
      objectType: 'manuscript',
      role: 'editor',
      displayName: 'Editor',
    })

    await Team.addMember(editorTeam.id, user.id)

    const results =
      await Manuscript.getLatestVersionsOfManuscriptsUserHasRolesIn(
        user.id,
        group.id,
        ['editor'],
      )

    expect(results).toHaveLength(0)
  })

  it('returns a manuscript with an in-progress overdue task assigned to the user', async () => {
    const group = await Group.insert({})
    const user = await User.insert({})
    const manuscript = await Manuscript.insert({ groupId: group.id })
    const dueDate = new Date('2020-01-01T00:00:00.000Z')

    await Task.insert({
      manuscriptId: manuscript.id,
      groupId: group.id,
      assigneeUserId: user.id,
      status: 'In progress',
      dueDate: dueDate.toISOString(),
      sequenceIndex: 0,
    })

    const results = await Manuscript.findManuscriptsWithOverdueTasksForUser(
      user.id,
      group.id,
    )

    expect(results).toHaveLength(1)
    expect(results[0].id).toBe(manuscript.id)

    expect(new Date(results[0].nextTaskDueDate).toISOString()).toBe(
      dueDate.toISOString(),
    )
  })

  it('excludes tasks that are not in progress', async () => {
    const group = await Group.insert({})
    const user = await User.insert({})
    const manuscript = await Manuscript.insert({ groupId: group.id })

    await Task.insert({
      manuscriptId: manuscript.id,
      groupId: group.id,
      assigneeUserId: user.id,
      status: 'Not started',
      dueDate: new Date('2020-01-01T00:00:00.000Z').toISOString(),
      sequenceIndex: 0,
    })

    const results = await Manuscript.findManuscriptsWithOverdueTasksForUser(
      user.id,
      group.id,
    )

    expect(results).toHaveLength(0)
  })

  it('excludes tasks with no due date', async () => {
    const group = await Group.insert({})
    const user = await User.insert({})
    const manuscript = await Manuscript.insert({ groupId: group.id })

    await Task.insert({
      manuscriptId: manuscript.id,
      groupId: group.id,
      assigneeUserId: user.id,
      status: 'In progress',
      dueDate: null,
      sequenceIndex: 0,
    })

    const results = await Manuscript.findManuscriptsWithOverdueTasksForUser(
      user.id,
      group.id,
    )

    expect(results).toHaveLength(0)
  })

  it('only returns tasks due before the given dueBefore option', async () => {
    const group = await Group.insert({})
    const user = await User.insert({})
    const manuscript = await Manuscript.insert({ groupId: group.id })

    await Task.insert({
      manuscriptId: manuscript.id,
      groupId: group.id,
      assigneeUserId: user.id,
      status: 'In progress',
      dueDate: new Date('2030-01-01T00:00:00.000Z').toISOString(),
      sequenceIndex: 0,
    })

    const results = await Manuscript.findManuscriptsWithOverdueTasksForUser(
      user.id,
      group.id,
      { dueBefore: new Date('2020-01-01T00:00:00.000Z') },
    )

    expect(results).toHaveLength(0)
  })

  it('excludes tasks belonging to a different group', async () => {
    const group = await Group.insert({})
    const otherGroup = await Group.insert({})
    const user = await User.insert({})
    const manuscript = await Manuscript.insert({ groupId: group.id })

    await Task.insert({
      manuscriptId: manuscript.id,
      groupId: otherGroup.id,
      assigneeUserId: user.id,
      status: 'In progress',
      dueDate: new Date('2020-01-01T00:00:00.000Z').toISOString(),
      sequenceIndex: 0,
    })

    const results = await Manuscript.findManuscriptsWithOverdueTasksForUser(
      user.id,
      group.id,
    )

    expect(results).toHaveLength(0)
  })

  it('includes a manuscript when the user is an editor, even if not the assignee', async () => {
    const group = await Group.insert({})
    const editorUser = await User.insert({})
    const assignee = await User.insert({})
    const manuscript = await Manuscript.insert({ groupId: group.id })

    const editorTeam = await Team.insert({
      objectId: manuscript.id,
      objectType: 'manuscript',
      role: 'editor',
      displayName: 'Editor',
    })

    await Team.addMember(editorTeam.id, editorUser.id)

    await Task.insert({
      manuscriptId: manuscript.id,
      groupId: group.id,
      assigneeUserId: assignee.id,
      status: 'In progress',
      dueDate: new Date('2020-01-01T00:00:00.000Z').toISOString(),
      sequenceIndex: 0,
    })

    const results = await Manuscript.findManuscriptsWithOverdueTasksForUser(
      editorUser.id,
      group.id,
    )

    expect(results).toHaveLength(1)
    expect(results[0].id).toBe(manuscript.id)
  })

  it('excludes a manuscript when the user is neither the assignee nor an editor', async () => {
    const group = await Group.insert({})
    const user = await User.insert({})
    const assignee = await User.insert({})
    const manuscript = await Manuscript.insert({ groupId: group.id })

    await Task.insert({
      manuscriptId: manuscript.id,
      groupId: group.id,
      assigneeUserId: assignee.id,
      status: 'In progress',
      dueDate: new Date('2020-01-01T00:00:00.000Z').toISOString(),
      sequenceIndex: 0,
    })

    const results = await Manuscript.findManuscriptsWithOverdueTasksForUser(
      user.id,
      group.id,
    )

    expect(results).toHaveLength(0)
  })

  it('only surfaces the latest version of a manuscript family', async () => {
    const group = await Group.insert({})
    const user = await User.insert({})

    const olderVersion = await Manuscript.insert({ groupId: group.id })

    const latestVersion = await Manuscript.insert({
      groupId: group.id,
      parentId: olderVersion.id,
    })

    await db('manuscripts')
      .where({ id: olderVersion.id })
      .update({ created: '2000-01-01T00:00:00.000Z' })

    await Task.insert({
      manuscriptId: olderVersion.id,
      groupId: group.id,
      assigneeUserId: user.id,
      status: 'In progress',
      dueDate: new Date('2020-01-01T00:00:00.000Z').toISOString(),
      sequenceIndex: 0,
    })

    await Task.insert({
      manuscriptId: latestVersion.id,
      groupId: group.id,
      assigneeUserId: user.id,
      status: 'In progress',
      dueDate: new Date('2021-01-01T00:00:00.000Z').toISOString(),
      sequenceIndex: 0,
    })

    const results = await Manuscript.findManuscriptsWithOverdueTasksForUser(
      user.id,
      group.id,
    )

    expect(results).toHaveLength(1)
    expect(results[0].id).toBe(latestVersion.id)
  })

  it('returns the earliest due date across multiple in-progress tasks on the same manuscript', async () => {
    const group = await Group.insert({})
    const user = await User.insert({})
    const manuscript = await Manuscript.insert({ groupId: group.id })

    await Task.insert({
      manuscriptId: manuscript.id,
      groupId: group.id,
      assigneeUserId: user.id,
      status: 'In progress',
      dueDate: new Date('2020-06-01T00:00:00.000Z').toISOString(),
      sequenceIndex: 0,
    })

    await Task.insert({
      manuscriptId: manuscript.id,
      groupId: group.id,
      assigneeUserId: user.id,
      status: 'In progress',
      dueDate: new Date('2020-01-01T00:00:00.000Z').toISOString(),
      sequenceIndex: 1,
    })

    const results = await Manuscript.findManuscriptsWithOverdueTasksForUser(
      user.id,
      group.id,
    )

    expect(results).toHaveLength(1)

    expect(new Date(results[0].nextTaskDueDate).toISOString()).toBe(
      new Date('2020-01-01T00:00:00.000Z').toISOString(),
    )
  })

  describe('createTeams', () => {
    beforeEach(async () => {
      groupId = (await Group.insert({})).id
    })

    it('creates one team per manuscript role, as configured', async () => {
      const manuscript = await Manuscript.insert({ groupId })

      await Manuscript.createTeams(manuscript.id)

      const teams = await teamsOf(manuscript.id)

      expect(teams.map(team => [team.role, team.displayName]).sort()).toEqual(
        [...MANUSCRIPT_TEAMS].sort(),
      )

      teams.forEach(team => {
        expect(team.objectType).toBe('manuscript')
        expect(team.global).toBe(false)
      })
    })

    it('does not create group teams', async () => {
      const manuscript = await Manuscript.insert({ groupId })

      await Manuscript.createTeams(manuscript.id)

      const roles = (await teamsOf(manuscript.id)).map(team => team.role)

      expect(roles).not.toContain('user')
      expect(roles).not.toContain('groupManager')
      expect(roles).not.toContain('groupAdmin')
    })

    it('creates teams without members', async () => {
      const manuscript = await Manuscript.insert({ groupId })

      await Manuscript.createTeams(manuscript.id)

      expect(await membersByRole(manuscript.id)).toEqual({})
    })

    it('cannot create the same teams twice for a manuscript', async () => {
      const manuscript = await Manuscript.insert({ groupId })

      await Manuscript.createTeams(manuscript.id)

      await expect(Manuscript.createTeams(manuscript.id)).rejects.toThrow()
      expect(await teamsOf(manuscript.id)).toHaveLength(7)
    })
  })

  describe('createChannels', () => {
    beforeEach(async () => {
      groupId = (await Group.insert({})).id
    })

    it('creates the discussion and editorial channels', async () => {
      const manuscript = await Manuscript.insert({ groupId })

      await Manuscript.createChannels(manuscript.id, groupId)

      const channels = await Channel.query().where({
        manuscriptId: manuscript.id,
      })

      expect(
        channels
          .map(channel => [channel.type, channel.topic, channel.groupId])
          .sort(),
      ).toEqual([
        ['all', 'Manuscript discussion', groupId],
        ['editorial', 'Editorial discussion', groupId],
      ])
    })
  })

  describe('assignRole and removeRole', () => {
    beforeEach(async () => {
      groupId = (await Group.insert({})).id
    })

    it("adds the user to the manuscript's team for the role", async () => {
      const manuscript = await Manuscript.insert({ groupId })
      const user = await User.insert({})
      await Manuscript.createTeams(manuscript.id)

      await Manuscript.assignRole(user.id, manuscript.id, 'editor', {
        status: 'accepted',
      })

      expect(await membersByRole(manuscript.id)).toEqual({
        editor: [{ userId: user.id, status: 'accepted' }],
      })
    })

    it('stores isShared', async () => {
      const manuscript = await Manuscript.insert({ groupId })
      const user = await User.insert({})
      await Manuscript.createTeams(manuscript.id)

      const team = await Manuscript.assignRole(
        user.id,
        manuscript.id,
        'reviewer',
        {
          isShared: true,
        },
      )

      const member = await TeamMember.query().findOne({
        teamId: team.id,
        userId: user.id,
      })

      expect(member.isShared).toBe(true)
    })

    it('leaves the user as they are when they already have the role', async () => {
      const manuscript = await Manuscript.insert({ groupId })
      const user = await User.insert({})
      await Manuscript.createTeams(manuscript.id)
      await Manuscript.assignRole(user.id, manuscript.id, 'editor', {
        status: 'accepted',
      })

      await Manuscript.assignRole(user.id, manuscript.id, 'editor', {
        status: 'invited',
      })

      expect(await membersByRole(manuscript.id)).toEqual({
        editor: [{ userId: user.id, status: 'accepted' }],
      })
    })

    it('throws when the user already has the role and throwIfAssigned is set', async () => {
      const manuscript = await Manuscript.insert({ groupId })
      const user = await User.insert({})
      await Manuscript.createTeams(manuscript.id)
      await Manuscript.assignRole(user.id, manuscript.id, 'editor')

      await expect(
        Manuscript.assignRole(user.id, manuscript.id, 'editor', {
          throwIfAssigned: true,
        }),
      ).rejects.toThrow(
        `User ${user.id} already has the editor role on manuscript ${manuscript.id}`,
      )
    })

    it("removes the user from the manuscript's team for the role", async () => {
      const manuscript = await Manuscript.insert({ groupId })
      const user = await User.insert({})
      await Manuscript.createTeams(manuscript.id)
      await Manuscript.assignRole(user.id, manuscript.id, 'editor')
      await Manuscript.assignRole(user.id, manuscript.id, 'author')

      await Manuscript.removeRole(user.id, manuscript.id, 'editor')

      expect(await membersByRole(manuscript.id)).toEqual({
        author: [{ userId: user.id, status: null }],
      })
    })

    it('does nothing when removing a role the user does not have', async () => {
      const manuscript = await Manuscript.insert({ groupId })
      const user = await User.insert({})
      await Manuscript.createTeams(manuscript.id)

      const team = await Manuscript.removeRole(user.id, manuscript.id, 'editor')

      expect(team.role).toBe('editor')
      expect(await membersByRole(manuscript.id)).toEqual({})
    })

    it('throws when the user does not have the role and throwIfNotAssigned is set', async () => {
      const manuscript = await Manuscript.insert({ groupId })
      const user = await User.insert({})
      await Manuscript.createTeams(manuscript.id)

      await expect(
        Manuscript.removeRole(user.id, manuscript.id, 'editor', {
          throwIfNotAssigned: true,
        }),
      ).rejects.toThrow(
        `User ${user.id} does not have the editor role on manuscript ${manuscript.id}`,
      )
    })
  })

  describe('createNewManuscript', () => {
    beforeEach(async () => {
      groupId = (await Group.insert({})).id
    })

    it('creates the manuscript with its teams and channels', async () => {
      const manuscript = await Manuscript.createNewManuscript({
        groupId,
        status: 'new',
        submission: { $title: 'A paper' },
      })

      const stored = await Manuscript.findById(manuscript.id)
      const channels = await Channel.query().where({
        manuscriptId: manuscript.id,
      })

      expect(stored.submission.$title).toBe('A paper')
      expect(await teamsOf(manuscript.id)).toHaveLength(7)
      expect(channels.map(channel => channel.type).sort()).toEqual([
        'all',
        'editorial',
      ])
    })

    it('makes the submitter an author and adds them to the discussion channel only', async () => {
      const user = await User.insert({})

      const manuscript = await Manuscript.createNewManuscript({
        groupId,
        submitterId: user.id,
      })

      expect(await membersByRole(manuscript.id)).toEqual({
        author: [{ userId: user.id, status: null }],
      })

      const channelMembers = await ChannelMember.query()
        .join('channels', 'channels.id', 'channel_members.channelId')
        .where('channels.manuscriptId', manuscript.id)
        .select('channels.type', 'channel_members.userId')

      expect(channelMembers).toEqual([{ type: 'all', userId: user.id }])
    })

    it('does not make the submitter an author when told not to', async () => {
      const user = await User.insert({})

      const manuscript = await Manuscript.createNewManuscript(
        { groupId, submitterId: user.id },
        { assignSubmitter: false },
      )

      const channelMembers = await ChannelMember.query()
        .join('channels', 'channels.id', 'channel_members.channelId')
        .where('channels.manuscriptId', manuscript.id)

      expect(manuscript.submitterId).toBe(user.id)
      expect(await membersByRole(manuscript.id)).toEqual({})
      expect(channelMembers).toHaveLength(0)
    })

    it('gives versions teams but not channels', async () => {
      const user = await User.insert({})
      const original = await Manuscript.createNewManuscript({ groupId })

      const version = await Manuscript.createNewManuscript({
        groupId,
        parentId: original.id,
        submitterId: user.id,
      })

      expect(await teamsOf(version.id)).toHaveLength(7)

      expect(
        await Channel.query().where({ manuscriptId: version.id }),
      ).toHaveLength(0)

      expect(await membersByRole(version.id)).toEqual({
        author: [{ userId: user.id, status: null }],
      })
    })

    it('creates no members without a submitter', async () => {
      const manuscript = await Manuscript.createNewManuscript({ groupId })

      const channelMembers = await ChannelMember.query()
        .join('channels', 'channels.id', 'channel_members.channelId')
        .where('channels.manuscriptId', manuscript.id)

      expect(await membersByRole(manuscript.id)).toEqual({})
      expect(channelMembers).toHaveLength(0)
    })

    it('is rolled back with a transaction it joins', async () => {
      const user = await User.insert({})
      const manuscriptId = uuid()

      await expect(
        useTransaction(async trx => {
          await Manuscript.createNewManuscript(
            { id: manuscriptId, groupId, submitterId: user.id },
            { trx },
          )

          throw new Error('Something later failed')
        }),
      ).rejects.toThrow('Something later failed')

      expect(await Manuscript.query().findById(manuscriptId)).toBeUndefined()
      expect(await teamsOf(manuscriptId)).toHaveLength(0)
      expect(await Channel.query().where({ manuscriptId })).toHaveLength(0)
    })
  })

  describe('createNewVersion', () => {
    const users: Record<string, User> = {}

    const createOriginal = async (
      overrides: Record<string, unknown> = {},
    ): Promise<Manuscript> => {
      users.author = await User.insert({})

      const manuscript = await Manuscript.createNewManuscript({
        groupId,
        submitterId: users.author.id,
        status: 'revise',
        decision: 'revise',
        submission: {
          $title: 'A paper',
          adaState: 'process',
          adaJobId: 'job-1',
          adaId: '',
        },
        meta: { source: '<p>Version one</p>' },
        ...overrides,
      })

      await Promise.all(
        [
          ['editor', 'accepted'],
          ['seniorEditor', null],
          ['handlingEditor', null],
          ['managingEditor', null],
          ['reviewer', 'accepted'],
          ['collaborativeReviewer', null],
        ].map(async ([role, status]) => {
          users[role] = await User.insert({})
          await Manuscript.assignRole(users[role].id, manuscript.id, role, {
            status,
          })
        }),
      )

      return Manuscript.findById(manuscript.id)
    }

    beforeEach(async () => {
      groupId = (await Group.insert({})).id

      await Config.insert({
        groupId,
        active: true,
        formData: { submission: { allowAuthorsSubmitNewVersion: false } },
      })
    })

    it('points the new version source at its own copies of the images', async () => {
      const group = await Group.insert({})

      await Config.query().insert({
        active: true,
        groupId: group.id,
        formData: { submission: {} },
      })

      const manuscript = await Manuscript.insert({
        groupId: group.id,
        submission: {},
      })

      const image = await File.insert({
        name: 'abc.png',
        tags: ['manuscriptImage'],
        objectId: manuscript.id,
        storedObjects: [
          {
            type: 'original',
            key: 'abc.png',
            mimetype: 'image/png',
            extension: 'png',
            size: 1,
          },
        ],
      })

      await Manuscript.query()
        .findById(manuscript.id)
        .patch({
          meta: {
            source: `<p><img src="x" data-fileid="${image.id}" /></p>`,
          },
        })

      const original = await Manuscript.query().findById(manuscript.id)
      const newVersion = await original.createNewVersion()

      const copies = await File.query().where({ objectId: newVersion.id })

      expect(copies).toHaveLength(1)
      expect(copies[0].id).not.toBe(image.id)

      expect(newVersion.meta.source).toBe(
        `<p><img src="x" data-fileid="${copies[0].id}" /></p>`,
      )
    })

    it('creates a version linked to the original', async () => {
      const original = await createOriginal()

      const version = await original.createNewVersion()

      expect(version.id).not.toBe(original.id)
      expect(version.parentId).toBe(original.id)
      expect(version.groupId).toBe(groupId)
      expect(version.submission.$title).toBe('A paper')
      expect(version.meta.source).toBe('<p>Version one</p>')
    })

    it('links later versions to the original too', async () => {
      const original = await createOriginal()
      const second = await original.createNewVersion()

      const third = await (
        await Manuscript.findById(second.id)
      ).createNewVersion()

      expect(third.parentId).toBe(original.id)
    })

    it('gives the version all manuscript teams', async () => {
      const original = await createOriginal()

      const version = await original.createNewVersion()

      expect(await teamsOf(version.id)).toHaveLength(7)
    })

    it('carries over authors and editors, with their status, but not reviewers or managing editors', async () => {
      const original = await createOriginal()

      const version = await original.createNewVersion()

      expect(await membersByRole(version.id)).toEqual({
        author: [{ userId: users.author.id, status: null }],
        editor: [{ userId: users.editor.id, status: 'accepted' }],
        seniorEditor: [{ userId: users.seniorEditor.id, status: null }],
        handlingEditor: [{ userId: users.handlingEditor.id, status: null }],
      })
    })

    it("leaves the original's teams alone", async () => {
      const original = await createOriginal()
      const before = await membersByRole(original.id)

      await original.createNewVersion()

      expect(await membersByRole(original.id)).toEqual(before)
    })

    it('does not create channels for the version', async () => {
      const original = await createOriginal()

      const version = await original.createNewVersion()

      expect(
        await Channel.query().where({ manuscriptId: version.id }),
      ).toHaveLength(0)
    })

    it('starts without a decision or author feedback', async () => {
      const original = await createOriginal({ authorFeedback: { text: 'Hi' } })

      const { id } = await original.createNewVersion()
      const version = await Manuscript.findById(id)

      expect(version.decision).toBeNull()
      expect(version.authorFeedback).toEqual({})
    })

    it('drops ADA data that has a value from the submission', async () => {
      const original = await createOriginal()

      const version = await original.createNewVersion()

      expect(version.submission).not.toHaveProperty('adaState')
      expect(version.submission).not.toHaveProperty('adaJobId')
      expect(version.submission.adaId).toBe('')
    })

    it('sets the status to revising after a revise decision', async () => {
      const original = await createOriginal()

      const version = await original.createNewVersion()

      expect(version.status).toBe('revising')
    })

    it('keeps the status otherwise', async () => {
      const original = await createOriginal({ status: 'submitted' })

      const version = await original.createNewVersion()

      expect(version.status).toBe('submitted')
    })

    it('sets the status to revising when authors can always submit new versions', async () => {
      await Config.query()
        .where({ groupId })
        .patch({
          formData: { submission: { allowAuthorsSubmitNewVersion: true } },
        })

      const original = await createOriginal({ status: 'submitted' })

      const version = await original.createNewVersion()

      expect(version.status).toBe('revising')
    })

    it('copies decisions, keeping only their threaded discussions', async () => {
      const original = await createOriginal()

      await Form.insert({
        groupId,
        category: 'decision',
        purpose: 'decision',
        structure: {
          name: 'Decision',
          children: [
            { id: uuid(), component: 'ThreadedDiscussion', name: 'discussion' },
            { id: uuid(), component: 'TextField', name: 'comment' },
          ],
        },
      } as unknown as Partial<Form>)

      await Review.insert({
        manuscriptId: original.id,
        isDecision: true,
        isHiddenFromAuthor: false,
        isHiddenReviewerName: false,
        jsonData: { discussion: 'thread-1', comment: 'Revise this' },
      })

      await Review.insert({
        manuscriptId: original.id,
        isDecision: false,
        isHiddenFromAuthor: false,
        isHiddenReviewerName: false,
        jsonData: { comment: 'A review' },
      })

      const version = await original.createNewVersion()

      const reviews = await Review.query().where({ manuscriptId: version.id })

      expect(reviews).toHaveLength(1)
      expect(reviews[0].isDecision).toBe(true)
      expect(reviews[0].jsonData).toEqual({ discussion: 'thread-1' })
    })
  })

  describe('queries', () => {
    /** Inserts and re-fetches, so that DB-generated fields like shortId are present */
    const createManuscript = async (
      data: Partial<Manuscript> = {},
    ): Promise<Manuscript> => {
      const { id } = await Manuscript.insert({ groupId, ...data })
      return Manuscript.findById(id)
    }

    const createVersion = async (
      firstVersion: Manuscript,
      data: Partial<Manuscript> = {},
    ): Promise<Manuscript> =>
      createManuscript({
        parentId: firstVersion.id,
        shortId: firstVersion.shortId,
        groupId: firstVersion.groupId,
        ...data,
      })

    const createManuscriptWithTeams = async (
      data: Partial<Manuscript> = {},
    ): Promise<Manuscript> => {
      const manuscript = await createManuscript(data)
      await Manuscript.createTeams(manuscript.id)
      return manuscript
    }

    const now = (): number => Date.now()

    beforeEach(async () => {
      groupId = (await Group.insert({})).id
    })

    describe('versions', () => {
      it('getFirstVersionId returns the parent of a version, or the id itself', async () => {
        const first = await createManuscript()
        const second = await createVersion(first)

        expect(await Manuscript.getFirstVersionId(second.id)).toBe(first.id)
        expect(await Manuscript.getFirstVersionId(first.id)).toBe(first.id)
      })

      it('getFirstVersionId falls back to the given id when the manuscript does not exist', async () => {
        const missingId = '00000000-0000-0000-0000-000000000000'
        expect(await Manuscript.getFirstVersionId(missingId)).toBe(missingId)
      })

      it('getFirstVersionIds maps each id to its first version, skipping missing ones', async () => {
        const first = await createManuscript()
        const second = await createVersion(first)
        const other = await createManuscript()

        const ids = await Manuscript.getFirstVersionIds([
          second.id,
          other.id,
          '00000000-0000-0000-0000-000000000000',
        ])

        expect(ids.sort()).toEqual([first.id, other.id].sort())
      })

      it('getLatestVersionId and getLatestVersion return the newest version from any version', async () => {
        const first = await createManuscript()
        const second = await createVersion(first)
        const third = await createVersion(first)

        await Manuscript.backdateCreated(first.id, daysAgo(3))
        await Manuscript.backdateCreated(second.id, daysAgo(1))
        await Manuscript.backdateCreated(third.id, daysAgo(2))

        expect(await Manuscript.getLatestVersionId(first.id)).toBe(second.id)
        expect(await Manuscript.getLatestVersionId(third.id)).toBe(second.id)
        expect((await Manuscript.getLatestVersion(first.id))?.id).toBe(
          second.id,
        )
      })

      it('getLatestVersion returns the manuscript itself when it has no versions', async () => {
        const manuscript = await createManuscript()
        expect((await Manuscript.getLatestVersion(manuscript.id))?.id).toBe(
          manuscript.id,
        )
      })

      it('getOtherVersions returns the later versions of a first version, newest first', async () => {
        const first = await createManuscript()
        const second = await createVersion(first)
        const third = await createVersion(first)

        await Manuscript.backdateCreated(second.id, daysAgo(2))
        await Manuscript.backdateCreated(third.id, daysAgo(1))

        const others = await Manuscript.getOtherVersions(first.id)

        expect(others.map(m => m.id)).toEqual([third.id, second.id])
      })

      it('getOtherVersions returns the siblings and then the first version for a later version', async () => {
        const first = await createManuscript()
        const second = await createVersion(first)
        const third = await createVersion(first)

        const others = await Manuscript.getOtherVersions(second.id)

        expect(others.map(m => m.id)).toEqual([third.id, first.id])
      })

      it('getFirstVersionCreated returns the creation date of the first version', async () => {
        const first = await createManuscript()
        const second = await createVersion(first)
        const created = daysAgo(5)
        await Manuscript.backdateCreated(first.id, created)

        const result = await Manuscript.getFirstVersionCreated(second)

        expect(new Date(result).getTime()).toBe(created.getTime())
      })

      it('getFirstVersionCreated uses the given created date for a first version', async () => {
        const first = await createManuscript()

        const result = await Manuscript.getFirstVersionCreated({
          id: first.id,
          parentId: null,
          created: '2020-01-01T00:00:00.000Z',
        })

        expect(result).toBe('2020-01-01T00:00:00.000Z')
      })

      it('getGroupId returns the group of the manuscript', async () => {
        const manuscript = await createManuscript()
        expect(await Manuscript.getGroupId(manuscript.id)).toBe(groupId)
      })
    })

    describe('isActive', () => {
      it('is true for the latest, visible version', async () => {
        const first = await createManuscript()
        const second = await createVersion(first)

        expect(await Manuscript.isActive(second.id)).toBe(true)
      })

      it('is false for an older version', async () => {
        const first = await createManuscript()
        await createVersion(first)

        expect(await Manuscript.isActive(first.id)).toBe(false)
      })

      it('is false for a hidden manuscript', async () => {
        const manuscript = await createManuscript({ isHidden: true })
        expect(await Manuscript.isActive(manuscript.id)).toBe(false)
      })

      it('is false for a manuscript that does not exist', async () => {
        expect(
          await Manuscript.isActive('00000000-0000-0000-0000-000000000000'),
        ).toBe(false)
      })
    })

    describe('hiding and archiving', () => {
      it('setIsHiddenOnAllVersions hides and unhides every version of the given manuscripts', async () => {
        const first = await createManuscript()
        const second = await createVersion(first)
        const other = await createManuscript()

        const hiddenIds = await Manuscript.setIsHiddenOnAllVersions(
          [first.id],
          true,
        )

        expect(hiddenIds.sort()).toEqual([first.id, second.id].sort())
        expect((await Manuscript.findById(second.id)).isHidden).toBe(true)
        expect((await Manuscript.findById(other.id)).isHidden).toBeFalsy()

        const unhiddenIds = await Manuscript.setIsHiddenOnAllVersions(
          [first.id],
          false,
        )

        expect(unhiddenIds.sort()).toEqual([first.id, second.id].sort())
        expect((await Manuscript.findById(first.id)).isHidden).toBe(false)
      })

      it('archiveNewUnlabelledCreatedBefore only archives old, new, unlabelled manuscripts of the group', async () => {
        const otherGroupId = (await Group.insert({})).id

        const archivable = await createManuscript({
          status: 'new',
          submission: {},
        })

        const emptyLabel = await createManuscript({
          status: 'new',
          submission: { $customStatus: '' },
        })

        const labelled = await createManuscript({
          status: 'new',
          submission: { $customStatus: 'readyToEvaluate' },
        })

        const submitted = await createManuscript({
          status: 'submitted',
          submission: {},
        })

        const recent = await createManuscript({ status: 'new', submission: {} })

        const otherGroup = await createManuscript({
          groupId: otherGroupId,
          status: 'new',
          submission: {},
        })

        await Promise.all(
          [archivable, emptyLabel, labelled, submitted, otherGroup].map(m =>
            Manuscript.backdateCreated(m.id, daysAgo(10)),
          ),
        )

        const count = await Manuscript.archiveNewUnlabelledCreatedBefore(
          groupId,
          daysAgo(5),
        )

        expect(count).toBe(2)

        const hidden = async (m: Manuscript): Promise<boolean | null> =>
          (await Manuscript.findById(m.id)).isHidden

        expect(await hidden(archivable)).toBe(true)
        expect(await hidden(emptyLabel)).toBe(true)
        expect(await hidden(labelled)).toBeFalsy()
        expect(await hidden(submitted)).toBeFalsy()
        expect(await hidden(recent)).toBeFalsy()
        expect(await hidden(otherGroup)).toBeFalsy()
      })

      it('backdateCreated changes created without touching updated', async () => {
        const manuscript = await createManuscript()
        const created = daysAgo(3)

        await Manuscript.backdateCreated(manuscript.id, created)

        const updated = await Manuscript.findById(manuscript.id)

        expect(new Date(updated.created).getTime()).toBe(created.getTime())
        expect(new Date(updated.updated).getTime()).toBe(
          new Date(manuscript.updated).getTime(),
        )
      })
    })

    describe('submitter', () => {
      it('getSubmitter returns the submitting user', async () => {
        const user = await User.insert({ username: 'submitter' })
        const manuscript = await createManuscript({ submitterId: user.id })

        expect((await Manuscript.getSubmitter(manuscript.id))?.id).toBe(user.id)
      })

      it('clearSubmitter removes the user as submitter in every group', async () => {
        const otherGroupId = (await Group.insert({})).id
        const user = await User.insert({})
        const mine = await createManuscript({ submitterId: user.id })

        const otherGroup = await createManuscript({
          groupId: otherGroupId,
          submitterId: user.id,
        })

        expect(await Manuscript.clearSubmitter(user.id)).toBe(2)
        expect((await Manuscript.findById(mine.id)).submitterId).toBeNull()
        expect(
          (await Manuscript.findById(otherGroup.id)).submitterId,
        ).toBeNull()
      })

      it('clearSubmitterInGroup only removes the user as submitter in the given group', async () => {
        const otherGroupId = (await Group.insert({})).id
        const user = await User.insert({})
        const mine = await createManuscript({ submitterId: user.id })

        const otherGroup = await createManuscript({
          groupId: otherGroupId,
          submitterId: user.id,
        })

        expect(await Manuscript.clearSubmitterInGroup(user.id, groupId)).toBe(1)
        expect((await Manuscript.findById(mine.id)).submitterId).toBeNull()
        expect((await Manuscript.findById(otherGroup.id)).submitterId).toBe(
          user.id,
        )
      })
    })

    describe('lookups by submission fields', () => {
      it('findByDoi matches either $doi or doi within the group', async () => {
        const otherGroupId = (await Group.insert({})).id

        const withDollarDoi = await createManuscript({
          submission: { $doi: '10.1/one' },
        })

        const withDoi = await createManuscript({
          submission: { doi: '10.1/two' },
        })

        await createManuscript({
          groupId: otherGroupId,
          submission: { $doi: '10.1/three' },
        })

        expect((await Manuscript.findByDoi(groupId, '10.1/one'))?.id).toBe(
          withDollarDoi.id,
        )
        expect((await Manuscript.findByDoi(groupId, '10.1/two'))?.id).toBe(
          withDoi.id,
        )
        expect(
          await Manuscript.findByDoi(groupId, '10.1/three'),
        ).toBeUndefined()
      })

      it('findBySourceUri matches either $sourceUri or link within the group', async () => {
        const withSourceUri = await createManuscript({
          submission: { $sourceUri: 'https://example.com/one' },
        })

        const withLink = await createManuscript({
          submission: { link: 'https://example.com/two' },
        })

        expect(
          (await Manuscript.findBySourceUri(groupId, 'https://example.com/one'))
            ?.id,
        ).toBe(withSourceUri.id)
        expect(
          (await Manuscript.findBySourceUri(groupId, 'https://example.com/two'))
            ?.id,
        ).toBe(withLink.id)
        expect(
          await Manuscript.findBySourceUri(groupId, 'https://example.com/none'),
        ).toBeUndefined()
      })

      it('getDoisInGroup returns the non-empty DOIs of manuscripts with the given hidden state', async () => {
        await createManuscript({ submission: { $doi: '10.1/visible' } })
        await createManuscript({ submission: { $doi: '' } })

        await createManuscript({
          isHidden: true,
          submission: { $doi: '10.1/hidden' },
        })

        expect(await Manuscript.getDoisInGroup(groupId, false)).toEqual([
          '10.1/visible',
        ])
        expect(await Manuscript.getDoisInGroup(groupId, true)).toEqual([
          '10.1/hidden',
        ])
      })

      it('findReadyToEvaluate returns new manuscripts labelled readyToEvaluate in the group', async () => {
        const ready = await createManuscript({
          status: 'new',
          submission: { $customStatus: 'readyToEvaluate' },
        })

        await createManuscript({
          status: 'submitted',
          submission: { $customStatus: 'readyToEvaluate' },
        })

        await createManuscript({ status: 'new', submission: {} })

        const found = await Manuscript.findReadyToEvaluate(groupId)

        expect(found.map(m => m.id)).toEqual([ready.id])
      })
    })

    describe('listing', () => {
      it('findNonHiddenFirstVersions returns visible first versions, newest first', async () => {
        const older = await createManuscript()
        const newer = await createManuscript()
        await createVersion(older)
        await createManuscript({ isHidden: true })

        await Manuscript.backdateCreated(older.id, daysAgo(2))
        await Manuscript.backdateCreated(newer.id, daysAgo(1))

        const found = await Manuscript.findNonHiddenFirstVersions()

        expect(found.map(m => m.id)).toEqual([newer.id, older.id])
      })

      it('findPublishedById only returns published manuscripts', async () => {
        const published = await createManuscript({
          published: new Date().toISOString(),
        })

        const unpublished = await createManuscript()

        expect((await Manuscript.findPublishedById(published.id))?.id).toBe(
          published.id,
        )
        expect(
          await Manuscript.findPublishedById(unpublished.id),
        ).toBeUndefined()
      })

      it('findPublishedLatestVersions returns the latest version of each published manuscript', async () => {
        const first = await createManuscript({
          published: daysAgo(3).toISOString(),
        })

        const second = await createVersion(first, {
          published: daysAgo(1).toISOString(),
        })

        const otherPublished = await createManuscript({
          published: daysAgo(2).toISOString(),
        })

        const latestUnpublished = await createManuscript({
          published: daysAgo(2).toISOString(),
        })

        await createVersion(latestUnpublished)

        await Manuscript.backdateCreated(first.id, daysAgo(4))

        const found = await Manuscript.findPublishedLatestVersions(groupId)

        expect(found.map(m => m.id)).toEqual([second.id, otherPublished.id])
        expect(Number(found[0].totalCount)).toBe(2)

        const recent = await Manuscript.findPublishedLatestVersions(groupId, {
          startDate: daysAgo(1.5).toISOString(),
        })

        expect(recent.map(m => m.id)).toEqual([second.id])
      })
    })

    describe('files and channels', () => {
      it('findFilesOfManuscripts returns the files of all given manuscripts', async () => {
        const one = await createManuscript()
        const two = await createManuscript()
        const three = await createManuscript()

        const fileOne = await File.insert({
          name: 'one.png',
          objectId: one.id,
          storedObjects: fileStoredObjects,
        })

        const fileTwo = await File.insert({
          name: 'two.png',
          objectId: two.id,
          storedObjects: fileStoredObjects,
        })

        await File.insert({
          name: 'three.png',
          objectId: three.id,
          storedObjects: fileStoredObjects,
        })

        const files = await Manuscript.findFilesOfManuscripts([one.id, two.id])

        expect(files.map(f => f.id).sort()).toEqual(
          [fileOne.id, fileTwo.id].sort(),
        )
      })

      it('getSupplementaryFiles only returns files tagged supplementary', async () => {
        const manuscript = await createManuscript()

        const supplementary = await File.insert({
          name: 'data.csv',
          objectId: manuscript.id,
          tags: ['supplementary'],
          storedObjects: fileStoredObjects,
        })

        await File.insert({
          name: 'figure.png',
          objectId: manuscript.id,
          tags: ['manuscriptImage'],
          storedObjects: fileStoredObjects,
        })

        const files = await Manuscript.getSupplementaryFiles(manuscript.id)

        expect(files.map(f => f.id)).toEqual([supplementary.id])
      })

      it('getChannels and findEditorialDiscussionChannel return the manuscript channels', async () => {
        const manuscript = await createManuscript()
        await Manuscript.createChannels(manuscript.id, groupId)

        const channels = await Manuscript.getChannels(manuscript.id)

        expect(channels.map(c => c.topic).sort()).toEqual([
          'Editorial discussion',
          'Manuscript discussion',
        ])

        const editorial = await Manuscript.findEditorialDiscussionChannel(
          manuscript.id,
        )

        expect(editorial?.topic).toBe('Editorial discussion')
      })

      it('findByIdWithTeamUsersAndChannels loads team users with their default identity, and channels', async () => {
        const author = await User.insert({ username: 'author' })

        await Identity.insert({
          userId: author.id,
          isDefault: true,
          type: 'orcid',
          identifier: '0000-0002-1825-0097',
        })

        const manuscript = await createManuscriptWithTeams()
        await Manuscript.createChannels(manuscript.id, groupId)
        await Manuscript.assignRole(author.id, manuscript.id, 'author')

        const found = (await Manuscript.findByIdWithTeamUsersAndChannels(
          manuscript.id,
        )) as Manuscript & {
          teams: {
            role: string
            members: {
              user: { id: string; defaultIdentity: { identifier: string } }
            }[]
          }[]
          channels: { topic: string }[]
        }

        const authorTeam = found.teams.find(t => t.role === 'author')

        expect(authorTeam?.members[0].user.id).toBe(author.id)
        expect(authorTeam?.members[0].user.defaultIdentity.identifier).toBe(
          '0000-0002-1825-0097',
        )
        expect(found.channels).toHaveLength(2)
      })
    })

    describe('reports', () => {
      it('getSummaryStatsForDateRange counts submitted and unsubmitted first versions in the range', async () => {
        await createManuscript({ status: 'submitted' })
        await createManuscript({ status: 'new' })
        const old = await createManuscript({ status: 'submitted' })
        await Manuscript.backdateCreated(old.id, daysAgo(10))

        const stats = await Manuscript.getSummaryStatsForDateRange(
          groupId,
          now() - DAY,
          now() + DAY,
        )

        expect(Number(stats.submittedCount)).toBe(1)
        expect(Number(stats.unsubmittedCount)).toBe(1)
      })

      it('countPublishedSince counts visible manuscripts published since the date', async () => {
        await createManuscript({ published: new Date().toISOString() })
        await createManuscript({ published: daysAgo(2).toISOString() })

        await createManuscript({
          published: new Date().toISOString(),
          isHidden: true,
        })

        expect(await Manuscript.countPublishedSince(groupId, daysAgo(1))).toBe(
          1,
        )
      })

      it('countRevisingNow counts manuscripts whose latest version is being revised', async () => {
        await createManuscript({ status: 'revise' })

        const revisedInVersion = await createManuscript({ status: 'submitted' })
        await createVersion(revisedInVersion, { status: 'revising' })

        const resubmitted = await createManuscript({ status: 'revise' })
        const resubmittedVersion = await createVersion(resubmitted, {
          status: 'submitted',
        })

        await Manuscript.backdateCreated(resubmitted.id, daysAgo(2))
        await Manuscript.backdateCreated(resubmittedVersion.id, daysAgo(1))

        await createManuscript({ status: 'revise', isHidden: true })

        expect(await Manuscript.countRevisingNow(groupId)).toBe(2)
      })

      it('getReviewAndCompletionDurations returns durations from submission to publication', async () => {
        await createManuscript({
          submittedDate: daysAgo(2).toISOString(),
          published: new Date().toISOString(),
        })

        await createManuscript()

        const rows = await Manuscript.getReviewAndCompletionDurations(
          groupId,
          now() - DAY,
          now() + DAY,
        )

        expect(rows).toHaveLength(1)
        expect(Number(rows[0].full_duration_days)).toBeCloseTo(2, 1)
        expect(rows[0].review_duration_days).toBeNull()
      })

      it('findFirstVersionsWithCompletedDate uses the publication or rejection date', async () => {
        const published = await createManuscript({
          submittedDate: daysAgo(3).toISOString(),
          published: daysAgo(1).toISOString(),
        })

        const rejected = await createManuscript({
          submittedDate: daysAgo(3).toISOString(),
        })

        const rejection = await Review.insert({
          manuscriptId: rejected.id,
          isDecision: true,
          jsonData: { $verdict: 'reject' },
        })

        const inProgress = await createManuscript({
          submittedDate: daysAgo(3).toISOString(),
        })

        const found = await Manuscript.findFirstVersionsWithCompletedDate(
          groupId,
          now() - DAY,
          now() + DAY,
        )

        const completedDate = (id: string): string | null | undefined =>
          found.find(m => m.id === id)?.completedDate

        expect(new Date(completedDate(published.id)!).getTime()).toBe(
          new Date(published.published as string).getTime(),
        )
        expect(new Date(completedDate(rejected.id)!).getTime()).toBe(
          new Date(rejection.created).getTime(),
        )
        expect(completedDate(inProgress.id)).toBeNull()
      })

      it('getActivityByManuscript returns each first version with its latest status and authors', async () => {
        const author = await User.insert({ username: 'author' })

        const manuscript = await createManuscriptWithTeams({
          status: 'submitted',
          submission: { $title: 'A title' },
        })

        await Manuscript.assignRole(author.id, manuscript.id, 'author')

        const rows = (await Manuscript.getActivityByManuscript(
          groupId,
          now() - DAY,
          now() + DAY,
        )) as {
          short_id: number
          title: string
          status: string
          authors: { username: string }[]
        }[]

        expect(rows).toHaveLength(1)
        expect(rows[0].short_id).toBe(manuscript.shortId)
        expect(rows[0].title).toBe('A title')
        expect(rows[0].status).toBe('submitted')
        expect(rows[0].authors.map(a => a.username)).toEqual(['author'])
      })

      it('getActivityByEditor counts the manuscripts assigned to each editor', async () => {
        const editor = await User.insert({ username: 'editor' })
        const one = await createManuscriptWithTeams({ status: 'rejected' })
        const two = await createManuscriptWithTeams({ status: 'submitted' })
        await Manuscript.assignRole(editor.id, one.id, 'editor')
        await Manuscript.assignRole(editor.id, two.id, 'handlingEditor')

        const rows = (await Manuscript.getActivityByEditor(
          groupId,
          now() - DAY,
          now() + DAY,
        )) as { name: string; assignedCount: string; rejectedCount: string }[]

        expect(rows).toHaveLength(1)
        expect(rows[0].name).toBe('editor')
        expect(Number(rows[0].assignedCount)).toBe(2)
        expect(Number(rows[0].rejectedCount)).toBe(1)
      })

      it('getActivityByReviewer counts invitations, completed reviews and verdicts', async () => {
        const reviewer = await User.insert({ username: 'reviewer' })
        const manuscript = await createManuscriptWithTeams()

        await Manuscript.assignRole(reviewer.id, manuscript.id, 'reviewer', {
          status: 'completed',
        })

        await Review.insert({
          manuscriptId: manuscript.id,
          userId: reviewer.id,
          isDecision: false,
          jsonData: { $verdict: 'accept' },
        })

        const rows = (await Manuscript.getActivityByReviewer(
          groupId,
          now() - DAY,
          now() + DAY,
        )) as {
          name: string
          invitesCount: string
          reviewsCompletedCount: string
          reccAcceptCount: string
        }[]

        expect(rows).toHaveLength(1)
        expect(rows[0].name).toBe('reviewer')
        expect(Number(rows[0].invitesCount)).toBe(1)
        expect(Number(rows[0].reviewsCompletedCount)).toBe(1)
        expect(Number(rows[0].reccAcceptCount)).toBe(1)
      })

      it('findFirstVersionsWithTeamUsers loads team users of the first version and its versions', async () => {
        const author = await User.insert({ username: 'author' })
        const first = await createManuscriptWithTeams()
        const second = await createVersion(first)
        await Manuscript.createTeams(second.id)
        await Manuscript.assignRole(author.id, first.id, 'author')
        await Manuscript.assignRole(author.id, second.id, 'author')

        const found = (await Manuscript.findFirstVersionsWithTeamUsers(
          groupId,
          now() - DAY,
          now() + DAY,
        )) as (Manuscript & {
          teams: { role: string; users: { id: string }[] }[]
          manuscriptVersions: (Manuscript & {
            teams: { role: string; users: { id: string }[] }[]
          })[]
        })[]

        expect(found.map(m => m.id)).toEqual([first.id])

        const authorsOf = (m: {
          teams: { role: string; users: { id: string }[] }[]
        }): string[] =>
          m.teams.find(t => t.role === 'author')?.users.map(u => u.id) ?? []

        expect(authorsOf(found[0])).toEqual([author.id])
        expect(found[0].manuscriptVersions.map(v => v.id)).toEqual([second.id])
        expect(authorsOf(found[0].manuscriptVersions[0])).toEqual([author.id])
      })
    })
  })
})
