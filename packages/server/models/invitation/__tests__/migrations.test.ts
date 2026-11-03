import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { db, config, migrationManager, DbTestUtils } from '@coko/server'

import Group from '../../group/group.model'
import Manuscript from '../../manuscript/manuscript.model'
import User from '../../user/user.model'
import Invitation from '../invitation.model'

const ALLOW_NULL_SENDER_MIGRATION = '1793713260-allow-null-sender.ts'

const MIGRATION_BEFORE_ALLOW_NULL_SENDER =
  '1793267709-remove-submission-page-description.ts'

describe('Invitation Migrations', () => {
  beforeAll(async () => {
    await config.init()
    db.init()
  })

  beforeEach(async () => {
    await DbTestUtils.dropAllTables()
  })

  afterAll(async () => {
    await DbTestUtils.clearDb()
  })

  describe('allow null sender', () => {
    let sender: User
    let invitation: Invitation

    beforeEach(async () => {
      await migrationManager.migrate({
        to: MIGRATION_BEFORE_ALLOW_NULL_SENDER,
      })

      const group = await Group.insert({})
      const manuscript = await Manuscript.insert({ groupId: group.id })
      sender = await User.insert({})

      invitation = await Invitation.insert({
        manuscriptId: manuscript.id,
        senderId: sender.id,
        toEmail: 'invitee@example.com',
        status: 'UNANSWERED',
        invitedPersonType: 'REVIEWER',
        invitedPersonName: 'Invitee',
      })
    })

    it('does not allow clearing the sender before the migration', async () => {
      await expect(Invitation.clearSender(sender.id)).rejects.toThrow(
        'violates not-null constraint',
      )
    })

    it('allows clearing the sender after the migration', async () => {
      await migrationManager.migrate({ to: ALLOW_NULL_SENDER_MIGRATION })

      expect(await Invitation.clearSender(sender.id)).toBe(1)
      expect((await Invitation.findById(invitation.id)).senderId).toBeNull()
    })

    it('requires a sender again when rolled back', async () => {
      await migrationManager.migrate({ to: ALLOW_NULL_SENDER_MIGRATION })
      await migrationManager.rollback({ step: 1 })

      await expect(Invitation.clearSender(sender.id)).rejects.toThrow(
        'violates not-null constraint',
      )
    })
  })
})
