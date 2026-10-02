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
import UserNotification from '../../../models/userNotification/userNotification.model'
import { emitEvent, eventHandler } from '../eventManager'
import { eventTypes } from '../eventTypes'

describe('eventManager', () => {
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

  describe('emitEvent', () => {
    it('sends the event to the event-queue with the eventType merged into the data', async () => {
      const sendToQueueSpy = vi
        .spyOn(jobManager, 'sendToQueue')
        .mockResolvedValue(undefined)

      await emitEvent('addedAsEditor', {
        userId: 'u1',
        groupId: 'g1',
        manuscriptId: 'm1',
      })

      expect(sendToQueueSpy).toHaveBeenCalledWith('event-queue', {
        userId: 'u1',
        groupId: 'g1',
        manuscriptId: 'm1',
        eventType: 'addedAsEditor',
      })

      sendToQueueSpy.mockRestore()
    })
  })

  describe('eventHandler', () => {
    it.each(eventTypes)(
      'creates a user notification for the %s event',
      async eventType => {
        const group = await Group.insert({})
        const user = await User.insert({})
        const manuscript = await Manuscript.insert({ groupId: group.id })

        await eventHandler({
          data: {
            eventType,
            userId: user.id,
            groupId: group.id,
            manuscriptId: manuscript.id,
          },
        })

        await vi.waitFor(async () => {
          const { total } = await UserNotification.findForUser(
            user.id,
            group.id,
            10,
          )

          expect(total).toBe(1)
        })

        const { results } = await UserNotification.findForUser(
          user.id,
          group.id,
          10,
        )

        expect(results[0]).toMatchObject({
          userId: user.id,
          groupId: group.id,
          manuscriptId: manuscript.id,
          eventType,
        })
      },
    )

    it('allows a notification with no manuscript', async () => {
      const group = await Group.insert({})
      const user = await User.insert({})

      await eventHandler({
        data: {
          eventType: 'addedAsEditor',
          userId: user.id,
          groupId: group.id,
        },
      })

      await vi.waitFor(async () => {
        const { total } = await UserNotification.findForUser(
          user.id,
          group.id,
          10,
        )

        expect(total).toBe(1)
      })

      const { results } = await UserNotification.findForUser(
        user.id,
        group.id,
        10,
      )

      expect(results[0].manuscriptId).toBeNull()
    })
  })
})
