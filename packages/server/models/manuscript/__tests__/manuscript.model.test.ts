import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { db, config, DbTestUtils, migrationManager } from '@coko/server'

import Manuscript from '../manuscript.model'
import Review from '../../review/review.model'
import Team from '../../team/team.model'
import User from '../../user/user.model'
import TeamMember from '../../teamMember/teamMember.model'
import Invitation from '../../invitation/invitation.model'
import Group from '../../group/group.model'
import Task from '../../task/task.model'

describe('Manuscript model', () => {
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
})
