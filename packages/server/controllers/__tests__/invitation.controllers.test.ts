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
import Invitation from '../../models/invitation/invitation.model'
import { updateInvitationStatus } from '../invitation.controllers'

describe('updateInvitationStatus', () => {
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
    respondingUser: User
    invitation: Invitation
  }

  const setup = async (invitedPersonType: string): Promise<SetupResult> => {
    const group = await Group.insert({})
    const manuscript = await Manuscript.insert({
      groupId: group.id,
      shortId: 777,
    })

    const editorTeam = await Team.insert({
      objectId: manuscript.id,
      objectType: 'manuscript',
      role: 'editor',
      displayName: 'Editor',
    })

    const editorUser = await User.insert({})
    await Team.addMember(editorTeam.id, editorUser.id)

    const respondingUser = await User.insert({})
    const senderUser = await User.insert({})

    const invitation = await Invitation.query().insert({
      manuscriptId: manuscript.id,
      senderId: senderUser.id,
      purpose: 'invite-reviewer',
      toEmail: 'invitee@example.com',
      status: 'UNANSWERED',
      invitedPersonType,
      invitedPersonName: 'Invitee Name',
    })

    return { group, manuscript, editorUser, respondingUser, invitation }
  }

  it('emits reviewerAcceptedInvitation to every editor when a reviewer accepts', async () => {
    const { group, manuscript, editorUser, respondingUser, invitation } =
      await setup('REVIEWER')

    await updateInvitationStatus(
      invitation.id,
      'ACCEPTED',
      respondingUser.id,
      new Date().toISOString(),
      group.id,
    )

    expect(jobManager.sendToQueue).toHaveBeenCalledTimes(1)

    expect(jobManager.sendToQueue).toHaveBeenCalledWith('event-queue', {
      eventType: 'reviewerAcceptedInvitation',
      userId: editorUser.id,
      groupId: group.id,
      manuscriptId: manuscript.id,
      shortId: manuscript.shortId,
      reviewerId: respondingUser.id,
    })
  })

  it('emits reviewerRejectedInvitation to every editor when a reviewer rejects', async () => {
    const { group, manuscript, editorUser, respondingUser, invitation } =
      await setup('REVIEWER')

    await updateInvitationStatus(
      invitation.id,
      'REJECTED',
      respondingUser.id,
      new Date().toISOString(),
      group.id,
    )

    expect(jobManager.sendToQueue).toHaveBeenCalledTimes(1)

    expect(jobManager.sendToQueue).toHaveBeenCalledWith('event-queue', {
      eventType: 'reviewerRejectedInvitation',
      userId: editorUser.id,
      groupId: group.id,
      manuscriptId: manuscript.id,
      shortId: manuscript.shortId,
      reviewerId: respondingUser.id,
    })
  })

  it('does not emit an event for a non-reviewer invitation response', async () => {
    const { group, respondingUser, invitation } = await setup('AUTHOR')

    await updateInvitationStatus(
      invitation.id,
      'ACCEPTED',
      respondingUser.id,
      new Date().toISOString(),
      group.id,
    )

    expect(jobManager.sendToQueue).not.toHaveBeenCalled()
  })
})
