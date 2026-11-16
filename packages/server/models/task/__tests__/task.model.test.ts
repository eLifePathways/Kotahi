import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { db, config, migrationManager, uuid } from '@coko/server'

import DbTestUtils from '../../DbTestUtils'
import Task from '../task.model'
import Group from '../../group/group.model'
import Manuscript from '../../manuscript/manuscript.model'
import User from '../../user/user.model'
import TaskEmailNotification from '../../taskEmailNotification/taskEmailNotification.model'

const task = (data: Record<string, unknown>): Promise<Task> =>
  Task.insert({
    title: 'A task',
    status: 'Not started',
    sequenceIndex: 0,
    ...data,
  })

describe('Task model', () => {
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

  describe('findTemplates', () => {
    it("returns the group's task templates in order", async () => {
      const group = await Group.insert({})

      await task({ groupId: group.id, title: 'Second', sequenceIndex: 2 })
      await task({ groupId: group.id, title: 'First', sequenceIndex: 1 })

      const templates = await Task.findTemplates(group.id)

      expect(templates.map(template => template.title)).toEqual([
        'First',
        'Second',
      ])
    })

    it("leaves out manuscripts' tasks and other groups' templates", async () => {
      const group = await Group.insert({})
      const otherGroup = await Group.insert({})
      const manuscript = await Manuscript.insert({ groupId: group.id })

      await task({ groupId: group.id, title: 'Template', sequenceIndex: 0 })

      await task({
        groupId: group.id,
        manuscriptId: manuscript.id,
        title: 'Manuscript task',
        sequenceIndex: 0,
      })

      await task({ groupId: otherGroup.id, title: 'Other', sequenceIndex: 0 })

      const templates = await Task.findTemplates(group.id)

      expect(templates.map(template => template.title)).toEqual(['Template'])
    })
  })

  describe('countByManuscript', () => {
    it("counts the manuscript's tasks in the group", async () => {
      const group = await Group.insert({})
      const manuscript = await Manuscript.insert({ groupId: group.id })
      const otherManuscript = await Manuscript.insert({ groupId: group.id })

      await task({ groupId: group.id, manuscriptId: manuscript.id })
      await task({ groupId: group.id, manuscriptId: manuscript.id })
      await task({ groupId: group.id, manuscriptId: otherManuscript.id })
      await task({ groupId: group.id })

      expect(await Task.countByManuscript(manuscript.id, group.id)).toBe(2)
    })
  })

  describe('findInProgressDueBetween', () => {
    it('returns in-progress tasks of the group due in the range', async () => {
      const group = await Group.insert({})
      const otherGroup = await Group.insert({})
      const from = new Date('2024-01-01T00:00:00.000Z')
      const to = new Date('2024-01-02T00:00:00.000Z')

      const due = await task({
        groupId: group.id,
        status: 'In progress',
        dueDate: '2024-01-01T12:00:00.000Z',
      })

      await task({
        groupId: group.id,
        status: 'Not started',
        dueDate: '2024-01-01T12:00:00.000Z',
      })

      await task({
        groupId: group.id,
        status: 'In progress',
        dueDate: '2024-01-02T00:00:00.000Z',
      })

      await task({ groupId: group.id, status: 'In progress', dueDate: null })

      await task({
        groupId: otherGroup.id,
        status: 'In progress',
        dueDate: '2024-01-01T12:00:00.000Z',
      })

      const found = await Task.findInProgressDueBetween(group.id, from, to)

      expect(found.map(t => t.id)).toEqual([due.id])
    })
  })

  describe('unassignUser', () => {
    it("removes the user as assignee of the group's tasks only", async () => {
      const group = await Group.insert({})
      const otherGroup = await Group.insert({})
      const user = await User.insert({})

      const mine = await task({
        groupId: group.id,
        assigneeUserId: user.id,
        assigneeType: 'registeredUser',
      })

      const otherGroupTask = await task({
        groupId: otherGroup.id,
        assigneeUserId: user.id,
        assigneeType: 'registeredUser',
      })

      expect(await Task.unassignUser(user.id, group.id)).toBe(1)

      const unassigned = await Task.findById(mine.id)

      expect(unassigned.assigneeUserId).toBeNull()
      expect(unassigned.assigneeType).toBeNull()
      expect((await Task.findById(otherGroupTask.id)).assigneeUserId).toBe(
        user.id,
      )
    })
  })

  describe('upsert', () => {
    it('inserts a new task and merges into an existing one', async () => {
      const group = await Group.insert({})
      const id = uuid()

      const inserted = await Task.upsert({
        id,
        groupId: group.id,
        title: 'Original',
        status: 'Not started',
        sequenceIndex: 0,
      })

      expect(inserted.title).toBe('Original')

      const updated = await Task.upsert({
        id,
        groupId: group.id,
        title: 'Changed',
        status: 'Not started',
        sequenceIndex: 0,
      })

      expect(updated.title).toBe('Changed')
      expect((await Task.find({ groupId: group.id })).result).toHaveLength(1)
    })

    it('loads the requested relations', async () => {
      const group = await Group.insert({})
      const user = await User.insert({ username: 'assignee' })

      const upserted = (await Task.upsert(
        {
          id: uuid(),
          groupId: group.id,
          title: 'Task',
          status: 'Not started',
          sequenceIndex: 0,
          assigneeUserId: user.id,
        },
        { related: 'assignee' },
      )) as Task & { assignee: User }

      expect(upserted.assignee.username).toBe('assignee')
    })
  })

  describe('getEmailNotifications', () => {
    it('returns the notifications of tasks with the status in the group, with their task, assignee, manuscript and recipient', async () => {
      const group = await Group.insert({})
      const otherGroup = await Group.insert({})
      const manuscript = await Manuscript.insert({ groupId: group.id })
      const assignee = await User.insert({ username: 'assignee' })
      const recipient = await User.insert({ username: 'recipient' })

      const inProgress = await task({
        groupId: group.id,
        manuscriptId: manuscript.id,
        status: 'In progress',
        assigneeUserId: assignee.id,
      })

      const notStarted = await task({
        groupId: group.id,
        manuscriptId: manuscript.id,
        status: 'Not started',
      })

      const otherGroupTask = await task({
        groupId: otherGroup.id,
        status: 'In progress',
      })

      const notification = await TaskEmailNotification.insert({
        taskId: inProgress.id,
        recipientUserId: recipient.id,
      })

      await TaskEmailNotification.insert({ taskId: notStarted.id })
      await TaskEmailNotification.insert({ taskId: otherGroupTask.id })

      const found = (await Task.getEmailNotifications(
        group.id,
        'In progress',
      )) as (TaskEmailNotification & {
        task: Task & { assignee: User; manuscript: Manuscript }
        recipientUser: User
      })[]

      expect(found.map(n => n.id)).toEqual([notification.id])
      expect(found[0].task.id).toBe(inProgress.id)
      expect(found[0].task.assignee.username).toBe('assignee')
      expect(found[0].task.manuscript.id).toBe(manuscript.id)
      expect(found[0].recipientUser.username).toBe('recipient')
    })
  })
})
