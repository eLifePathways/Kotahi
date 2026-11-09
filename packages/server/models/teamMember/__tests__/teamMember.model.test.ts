import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { db, config, DbTestUtils, migrationManager } from '@coko/server'

import Group from '../../group/group.model'
import User from '../../user/user.model'
import Manuscript from '../../manuscript/manuscript.model'
import Team from '../../team/team.model'
import TeamMember from '../teamMember.model'

describe('TeamMember model', () => {
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

  it('gets reviewer statuses for a user, across reviewer and collaborative reviewer roles', async () => {
    const group = await Group.insert({})
    const user = await User.insert({})
    const manuscriptOne = await Manuscript.insert({ groupId: group.id })
    const manuscriptTwo = await Manuscript.insert({ groupId: group.id })

    const reviewerTeam = await Team.insert({
      objectId: manuscriptOne.id,
      objectType: 'manuscript',
      role: 'reviewer',
      displayName: 'Reviewers',
    })

    await Team.addMember(reviewerTeam.id, user.id, { status: 'invited' })

    const collaborativeReviewerTeam = await Team.insert({
      objectId: manuscriptTwo.id,
      objectType: 'manuscript',
      role: 'collaborativeReviewer',
      displayName: 'Collaborative Reviewers',
    })

    await Team.addMember(collaborativeReviewerTeam.id, user.id, {
      status: 'accepted',
    })

    const rows = await TeamMember.getReviewerStatusesForUser(user.id, group.id)

    expect(rows).toHaveLength(2)

    expect(rows).toEqual(
      expect.arrayContaining([
        { manuscriptId: manuscriptOne.id, status: 'invited' },
        { manuscriptId: manuscriptTwo.id, status: 'accepted' },
      ]),
    )
  })

  it('excludes non-reviewer roles for the same user and manuscript', async () => {
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

    const rows = await TeamMember.getReviewerStatusesForUser(user.id, group.id)

    expect(rows).toHaveLength(0)
  })

  it('excludes reviewer statuses belonging to a different user', async () => {
    const group = await Group.insert({})
    const user = await User.insert({})
    const otherUser = await User.insert({})
    const manuscript = await Manuscript.insert({ groupId: group.id })

    const reviewerTeam = await Team.insert({
      objectId: manuscript.id,
      objectType: 'manuscript',
      role: 'reviewer',
      displayName: 'Reviewers',
    })

    await Team.addMember(reviewerTeam.id, otherUser.id, { status: 'invited' })

    const rows = await TeamMember.getReviewerStatusesForUser(user.id, group.id)

    expect(rows).toHaveLength(0)
  })

  it('excludes reviewer statuses for manuscripts in a different group', async () => {
    const group = await Group.insert({})
    const otherGroup = await Group.insert({})
    const user = await User.insert({})
    const manuscript = await Manuscript.insert({ groupId: otherGroup.id })

    const reviewerTeam = await Team.insert({
      objectId: manuscript.id,
      objectType: 'manuscript',
      role: 'reviewer',
      displayName: 'Reviewers',
    })

    await Team.addMember(reviewerTeam.id, user.id, { status: 'invited' })

    const rows = await TeamMember.getReviewerStatusesForUser(user.id, group.id)

    expect(rows).toHaveLength(0)
  })

  it('filters to the given statuses when a statusFilter is provided', async () => {
    const group = await Group.insert({})
    const user = await User.insert({})
    const invitedManuscript = await Manuscript.insert({ groupId: group.id })
    const rejectedManuscript = await Manuscript.insert({ groupId: group.id })

    const invitedTeam = await Team.insert({
      objectId: invitedManuscript.id,
      objectType: 'manuscript',
      role: 'reviewer',
      displayName: 'Reviewers',
    })

    await Team.addMember(invitedTeam.id, user.id, { status: 'invited' })

    const rejectedTeam = await Team.insert({
      objectId: rejectedManuscript.id,
      objectType: 'manuscript',
      role: 'reviewer',
      displayName: 'Reviewers',
    })

    await Team.addMember(rejectedTeam.id, user.id, { status: 'rejected' })

    const rows = await TeamMember.getReviewerStatusesForUser(
      user.id,
      group.id,
      { statusFilter: ['invited', 'accepted', 'inProgress'] },
    )

    expect(rows).toEqual([
      { manuscriptId: invitedManuscript.id, status: 'invited' },
    ])
  })

  describe('findReviewerMemberOnManuscript', () => {
    it("returns the user's reviewer or collaborative reviewer membership on the manuscript", async () => {
      const manuscript = await Manuscript.insert({})
      const otherManuscript = await Manuscript.insert({})
      await Manuscript.createTeams(manuscript.id)
      await Manuscript.createTeams(otherManuscript.id)
      const reviewer = await User.insert({})
      const collaborative = await User.insert({})
      const author = await User.insert({})

      await Manuscript.assignRole(reviewer.id, manuscript.id, 'reviewer')

      await Manuscript.assignRole(
        collaborative.id,
        manuscript.id,
        'collaborativeReviewer',
      )

      await Manuscript.assignRole(author.id, manuscript.id, 'author')
      await Manuscript.assignRole(author.id, otherManuscript.id, 'reviewer')

      expect(
        (
          await TeamMember.findReviewerMemberOnManuscript(
            reviewer.id,
            manuscript.id,
          )
        )?.userId,
      ).toBe(reviewer.id)

      expect(
        (
          await TeamMember.findReviewerMemberOnManuscript(
            collaborative.id,
            manuscript.id,
          )
        )?.userId,
      ).toBe(collaborative.id)

      expect(
        await TeamMember.findReviewerMemberOnManuscript(
          author.id,
          manuscript.id,
        ),
      ).toBeUndefined()
    })
  })

  describe('hasCompletedReview', () => {
    it('is true only for a reviewer of the manuscript with completed status', async () => {
      const manuscript = await Manuscript.insert({})
      const otherManuscript = await Manuscript.insert({})
      await Manuscript.createTeams(manuscript.id)
      await Manuscript.createTeams(otherManuscript.id)
      const completed = await User.insert({})
      const inProgress = await User.insert({})
      const elsewhere = await User.insert({})

      await Manuscript.assignRole(completed.id, manuscript.id, 'reviewer', {
        status: 'completed',
      })

      await Manuscript.assignRole(inProgress.id, manuscript.id, 'reviewer', {
        status: 'inProgress',
      })

      await Manuscript.assignRole(
        elsewhere.id,
        otherManuscript.id,
        'collaborativeReviewer',
        { status: 'completed' },
      )

      expect(
        await TeamMember.hasCompletedReview(completed.id, manuscript.id),
      ).toBe(true)
      expect(
        await TeamMember.hasCompletedReview(inProgress.id, manuscript.id),
      ).toBe(false)
      expect(
        await TeamMember.hasCompletedReview(elsewhere.id, manuscript.id),
      ).toBe(false)
    })
  })

  describe('patchByTeamId', () => {
    it('patches every member of the team only', async () => {
      const manuscript = await Manuscript.insert({})
      await Manuscript.createTeams(manuscript.id)
      const one = await User.insert({})
      const two = await User.insert({})

      const team = await Manuscript.assignRole(
        one.id,
        manuscript.id,
        'collaborativeReviewer',
      )

      await Manuscript.assignRole(
        two.id,
        manuscript.id,
        'collaborativeReviewer',
      )

      const otherTeam = await Manuscript.assignRole(
        one.id,
        manuscript.id,
        'reviewer',
      )

      expect(await TeamMember.patchByTeamId(team.id, { isShared: true })).toBe(
        2,
      )

      const { result: members } = await TeamMember.find({ teamId: team.id })

      const { result: otherMembers } = await TeamMember.find({
        teamId: otherTeam.id,
      })

      expect(members.map(m => m.isShared)).toEqual([true, true])
      expect(otherMembers[0].isShared).toBeFalsy()
    })
  })

  describe('patchStatusByTeam', () => {
    it('only patches team members whose status is one of the given ones', async () => {
      const manuscript = await Manuscript.insert({})
      await Manuscript.createTeams(manuscript.id)
      const closed = await User.insert({})
      const inProgress = await User.insert({})
      const completed = await User.insert({})

      const team = await Manuscript.assignRole(
        closed.id,
        manuscript.id,
        'collaborativeReviewer',
        { status: 'closed' },
      )

      await Manuscript.assignRole(
        inProgress.id,
        manuscript.id,
        'collaborativeReviewer',
        { status: 'inProgress' },
      )

      await Manuscript.assignRole(
        completed.id,
        manuscript.id,
        'collaborativeReviewer',
        { status: 'completed' },
      )

      expect(
        await TeamMember.patchStatusByTeam(
          team.id,
          ['closed', 'inProgress'],
          'inProgress',
        ),
      ).toBe(2)

      const { result: members } = await TeamMember.find({ teamId: team.id })

      const statusOf = (userId: string): string | null | undefined =>
        members.find(m => m.userId === userId)?.status

      expect(statusOf(closed.id)).toBe('inProgress')
      expect(statusOf(inProgress.id)).toBe('inProgress')
      expect(statusOf(completed.id)).toBe('completed')
    })
  })
})
