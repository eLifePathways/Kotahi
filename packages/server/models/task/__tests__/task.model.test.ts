import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { db, config, DbTestUtils, migrationManager } from '@coko/server'

import Task from '../task.model'
import Group from '../../group/group.model'
import Manuscript from '../../manuscript/manuscript.model'

const task = (data: Record<string, unknown>): Promise<Task> =>
  Task.insert({ title: 'A task', status: 'Not started', ...data })

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
})
