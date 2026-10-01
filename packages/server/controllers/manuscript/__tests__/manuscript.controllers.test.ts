import {
  describe,
  beforeAll,
  beforeEach,
  afterAll,
  it,
  expect,
  vi,
} from 'vitest'
import {
  db,
  config,
  DbTestUtils,
  migrationManager,
  jobManager,
} from '@coko/server'

import Group from '../../../models/group/group.model'
import User from '../../../models/user/user.model'
import Manuscript from '../../../models/manuscript/manuscript.model'
import Team from '../../../models/team/team.model'
import Channel from '../../../models/channel/channel.model'
import Config from '../../../models/config/config.model'

vi.mock('../../channel.controllers', () => ({
  addUserToManuscriptChatChannel: vi.fn().mockResolvedValue(undefined),
  removeUserFromManuscriptChatChannel: vi.fn().mockResolvedValue(undefined),
}))

// eslint-disable-next-line import/first
import {
  addReviewer,
  makeDecision,
  removeReviewer,
  reviewerResponse,
  submitManuscript,
} from '../manuscript.controllers'

describe('manuscript.controllers events', () => {
  beforeAll(async () => {
    await config.init()
    db.init()
    await migrationManager.migrate()
  })

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.spyOn(jobManager, 'sendToQueue').mockResolvedValue(undefined)
    await DbTestUtils.clearDb()
  })

  afterAll(async () => {
    await DbTestUtils.clearDb()
  })

  describe('addReviewer', () => {
    it('emits addedAsReviewer', async () => {
      const group = await Group.insert({})
      const manuscript = await Manuscript.insert({
        groupId: group.id,
        shortId: 301,
      })

      const reviewerUser = await User.insert({})

      await addReviewer(manuscript.id, reviewerUser.id, null, false)

      expect(jobManager.sendToQueue).toHaveBeenCalledTimes(1)

      expect(jobManager.sendToQueue).toHaveBeenCalledWith('event-queue', {
        eventType: 'addedAsReviewer',
        userId: reviewerUser.id,
        groupId: group.id,
        manuscriptId: manuscript.id,
        shortId: manuscript.shortId,
      })
    })
  })

  describe('makeDecision', () => {
    it('emits decisionMade when the decision changes', async () => {
      const group = await Group.insert({})

      await Config.insert({
        groupId: group.id,
        active: true,
        formData: {},
      })

      const submitter = await User.insert({})

      const manuscript = await Manuscript.insert({
        groupId: group.id,
        shortId: 302,
        submitterId: submitter.id,
        submission: {},
      })

      await Channel.query().insert({
        manuscriptId: manuscript.id,
        groupId: group.id,
        topic: 'Editorial discussion',
        type: 'editorial',
      })

      await makeDecision(manuscript.id, 'accept', submitter.id)

      expect(jobManager.sendToQueue).toHaveBeenCalledTimes(1)

      expect(jobManager.sendToQueue).toHaveBeenCalledWith('event-queue', {
        eventType: 'decisionMade',
        userId: submitter.id,
        groupId: group.id,
        manuscriptId: manuscript.id,
        shortId: manuscript.shortId,
        decision: 'accept',
      })
    })
  })

  describe('removeReviewer', () => {
    it('emits removedAsReviewer when a reviewer team member is removed', async () => {
      const group = await Group.insert({})
      const manuscript = await Manuscript.insert({
        groupId: group.id,
        shortId: 303,
      })

      const reviewerUser = await User.insert({})

      const reviewerTeam = await Team.insert({
        objectId: manuscript.id,
        objectType: 'manuscript',
        role: 'reviewer',
        displayName: 'Reviewers',
      })

      await Team.addMember(reviewerTeam.id, reviewerUser.id, {
        status: 'accepted',
      })

      await removeReviewer(manuscript.id, reviewerUser.id)

      expect(jobManager.sendToQueue).toHaveBeenCalledTimes(1)

      expect(jobManager.sendToQueue).toHaveBeenCalledWith('event-queue', {
        eventType: 'removedAsReviewer',
        userId: reviewerUser.id,
        groupId: group.id,
        manuscriptId: manuscript.id,
        shortId: manuscript.shortId,
      })
    })

    it('does not emit an event when there was no reviewer to remove', async () => {
      const group = await Group.insert({})
      const manuscript = await Manuscript.insert({
        groupId: group.id,
        shortId: 304,
      })

      await Team.insert({
        objectId: manuscript.id,
        objectType: 'manuscript',
        role: 'reviewer',
        displayName: 'Reviewers',
      })

      const unrelatedUser = await User.insert({})

      await expect(
        removeReviewer(manuscript.id, unrelatedUser.id),
      ).rejects.toThrow()

      expect(jobManager.sendToQueue).not.toHaveBeenCalled()
    })
  })

  describe('reviewerResponse', () => {
    it('emits reviewerAcceptedInvitation to every editor when a reviewer accepts', async () => {
      const group = await Group.insert({})
      const manuscript = await Manuscript.insert({
        groupId: group.id,
        shortId: 305,
      })

      const reviewerUser = await User.insert({})

      const reviewerTeam = await Team.insert({
        objectId: manuscript.id,
        objectType: 'manuscript',
        role: 'reviewer',
        displayName: 'Reviewers',
      })

      await Team.addMember(reviewerTeam.id, reviewerUser.id, {
        status: 'invited',
      })

      const editorUser = await User.insert({})

      const editorTeam = await Team.insert({
        objectId: manuscript.id,
        objectType: 'manuscript',
        role: 'editor',
        displayName: 'Editor',
      })

      await Team.addMember(editorTeam.id, editorUser.id)

      await Channel.query().insert({
        manuscriptId: manuscript.id,
        groupId: group.id,
        topic: 'Editorial discussion',
        type: 'editorial',
      })

      await reviewerResponse('accepted', reviewerTeam.id, reviewerUser.id)

      expect(jobManager.sendToQueue).toHaveBeenCalledTimes(1)

      expect(jobManager.sendToQueue).toHaveBeenCalledWith('event-queue', {
        eventType: 'reviewerAcceptedInvitation',
        userId: editorUser.id,
        groupId: group.id,
        manuscriptId: manuscript.id,
        shortId: manuscript.shortId,
        reviewerId: reviewerUser.id,
        teamId: reviewerTeam.id,
      })
    })
  })

  describe('submitManuscript', () => {
    it('emits revisionSubmitted to every editor when a revision is submitted', async () => {
      const group = await Group.insert({})

      await Config.insert({
        groupId: group.id,
        active: true,
        formData: {},
      })

      const parentManuscript = await Manuscript.insert({
        groupId: group.id,
        shortId: 306,
        submission: {},
        meta: {},
      })

      await Channel.query().insert({
        manuscriptId: parentManuscript.id,
        groupId: group.id,
        topic: 'Editorial discussion',
        type: 'editorial',
      })

      const revisionManuscript = await Manuscript.insert({
        groupId: group.id,
        shortId: 306,
        parentId: parentManuscript.id,
        submission: {},
        meta: {},
      })

      const editorUser = await User.insert({})

      const editorTeam = await Team.insert({
        objectId: revisionManuscript.id,
        objectType: 'manuscript',
        role: 'editor',
        displayName: 'Editor',
      })

      await Team.addMember(editorTeam.id, editorUser.id)

      await submitManuscript(revisionManuscript.id, '{}', editorUser.id)

      expect(jobManager.sendToQueue).toHaveBeenCalledTimes(1)

      expect(jobManager.sendToQueue).toHaveBeenCalledWith('event-queue', {
        eventType: 'revisionSubmitted',
        userId: editorUser.id,
        groupId: group.id,
        manuscriptId: revisionManuscript.id,
        shortId: revisionManuscript.shortId,
      })
    })
  })
})
