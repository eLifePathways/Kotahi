import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { db, config, migrationManager } from '@coko/server'

import DbTestUtils from '../../DbTestUtils'
import NotificationDigest from '../notificationDigest.model'
import Group from '../../group/group.model'
import User from '../../user/user.model'

const MINUTE = 60 * 1000

const minutesFromNow = (minutes: number): Date =>
  new Date(Date.now() + minutes * MINUTE)

describe('NotificationDigest model', () => {
  let groupId: string
  let otherGroupId: string
  let userId: string
  let otherUserId: string

  const createDigest = async (
    data: Partial<NotificationDigest> = {},
  ): Promise<NotificationDigest> =>
    NotificationDigest.insert({
      time: new Date().toISOString(),
      maxNotificationTime: minutesFromNow(30).toISOString(),
      pathString: 'chat/one',
      option: '30MinSummary',
      context: { messageId: null },
      userId,
      groupId,
      ...data,
    })

  const exists = async (digest: NotificationDigest): Promise<boolean> =>
    !!(await NotificationDigest.findById(digest.id, { throwIfNotFound: false }))

  beforeAll(async () => {
    await config.init()
    db.init()
    await migrationManager.migrate()
  })

  beforeEach(async () => {
    await DbTestUtils.clearDb()
    groupId = (await Group.insert({})).id
    otherGroupId = (await Group.insert({})).id
    userId = (await User.insert({})).id
    otherUserId = (await User.insert({})).id
  })

  afterAll(async () => {
    await DbTestUtils.clearDb()
  })

  describe('deleteActionedInGroup', () => {
    it('deletes the actioned entries of the group only', async () => {
      const actioned = await createDigest({ actioned: true })
      const unactioned = await createDigest({ actioned: false })

      const otherGroup = await createDigest({
        actioned: true,
        groupId: otherGroupId,
      })

      expect(await NotificationDigest.deleteActionedInGroup(groupId)).toBe(1)
      expect(await exists(actioned)).toBe(false)
      expect(await exists(unactioned)).toBe(true)
      expect(await exists(otherGroup)).toBe(true)
    })
  })

  describe('deleteForUserAndPaths', () => {
    it("deletes the user's entries for the given paths only", async () => {
      const one = await createDigest({ pathString: 'chat/one' })
      const two = await createDigest({ pathString: 'chat/two' })
      const three = await createDigest({ pathString: 'chat/three' })

      const otherUser = await createDigest({
        pathString: 'chat/one',
        userId: otherUserId,
      })

      const count = await NotificationDigest.deleteForUserAndPaths(userId, [
        'chat/one',
        'chat/two',
      ])

      expect(count).toBe(2)
      expect(await exists(one)).toBe(false)
      expect(await exists(two)).toBe(false)
      expect(await exists(three)).toBe(true)
      expect(await exists(otherUser)).toBe(true)
    })
  })

  describe('deleteUnactionedForPath', () => {
    it("deletes the user's unactioned entries for the path only", async () => {
      const unactioned = await createDigest({ actioned: false })
      const actioned = await createDigest({ actioned: true })
      const otherPath = await createDigest({ pathString: 'chat/two' })

      const otherUser = await createDigest({ userId: otherUserId })

      expect(
        await NotificationDigest.deleteUnactionedForPath(userId, 'chat/one'),
      ).toBe(1)
      expect(await exists(unactioned)).toBe(false)
      expect(await exists(actioned)).toBe(true)
      expect(await exists(otherPath)).toBe(true)
      expect(await exists(otherUser)).toBe(true)
    })
  })

  describe('markActionedForPath', () => {
    it("marks the user's entries for the path in the group as actioned", async () => {
      const match = await createDigest()
      const otherPath = await createDigest({ pathString: 'chat/two' })
      const otherGroup = await createDigest({ groupId: otherGroupId })

      const count = await NotificationDigest.markActionedForPath(
        userId,
        'chat/one',
        groupId,
      )

      expect(count).toBe(1)
      expect((await NotificationDigest.findById(match.id)).actioned).toBe(true)
      expect((await NotificationDigest.findById(otherPath.id)).actioned).toBe(
        false,
      )
      expect((await NotificationDigest.findById(otherGroup.id)).actioned).toBe(
        false,
      )
    })
  })

  describe('findFirstDueForEachUserAndPath', () => {
    it('returns the earliest due entry for each user and path in the group', async () => {
      const earliest = await createDigest({
        maxNotificationTime: minutesFromNow(-20).toISOString(),
      })

      await createDigest({
        maxNotificationTime: minutesFromNow(-10).toISOString(),
      })

      const otherPath = await createDigest({
        pathString: 'chat/two',
        maxNotificationTime: minutesFromNow(-5).toISOString(),
      })

      await createDigest({
        pathString: 'chat/three',
        maxNotificationTime: minutesFromNow(10).toISOString(),
      })

      await createDigest({
        groupId: otherGroupId,
        maxNotificationTime: minutesFromNow(-20).toISOString(),
      })

      const due =
        await NotificationDigest.findFirstDueForEachUserAndPath(groupId)

      expect(due.map(d => d.id).sort()).toEqual(
        [earliest.id, otherPath.id].sort(),
      )
    })
  })

  describe('getUpcomingNotificationTime', () => {
    it('returns the earliest max notification time of the unactioned entries in the group', async () => {
      const soonest = minutesFromNow(5)

      await createDigest({
        pathString: 'chat/one',
        maxNotificationTime: minutesFromNow(15).toISOString(),
      })

      await createDigest({
        pathString: 'chat/two',
        maxNotificationTime: soonest.toISOString(),
      })

      await createDigest({
        pathString: 'chat/three',
        actioned: true,
        maxNotificationTime: minutesFromNow(1).toISOString(),
      })

      await createDigest({
        groupId: otherGroupId,
        maxNotificationTime: minutesFromNow(1).toISOString(),
      })

      const time = await NotificationDigest.getUpcomingNotificationTime(groupId)

      expect(new Date(time as string).getTime()).toBe(soonest.getTime())
    })

    it('returns undefined when there are no unactioned entries', async () => {
      await createDigest({ actioned: true })

      expect(
        await NotificationDigest.getUpcomingNotificationTime(groupId),
      ).toBeUndefined()
    })
  })
})
