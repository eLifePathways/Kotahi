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
})
