import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { db, config, DbTestUtils, migrationManager } from '@coko/server'

import Invitation from '../invitation.model'
import Group from '../../group/group.model'
import Manuscript from '../../manuscript/manuscript.model'
import User from '../../user/user.model'

describe('Invitation model', () => {
  let manuscriptId: string
  let senderId: string

  const createInvitation = async (
    data: Partial<Invitation> = {},
  ): Promise<Invitation> =>
    Invitation.insert({
      manuscriptId,
      senderId,
      toEmail: 'invitee@example.com',
      status: 'UNANSWERED',
      invitedPersonType: 'REVIEWER',
      invitedPersonName: 'Invitee',
      ...data,
    })

  beforeAll(async () => {
    await config.init()
    db.init()
    await migrationManager.migrate()
  })

  beforeEach(async () => {
    await DbTestUtils.clearDb()
    const group = await Group.insert({})
    manuscriptId = (await Manuscript.insert({ groupId: group.id })).id
    senderId = (await User.insert({})).id
  })

  afterAll(async () => {
    await DbTestUtils.clearDb()
  })

  describe('deleteByUserId', () => {
    it("deletes the user's invitations only", async () => {
      const user = await User.insert({})
      const otherUser = await User.insert({})
      const mine = await createInvitation({ userId: user.id })
      const other = await createInvitation({ userId: otherUser.id })

      expect(await Invitation.deleteByUserId(user.id)).toBe(1)
      expect(
        await Invitation.findById(mine.id, { throwIfNotFound: false }),
      ).toBeUndefined()
      expect(await Invitation.findById(other.id)).toBeDefined()
    })
  })

  describe('clearSender', () => {
    it('removes the user as sender of their invitations', async () => {
      const otherSender = await User.insert({})
      const mine = await createInvitation()
      const other = await createInvitation({ senderId: otherSender.id })

      expect(await Invitation.clearSender(senderId)).toBe(1)
      expect((await Invitation.findById(mine.id)).senderId).toBeNull()
      expect((await Invitation.findById(other.id)).senderId).toBe(
        otherSender.id,
      )
    })
  })

  describe('patchIfUnanswered', () => {
    it('patches an unanswered invitation and returns it', async () => {
      const invitation = await createInvitation()
      const user = await User.insert({})

      const result = await Invitation.patchIfUnanswered(invitation.id, {
        status: 'ACCEPTED',
        userId: user.id,
      })

      expect(result?.id).toBe(invitation.id)
      expect(result?.status).toBe('ACCEPTED')
      expect((await Invitation.findById(invitation.id)).userId).toBe(user.id)
    })

    it('leaves an answered invitation alone and returns undefined', async () => {
      const invitation = await createInvitation({ status: 'REJECTED' })

      const result = await Invitation.patchIfUnanswered(invitation.id, {
        status: 'ACCEPTED',
      })

      expect(result).toBeUndefined()
      expect((await Invitation.findById(invitation.id)).status).toBe('REJECTED')
    })
  })
})
