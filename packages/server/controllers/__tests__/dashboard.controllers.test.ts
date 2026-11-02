import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { db, config, DbTestUtils, migrationManager } from '@coko/server'

import Group from '../../models/group/group.model'
import User from '../../models/user/user.model'
import Manuscript from '../../models/manuscript/manuscript.model'
import Team from '../../models/team/team.model'
import Task from '../../models/task/task.model'
import Config from '../../models/config/config.model'
import { getDashboardData } from '../dashboard.controllers'

const activateConfig = async (
  groupId: string,
  showSections: string[],
): Promise<void> => {
  await Config.insert({
    groupId,
    active: true,
    formData: { dashboard: { showSections } },
  })
}

describe('getDashboardData', () => {
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

  it('returns empty data when no dashboard sections are enabled', async () => {
    const group = await Group.insert({})
    const user = await User.insert({})

    await activateConfig(group.id, [])

    const result = await getDashboardData(user.id, group.id)

    expect(result).toEqual({
      actionCardData: [],
      submissionsData: null,
      reviewData: null,
      editingQueueData: null,
    })
  })

  it('returns an authorSubmit action card for a new, unsubmitted manuscript', async () => {
    const group = await Group.insert({})
    const user = await User.insert({})

    await activateConfig(group.id, ['submission'])

    const manuscript = await Manuscript.insert({
      groupId: group.id,
      status: 'new',
      shortId: 101,
      submission: { $title: 'A Title' },
    })

    const authorTeam = await Team.insert({
      objectId: manuscript.id,
      objectType: 'manuscript',
      role: 'author',
      displayName: 'Author',
    })

    await Team.addMember(authorTeam.id, user.id)

    const result = await getDashboardData(user.id, group.id)

    expect(result.actionCardData).toEqual([
      {
        id: `authorSubmit-${manuscript.id}`,
        type: 'authorSubmit',
        bucket: 'submissions',
        manuscriptId: manuscript.id,
        shortId: '101',
        title: 'A Title',
      },
    ])

    expect(result.submissionsData).toEqual({ totalCount: 1 })
    expect(result.reviewData).toBeNull()
    expect(result.editingQueueData).toBeNull()
  })

  it('returns an authorRevise action card for a manuscript needing revision', async () => {
    const group = await Group.insert({})
    const user = await User.insert({})

    await activateConfig(group.id, ['submission'])

    const manuscript = await Manuscript.insert({
      groupId: group.id,
      status: 'revise',
      shortId: 102,
      submission: { $title: 'Needs Revision' },
    })

    const authorTeam = await Team.insert({
      objectId: manuscript.id,
      objectType: 'manuscript',
      role: 'author',
      displayName: 'Author',
    })

    await Team.addMember(authorTeam.id, user.id)

    const result = await getDashboardData(user.id, group.id)

    expect(result.actionCardData).toEqual([
      expect.objectContaining({
        type: 'authorRevise',
        manuscriptId: manuscript.id,
      }),
    ])
  })

  it('returns an authorSubmitRevision action card for a manuscript being revised', async () => {
    const group = await Group.insert({})
    const user = await User.insert({})

    await activateConfig(group.id, ['submission'])

    const manuscript = await Manuscript.insert({
      groupId: group.id,
      status: 'revising',
      shortId: 103,
      submission: { $title: 'Being Revised' },
    })

    const authorTeam = await Team.insert({
      objectId: manuscript.id,
      objectType: 'manuscript',
      role: 'author',
      displayName: 'Author',
    })

    await Team.addMember(authorTeam.id, user.id)

    const result = await getDashboardData(user.id, group.id)

    expect(result.actionCardData).toEqual([
      expect.objectContaining({
        type: 'authorSubmitRevision',
        manuscriptId: manuscript.id,
      }),
    ])
  })

  it('returns no author action card when no author action is needed', async () => {
    const group = await Group.insert({})
    const user = await User.insert({})

    await activateConfig(group.id, ['submission'])

    const manuscript = await Manuscript.insert({
      groupId: group.id,
      status: 'submitted',
      shortId: 104,
      submission: { $title: 'Already Submitted' },
    })

    const authorTeam = await Team.insert({
      objectId: manuscript.id,
      objectType: 'manuscript',
      role: 'author',
      displayName: 'Author',
    })

    await Team.addMember(authorTeam.id, user.id)

    const result = await getDashboardData(user.id, group.id)

    expect(result.actionCardData).toEqual([])
    expect(result.submissionsData).toEqual({ totalCount: 1 })
  })

  it('returns a reviewerRespond action card for an invited reviewer status', async () => {
    const group = await Group.insert({})
    const user = await User.insert({})

    await activateConfig(group.id, ['review'])

    const manuscript = await Manuscript.insert({
      groupId: group.id,
      shortId: 202,
      submission: { $title: 'Review Me' },
    })

    const reviewerTeam = await Team.insert({
      objectId: manuscript.id,
      objectType: 'manuscript',
      role: 'reviewer',
      displayName: 'Reviewers',
    })

    await Team.addMember(reviewerTeam.id, user.id, { status: 'invited' })

    const result = await getDashboardData(user.id, group.id)

    expect(result.actionCardData).toEqual([
      {
        id: `reviewerRespond-${manuscript.id}`,
        type: 'reviewerRespond',
        bucket: 'review',
        manuscriptId: manuscript.id,
        shortId: '202',
        title: 'Review Me',
      },
    ])
  })

  it('returns a reviewerSubmit action card for an accepted reviewer status', async () => {
    const group = await Group.insert({})
    const user = await User.insert({})

    await activateConfig(group.id, ['review'])

    const manuscript = await Manuscript.insert({
      groupId: group.id,
      shortId: 203,
      submission: { $title: 'Review In Progress' },
    })

    const reviewerTeam = await Team.insert({
      objectId: manuscript.id,
      objectType: 'manuscript',
      role: 'reviewer',
      displayName: 'Reviewers',
    })

    await Team.addMember(reviewerTeam.id, user.id, { status: 'accepted' })

    const result = await getDashboardData(user.id, group.id)

    expect(result.actionCardData).toEqual([
      expect.objectContaining({
        type: 'reviewerSubmit',
        manuscriptId: manuscript.id,
      }),
    ])
  })

  it('returns an editorDecide action card for an undecided manuscript', async () => {
    const group = await Group.insert({})
    const user = await User.insert({})

    await activateConfig(group.id, ['editor'])

    const manuscript = await Manuscript.insert({
      groupId: group.id,
      status: 'submitted',
      shortId: 303,
      submission: { $title: 'Decide Me' },
    })

    const editorTeam = await Team.insert({
      objectId: manuscript.id,
      objectType: 'manuscript',
      role: 'editor',
      displayName: 'Editor',
    })

    await Team.addMember(editorTeam.id, user.id)

    const result = await getDashboardData(user.id, group.id)

    expect(result.actionCardData).toEqual([
      {
        id: `editorDecide-${manuscript.id}`,
        type: 'editorDecide',
        bucket: 'editingQueue',
        manuscriptId: manuscript.id,
        shortId: '303',
        title: 'Decide Me',
      },
    ])
  })

  it('excludes the editorDecide action card once a decision has been made', async () => {
    const group = await Group.insert({})
    const user = await User.insert({})

    await activateConfig(group.id, ['editor'])

    const manuscript = await Manuscript.insert({
      groupId: group.id,
      status: 'submitted',
      decision: 'accept',
      shortId: 304,
      submission: { $title: 'Already Decided' },
    })

    const editorTeam = await Team.insert({
      objectId: manuscript.id,
      objectType: 'manuscript',
      role: 'editor',
      displayName: 'Editor',
    })

    await Team.addMember(editorTeam.id, user.id)

    const result = await getDashboardData(user.id, group.id)

    expect(result.actionCardData).toEqual([])
  })

  it('excludes the editorDecide action card for a manuscript still in "new" status', async () => {
    const group = await Group.insert({})
    const user = await User.insert({})

    await activateConfig(group.id, ['editor'])

    const manuscript = await Manuscript.insert({
      groupId: group.id,
      status: 'new',
      shortId: 305,
      submission: { $title: 'Not Submitted Yet' },
    })

    const editorTeam = await Team.insert({
      objectId: manuscript.id,
      objectType: 'manuscript',
      role: 'editor',
      displayName: 'Editor',
    })

    await Team.addMember(editorTeam.id, user.id)

    const result = await getDashboardData(user.id, group.id)

    expect(result.actionCardData).toEqual([])
  })

  it('buckets an overdue task under the editing queue when the user has multiple roles on the manuscript', async () => {
    const group = await Group.insert({})
    const user = await User.insert({})

    await activateConfig(group.id, ['submission', 'review', 'editor'])

    const manuscript = await Manuscript.insert({
      groupId: group.id,
      status: 'submitted',
      decision: 'accept',
      shortId: 404,
      submission: { $title: 'Multi Role' },
    })

    const authorTeam = await Team.insert({
      objectId: manuscript.id,
      objectType: 'manuscript',
      role: 'author',
      displayName: 'Author',
    })

    await Team.addMember(authorTeam.id, user.id)

    const reviewerTeam = await Team.insert({
      objectId: manuscript.id,
      objectType: 'manuscript',
      role: 'reviewer',
      displayName: 'Reviewers',
    })

    await Team.addMember(reviewerTeam.id, user.id, { status: 'accepted' })

    const editorTeam = await Team.insert({
      objectId: manuscript.id,
      objectType: 'manuscript',
      role: 'editor',
      displayName: 'Editor',
    })

    await Team.addMember(editorTeam.id, user.id)

    const pastDueDate = new Date(Date.now() - 24 * 60 * 60 * 1000)

    await Task.insert({
      manuscriptId: manuscript.id,
      groupId: group.id,
      assigneeUserId: user.id,
      status: 'In progress',
      dueDate: pastDueDate.toISOString(),
      sequenceIndex: 0,
    })

    const result = await getDashboardData(user.id, group.id)

    const taskCard = result.actionCardData.find(
      card => card.type === 'taskOverdue' || card.type === 'taskAlmostOverdue',
    )

    expect(taskCard?.bucket).toBe('editingQueue')
    expect(taskCard?.type).toBe('taskOverdue')
  })

  it('classifies a task due within the threshold as almost overdue rather than overdue', async () => {
    const group = await Group.insert({})
    const user = await User.insert({})

    await activateConfig(group.id, ['submission'])

    const manuscript = await Manuscript.insert({
      groupId: group.id,
      status: 'submitted',
      shortId: 505,
      submission: { $title: 'Almost Overdue' },
    })

    const authorTeam = await Team.insert({
      objectId: manuscript.id,
      objectType: 'manuscript',
      role: 'author',
      displayName: 'Author',
    })

    await Team.addMember(authorTeam.id, user.id)

    const soonDueDate = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await Task.insert({
      manuscriptId: manuscript.id,
      groupId: group.id,
      assigneeUserId: user.id,
      status: 'In progress',
      dueDate: soonDueDate.toISOString(),
      sequenceIndex: 0,
    })

    const result = await getDashboardData(user.id, group.id)

    const taskCard = result.actionCardData.find(card =>
      card.type.startsWith('task'),
    )

    expect(taskCard?.type).toBe('taskAlmostOverdue')
    expect(taskCard?.bucket).toBe('submissions')
  })

  it('shows data for all three sections when all are enabled', async () => {
    const group = await Group.insert({})
    const user = await User.insert({})

    await activateConfig(group.id, ['submission', 'review', 'editor'])

    const submissionManuscript = await Manuscript.insert({
      groupId: group.id,
      status: 'new',
      shortId: 601,
      submission: { $title: 'My Submission' },
    })

    const authorTeam = await Team.insert({
      objectId: submissionManuscript.id,
      objectType: 'manuscript',
      role: 'author',
      displayName: 'Author',
    })

    await Team.addMember(authorTeam.id, user.id)

    const reviewManuscript = await Manuscript.insert({
      groupId: group.id,
      shortId: 602,
      submission: { $title: 'My Review' },
    })

    const reviewerTeam = await Team.insert({
      objectId: reviewManuscript.id,
      objectType: 'manuscript',
      role: 'reviewer',
      displayName: 'Reviewers',
    })

    await Team.addMember(reviewerTeam.id, user.id, { status: 'invited' })

    const editingManuscript = await Manuscript.insert({
      groupId: group.id,
      status: 'submitted',
      shortId: 603,
      submission: { $title: 'My Editing Queue' },
    })

    const editorTeam = await Team.insert({
      objectId: editingManuscript.id,
      objectType: 'manuscript',
      role: 'editor',
      displayName: 'Editor',
    })

    await Team.addMember(editorTeam.id, user.id)

    const result = await getDashboardData(user.id, group.id)

    expect(result.submissionsData).toEqual({ totalCount: 1 })
    expect(result.reviewData).toEqual({ totalCount: 1 })
    expect(result.editingQueueData).toEqual({ totalCount: 1 })

    expect(result.actionCardData).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'authorSubmit',
          manuscriptId: submissionManuscript.id,
        }),
        expect.objectContaining({
          type: 'reviewerRespond',
          manuscriptId: reviewManuscript.id,
        }),
        expect.objectContaining({
          type: 'editorDecide',
          manuscriptId: editingManuscript.id,
        }),
      ]),
    )

    expect(result.actionCardData).toHaveLength(3)
  })

  it('ignores review and editor manuscripts entirely when only the submission section is enabled', async () => {
    const group = await Group.insert({})
    const user = await User.insert({})

    await activateConfig(group.id, ['submission'])

    const reviewManuscript = await Manuscript.insert({
      groupId: group.id,
      shortId: 701,
      submission: { $title: 'Hidden Review' },
    })

    const reviewerTeam = await Team.insert({
      objectId: reviewManuscript.id,
      objectType: 'manuscript',
      role: 'reviewer',
      displayName: 'Reviewers',
    })

    await Team.addMember(reviewerTeam.id, user.id, { status: 'invited' })

    const editingManuscript = await Manuscript.insert({
      groupId: group.id,
      status: 'submitted',
      shortId: 702,
      submission: { $title: 'Hidden Editing Queue' },
    })

    const editorTeam = await Team.insert({
      objectId: editingManuscript.id,
      objectType: 'manuscript',
      role: 'editor',
      displayName: 'Editor',
    })

    await Team.addMember(editorTeam.id, user.id)

    const result = await getDashboardData(user.id, group.id)

    expect(result.actionCardData).toEqual([])
    expect(result.submissionsData).toEqual({ totalCount: 0 })
    expect(result.reviewData).toBeNull()
    expect(result.editingQueueData).toBeNull()
  })

  it('counts every author manuscript in submissionsData.totalCount, whether or not it needs an action card', async () => {
    const group = await Group.insert({})
    const user = await User.insert({})

    await activateConfig(group.id, ['submission'])

    const needsAction = await Manuscript.insert({
      groupId: group.id,
      status: 'new',
      shortId: 801,
      submission: { $title: 'Needs Action' },
    })

    const needsActionTeam = await Team.insert({
      objectId: needsAction.id,
      objectType: 'manuscript',
      role: 'author',
      displayName: 'Author',
    })

    await Team.addMember(needsActionTeam.id, user.id)

    const noActionNeeded = await Manuscript.insert({
      groupId: group.id,
      status: 'submitted',
      shortId: 802,
      submission: { $title: 'No Action Needed' },
    })

    const noActionTeam = await Team.insert({
      objectId: noActionNeeded.id,
      objectType: 'manuscript',
      role: 'author',
      displayName: 'Author',
    })

    await Team.addMember(noActionTeam.id, user.id)

    const result = await getDashboardData(user.id, group.id)

    expect(result.submissionsData).toEqual({ totalCount: 2 })
    expect(result.actionCardData).toHaveLength(1)
  })

  it('counts every reviewer manuscript in reviewData.totalCount, whether or not it needs an action card', async () => {
    const group = await Group.insert({})
    const user = await User.insert({})

    await activateConfig(group.id, ['review'])

    const needsAction = await Manuscript.insert({
      groupId: group.id,
      shortId: 901,
      submission: { $title: 'Needs Response' },
    })

    const needsActionTeam = await Team.insert({
      objectId: needsAction.id,
      objectType: 'manuscript',
      role: 'reviewer',
      displayName: 'Reviewers',
    })

    await Team.addMember(needsActionTeam.id, user.id, { status: 'invited' })

    const noActionNeeded = await Manuscript.insert({
      groupId: group.id,
      shortId: 902,
      submission: { $title: 'Review Completed' },
    })

    const noActionTeam = await Team.insert({
      objectId: noActionNeeded.id,
      objectType: 'manuscript',
      role: 'reviewer',
      displayName: 'Reviewers',
    })

    await Team.addMember(noActionTeam.id, user.id, { status: 'completed' })

    const result = await getDashboardData(user.id, group.id)

    expect(result.reviewData).toEqual({ totalCount: 2 })
    expect(result.actionCardData).toHaveLength(1)
  })

  it('counts every editor manuscript in editingQueueData.totalCount, whether or not it needs an action card', async () => {
    const group = await Group.insert({})
    const user = await User.insert({})

    await activateConfig(group.id, ['editor'])

    const needsAction = await Manuscript.insert({
      groupId: group.id,
      status: 'submitted',
      decision: null,
      shortId: 1001,
      submission: { $title: 'Undecided' },
    })

    const needsActionTeam = await Team.insert({
      objectId: needsAction.id,
      objectType: 'manuscript',
      role: 'editor',
      displayName: 'Editor',
    })

    await Team.addMember(needsActionTeam.id, user.id)

    const noActionNeeded = await Manuscript.insert({
      groupId: group.id,
      status: 'submitted',
      decision: 'accept',
      shortId: 1002,
      submission: { $title: 'Decided' },
    })

    const noActionTeam = await Team.insert({
      objectId: noActionNeeded.id,
      objectType: 'manuscript',
      role: 'editor',
      displayName: 'Editor',
    })

    await Team.addMember(noActionTeam.id, user.id)

    const result = await getDashboardData(user.id, group.id)

    expect(result.editingQueueData).toEqual({ totalCount: 2 })
    expect(result.actionCardData).toHaveLength(1)
  })
})
