import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { db, config, migrationManager, uuid } from '@coko/server'

import DbTestUtils from '../../DbTestUtils'
import NotificationUserOption from '../notificationUserOption.model'
import Group from '../../group/group.model'
import User from '../../user/user.model'

describe('NotificationUserOption model', () => {
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

  describe('findExplicitForObject', () => {
    it("returns the user's non-inherit options in the group for the object or for no object", async () => {
      const group = await Group.insert({})
      const otherGroup = await Group.insert({})
      const user = await User.insert({})
      const otherUser = await User.insert({})
      const objectId = uuid()

      const forObject = await NotificationUserOption.insert({
        userId: user.id,
        groupId: group.id,
        objectId,
        path: ['chat', objectId],
        option: 'off',
      })

      const forNoObject = await NotificationUserOption.insert({
        userId: user.id,
        groupId: group.id,
        objectId: null,
        path: ['chat'],
        option: '30MinSummary',
      })

      await NotificationUserOption.insert({
        userId: user.id,
        groupId: group.id,
        objectId,
        path: ['chat', objectId, 'inherited'],
        option: 'inherit',
      })

      await NotificationUserOption.insert({
        userId: user.id,
        groupId: group.id,
        objectId: uuid(),
        path: ['chat', 'other'],
        option: 'off',
      })

      await NotificationUserOption.insert({
        userId: user.id,
        groupId: otherGroup.id,
        objectId,
        path: ['chat', objectId],
        option: 'off',
      })

      await NotificationUserOption.insert({
        userId: otherUser.id,
        groupId: group.id,
        objectId,
        path: ['chat', objectId],
        option: 'off',
      })

      const options = await NotificationUserOption.findExplicitForObject(
        user.id,
        group.id,
        objectId,
      )

      expect(options.map(o => o.id).sort()).toEqual(
        [forObject.id, forNoObject.id].sort(),
      )
    })
  })
})
