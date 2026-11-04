import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { db, config, migrationManager, uuid } from '@coko/server'

import DbTestUtils from '../../DbTestUtils'
import TaskEmailNotification from '../taskEmailNotification.model'
import Task from '../../task/task.model'
import Group from '../../group/group.model'
import EmailTemplate from '../../emailTemplate/emailTemplate.model'
import User from '../../user/user.model'

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

  describe('deleteByEmailTemplateId', () => {
    it('deletes the notifications using the template only', async () => {
      const group = await Group.insert({})

      const [template, otherTemplate] = await Promise.all(
        ['one', 'two'].map(description =>
          EmailTemplate.insert({
            groupId: group.id,
            emailTemplateType: 'manuscript',
            emailContent: {
              description,
              subject: description,
              body: '',
              cc: null,
              ccEditors: false,
            },
          }),
        ),
      )

      const task = await Task.insert({
        groupId: group.id,
        title: 'Task',
        sequenceIndex: 0,
        status: 'Not started',
      })

      await TaskEmailNotification.insert({
        taskId: task.id,
        emailTemplateId: template.id,
      })

      const kept = await TaskEmailNotification.insert({
        taskId: task.id,
        emailTemplateId: otherTemplate.id,
      })

      expect(
        await TaskEmailNotification.deleteByEmailTemplateId(template.id),
      ).toBe(1)
      expect(
        (await TaskEmailNotification.findByTaskId(task.id)).map(n => n.id),
      ).toEqual([kept.id])
    })
  })

  describe('deleteByRecipientAndTask', () => {
    it("deletes the recipient's notifications for the task only", async () => {
      const group = await Group.insert({})
      const user = await User.insert({})
      const otherUser = await User.insert({})

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
        recipientUserId: user.id,
      })

      const otherRecipient = await TaskEmailNotification.insert({
        taskId: task.id,
        recipientUserId: otherUser.id,
      })

      const otherTaskNotification = await TaskEmailNotification.insert({
        taskId: otherTask.id,
        recipientUserId: user.id,
      })

      expect(
        await TaskEmailNotification.deleteByRecipientAndTask(user.id, task.id),
      ).toBe(1)
      expect(
        (await TaskEmailNotification.findByTaskId(task.id)).map(n => n.id),
      ).toEqual([otherRecipient.id])
      expect(
        (await TaskEmailNotification.findByTaskId(otherTask.id)).map(n => n.id),
      ).toEqual([otherTaskNotification.id])
    })
  })

  describe('upsertAndFetch', () => {
    it('inserts a missing notification and updates an existing one', async () => {
      const group = await Group.insert({})

      const task = await Task.insert({
        groupId: group.id,
        title: 'Task',
        sequenceIndex: 0,
        status: 'Not started',
      })

      const id = uuid()

      const inserted = await TaskEmailNotification.upsertAndFetch({
        id,
        taskId: task.id,
        recipientType: 'assignee',
      })

      expect(inserted.recipientType).toBe('assignee')

      const updated = await TaskEmailNotification.upsertAndFetch({
        id,
        taskId: task.id,
        recipientType: 'editor',
      })

      expect(updated.recipientType).toBe('editor')
      expect(await TaskEmailNotification.findByTaskId(task.id)).toHaveLength(1)
    })
  })
})
