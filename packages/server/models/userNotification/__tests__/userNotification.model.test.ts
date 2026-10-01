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

    const persisted = await UserNotification.query().findById(notification.id)

    expect(persisted.manuscriptId).toBeNull()
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

  it('finds notifications for a user in a group, most recent first, with a total count', async () => {
    const group = await Group.insert({})
    const user = await User.insert({})

    const first = await UserNotification.insert({
      userId: user.id,
      groupId: group.id,
      eventType: 'addedAsEditor',
      data: { shortId: '1' },
    })

    const second = await UserNotification.insert({
      userId: user.id,
      groupId: group.id,
      eventType: 'addedAsReviewer',
      data: { shortId: '2' },
    })

    const { results, total } = await UserNotification.findForUser(
      user.id,
      group.id,
      10,
    )

    expect(total).toBe(2)
    expect(results.map(notification => notification.id)).toEqual([
      second.id,
      first.id,
    ])
  })

  it('does not find notifications belonging to a different user or group', async () => {
    const group = await Group.insert({})
    const otherGroup = await Group.insert({})
    const user = await User.insert({})
    const otherUser = await User.insert({})

    await UserNotification.insert({
      userId: user.id,
      groupId: group.id,
      eventType: 'addedAsEditor',
      data: {},
    })

    await UserNotification.insert({
      userId: otherUser.id,
      groupId: group.id,
      eventType: 'addedAsEditor',
      data: {},
    })

    await UserNotification.insert({
      userId: user.id,
      groupId: otherGroup.id,
      eventType: 'addedAsEditor',
      data: {},
    })

    const { results, total } = await UserNotification.findForUser(
      user.id,
      group.id,
      10,
    )

    expect(total).toBe(1)
    expect(results).toHaveLength(1)
  })

  it('limits the results returned while the total reflects the full count', async () => {
    const group = await Group.insert({})
    const user = await User.insert({})

    await UserNotification.insert({
      userId: user.id,
      groupId: group.id,
      eventType: 'addedAsEditor',
      data: {},
    })

    await UserNotification.insert({
      userId: user.id,
      groupId: group.id,
      eventType: 'addedAsReviewer',
      data: {},
    })

    await UserNotification.insert({
      userId: user.id,
      groupId: group.id,
      eventType: 'decisionMade',
      data: {},
    })

    const { results, total } = await UserNotification.findForUser(
      user.id,
      group.id,
      2,
    )

    expect(total).toBe(3)
    expect(results).toHaveLength(2)
  })

  it('dismisses a single notification by id', async () => {
    const group = await Group.insert({})
    const user = await User.insert({})

    const notification = await UserNotification.insert({
      userId: user.id,
      groupId: group.id,
      eventType: 'addedAsEditor',
      data: {},
    })

    const deletedCount = await UserNotification.dismissById(notification.id)

    expect(deletedCount).toBe(1)

    expect(
      await UserNotification.query().findById(notification.id),
    ).toBeUndefined()
  })

  it('dismisses all notifications for a user in a group, leaving others untouched', async () => {
    const group = await Group.insert({})
    const otherGroup = await Group.insert({})
    const user = await User.insert({})
    const otherUser = await User.insert({})

    await UserNotification.insert({
      userId: user.id,
      groupId: group.id,
      eventType: 'addedAsEditor',
      data: {},
    })

    await UserNotification.insert({
      userId: user.id,
      groupId: group.id,
      eventType: 'addedAsReviewer',
      data: {},
    })

    const otherUsersNotification = await UserNotification.insert({
      userId: otherUser.id,
      groupId: group.id,
      eventType: 'addedAsEditor',
      data: {},
    })

    const otherGroupsNotification = await UserNotification.insert({
      userId: user.id,
      groupId: otherGroup.id,
      eventType: 'addedAsEditor',
      data: {},
    })

    const deletedCount = await UserNotification.dismissAllForUser(
      user.id,
      group.id,
    )

    expect(deletedCount).toBe(2)

    expect(
      await UserNotification.query().findById(otherUsersNotification.id),
    ).toBeDefined()

    expect(
      await UserNotification.query().findById(otherGroupsNotification.id),
    ).toBeDefined()
  })

  it('deletes only notifications created before the given date', async () => {
    const group = await Group.insert({})
    const user = await User.insert({})

    const old = await UserNotification.insert({
      userId: user.id,
      groupId: group.id,
      eventType: 'addedAsEditor',
      data: {},
    })

    const recent = await UserNotification.insert({
      userId: user.id,
      groupId: group.id,
      eventType: 'addedAsReviewer',
      data: {},
    })

    // patch old date manually
    await db('user_notifications')
      .where({ id: old.id })
      .update({ created: '2000-01-01T00:00:00.000Z' })

    const deletedCount = await UserNotification.deleteOlderThan(
      new Date('2020-01-01T00:00:00.000Z'),
    )

    expect(deletedCount).toBe(1)
    expect(await UserNotification.query().findById(old.id)).toBeUndefined()

    expect(await UserNotification.query().findById(recent.id)).toBeDefined()
  })
})
