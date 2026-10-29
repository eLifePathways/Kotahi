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

      // @ts-ignore
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
      })

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
})
