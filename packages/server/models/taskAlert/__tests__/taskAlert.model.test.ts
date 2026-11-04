import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { db, config, migrationManager } from '@coko/server'

import DbTestUtils from '../../DbTestUtils'
import TaskAlert from '../taskAlert.model'
import Group from '../../group/group.model'
import Manuscript from '../../manuscript/manuscript.model'
import Task from '../../task/task.model'
import User from '../../user/user.model'

describe('TaskAlert model', () => {
  let groupId: string
  let manuscriptId: string
  let otherManuscriptId: string

  const createTask = async (taskManuscriptId = manuscriptId): Promise<Task> =>
    Task.insert({
      groupId,
      manuscriptId: taskManuscriptId,
      title: 'Task',
      status: 'In progress',
      sequenceIndex: 0,
    })

  const alertsOf = async (taskId: string): Promise<TaskAlert[]> =>
    (await TaskAlert.find({ taskId })).result

  beforeAll(async () => {
    await config.init()
    db.init()
    await migrationManager.migrate()
  })

  beforeEach(async () => {
    await DbTestUtils.clearDb()
    groupId = (await Group.insert({})).id
    manuscriptId = (await Manuscript.insert({ groupId })).id
    otherManuscriptId = (await Manuscript.insert({ groupId })).id
  })

  afterAll(async () => {
    await DbTestUtils.clearDb()
  })

  describe('insertIgnoringDuplicates', () => {
    it('inserts new alerts and skips existing ones', async () => {
      const task = await createTask()
      const user = await User.insert({})
      const otherUser = await User.insert({})

      await TaskAlert.insert({ taskId: task.id, userId: user.id })

      await TaskAlert.insertIgnoringDuplicates([
        { taskId: task.id, userId: user.id },
        { taskId: task.id, userId: otherUser.id },
      ])

      expect((await alertsOf(task.id)).map(a => a.userId).sort()).toEqual(
        [user.id, otherUser.id].sort(),
      )
    })
  })

  describe('deleteByManuscriptId', () => {
    it("deletes the alerts of the manuscript's tasks only", async () => {
      const task = await createTask()
      const otherTask = await createTask(otherManuscriptId)
      const user = await User.insert({})
      await TaskAlert.insert({ taskId: task.id, userId: user.id })
      await TaskAlert.insert({ taskId: otherTask.id, userId: user.id })

      expect(await TaskAlert.deleteByManuscriptId(manuscriptId)).toBe(1)
      expect(await alertsOf(task.id)).toHaveLength(0)
      expect(await alertsOf(otherTask.id)).toHaveLength(1)
    })
  })

  describe('deleteByTaskId', () => {
    it("deletes the task's alerts only", async () => {
      const task = await createTask()
      const otherTask = await createTask()
      const user = await User.insert({})
      await TaskAlert.insert({ taskId: task.id, userId: user.id })
      await TaskAlert.insert({ taskId: otherTask.id, userId: user.id })

      expect(await TaskAlert.deleteByTaskId(task.id)).toBe(1)
      expect(await alertsOf(task.id)).toHaveLength(0)
      expect(await alertsOf(otherTask.id)).toHaveLength(1)
    })
  })

  describe('deleteByTaskIdAndUserIds', () => {
    it("deletes the given users' alerts for the task only", async () => {
      const task = await createTask()
      const otherTask = await createTask()
      const one = await User.insert({})
      const two = await User.insert({})
      const three = await User.insert({})

      await Promise.all(
        [one, two, three].map(user =>
          TaskAlert.insert({ taskId: task.id, userId: user.id }),
        ),
      )

      await TaskAlert.insert({ taskId: otherTask.id, userId: one.id })

      expect(
        await TaskAlert.deleteByTaskIdAndUserIds(task.id, [one.id, two.id]),
      ).toBe(2)
      expect((await alertsOf(task.id)).map(a => a.userId)).toEqual([three.id])
      expect(await alertsOf(otherTask.id)).toHaveLength(1)
    })
  })
})
