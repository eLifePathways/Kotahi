import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { db, config, DbTestUtils, migrationManager } from '@coko/server'

import TaskEmailNotification from '../taskEmailNotification.model'
import Task from '../../task/task.model'
import Group from '../../group/group.model'

describe('TaskEmailNotification model', () => {
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

  describe('findByTaskId', () => {
    it("returns the task's notifications, oldest first, and no others", async () => {
      const group = await Group.insert({})

      const [task, otherTask] = await Promise.all(
        ['A task', 'Another task'].map((title, sequenceIndex) =>
          Task.insert({
            groupId: group.id,
            title,
            sequenceIndex,
            status: 'Not started',
          }),
        ),
      )

      await TaskEmailNotification.insert({
        taskId: task.id,
        recipientType: 'first',
      })
      await TaskEmailNotification.insert({
        taskId: otherTask.id,
        recipientType: 'other',
      })
      await TaskEmailNotification.insert({
        taskId: task.id,
        recipientType: 'second',
      })

      const notifications = await TaskEmailNotification.findByTaskId(task.id)

      expect(
        notifications.map(notification => notification.recipientType),
      ).toEqual(['first', 'second'])
    })
  })
})
