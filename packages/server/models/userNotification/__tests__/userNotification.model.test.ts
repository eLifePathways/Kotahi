import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { db, config, DbTestUtils, migrationManager } from '@coko/server'

import Group from '../../group/group.model'
import User from '../../user/user.model'
import Manuscript from '../../manuscript/manuscript.model'
import UserNotification from '../userNotification.model'

describe('UserNotification model', () => {
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
    await db.destroy()
  })

  it('creates a notification for a manuscript', async () => {
    const group = await Group.insert({})
    const user = await User.insert({})
    const manuscript = await Manuscript.insert({})

    const notification = await UserNotification.insert({
      userId: user.id,
      groupId: group.id,
      manuscriptId: manuscript.id,
      eventType: 'decisionMade',
      data: { shortId: '1001', decision: 'accepted' },
    })

    expect(notification.userId).toBe(user.id)
    expect(notification.groupId).toBe(group.id)
    expect(notification.manuscriptId).toBe(manuscript.id)
    expect(notification.eventType).toBe('decisionMade')
    expect(notification.data).toEqual({ shortId: '1001', decision: 'accepted' })
  })

  it('allows a notification with no manuscript', async () => {
    const group = await Group.insert({})
    const user = await User.insert({})

    const notification = await UserNotification.insert({
      userId: user.id,
      groupId: group.id,
      eventType: 'addedAsEditor',
      data: { shortId: '1002' },
    })

    expect(notification.manuscriptId).toBeNull()
  })

  it('rejects an eventType outside the allowed enum', async () => {
    const group = await Group.insert({})
    const user = await User.insert({})

    await expect(
      // @ts-ignore
      UserNotification.insert({
        userId: user.id,
        groupId: group.id,
        eventType: 'notARealEventType',
        data: { shortId: '1003' },
      }),
    ).rejects.toThrow()
  })
})
