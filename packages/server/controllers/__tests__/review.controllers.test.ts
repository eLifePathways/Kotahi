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

import Group from '../../models/group/group.model'
import User from '../../models/user/user.model'
import Manuscript from '../../models/manuscript/manuscript.model'
import Team from '../../models/team/team.model'
import { updateReviewerTeamMemberStatus } from '../review.controllers'

describe('updateReviewerTeamMemberStatus', () => {
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

  type SetupResult = {
    group: Group
    manuscript: Manuscript
    editorUser: User
    reviewerUser: User
  }

  const setup = async (): Promise<SetupResult> => {
    const group = await Group.insert({})
    const manuscript = await Manuscript.insert({
      groupId: group.id,
      shortId: 555,
    })

    const editorTeam = await Team.insert({
      objectId: manuscript.id,
      objectType: 'manuscript',
      role: 'editor',
      displayName: 'Editor',
    })

    const editorUser = await User.insert({})
    await Team.addMember(editorTeam.id, editorUser.id)

    const reviewerTeam = await Team.insert({
      objectId: manuscript.id,
      objectType: 'manuscript',
      role: 'reviewer',
      displayName: 'Reviewers',
    })

    const reviewerUser = await User.insert({})
    await Team.addMember(reviewerTeam.id, reviewerUser.id, {
      status: 'accepted',
    })

    return { group, manuscript, editorUser, reviewerUser }
  }

  it('emits reviewerCompletedReview to every editor when a review is completed', async () => {
    const { group, manuscript, editorUser, reviewerUser } = await setup()

    await updateReviewerTeamMemberStatus(
      manuscript.id,
      'completed',
      reviewerUser.id,
    )

    expect(jobManager.sendToQueue).toHaveBeenCalledTimes(1)

    expect(jobManager.sendToQueue).toHaveBeenCalledWith('event-queue', {
      eventType: 'reviewerCompletedReview',
      userId: editorUser.id,
      groupId: group.id,
      manuscriptId: manuscript.id,
      shortId: manuscript.shortId,
      reviewerId: reviewerUser.id,
    })
  })

  it('does not emit an event for a non-completed status', async () => {
    const { manuscript, reviewerUser } = await setup()

    await updateReviewerTeamMemberStatus(
      manuscript.id,
      'invited',
      reviewerUser.id,
    )

    expect(jobManager.sendToQueue).not.toHaveBeenCalled()
  })
})
