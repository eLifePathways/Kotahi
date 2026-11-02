import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { db, config, DbTestUtils, migrationManager } from '@coko/server'

import Group from '../../group/group.model'
import Config from '../config.model'

describe('Config model', () => {
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

  it('gets the active config for a group', async () => {
    const group = await Group.insert({})

    const activeConfig = await Config.insert({
      groupId: group.id,
      active: true,
      formData: {},
    })

    const result = await Config.getActive(group.id)

    expect(result?.id).toBe(activeConfig.id)
  })

  it('does not return an inactive config', async () => {
    const group = await Group.insert({})

    await Config.insert({
      groupId: group.id,
      active: false,
      formData: {},
    })

    const result = await Config.getActive(group.id)

    expect(result).toBeUndefined()
  })

  it('picks the active config when an inactive one also exists for the group', async () => {
    const group = await Group.insert({})

    await Config.insert({
      groupId: group.id,
      active: false,
      formData: {},
    })

    const activeConfig = await Config.insert({
      groupId: group.id,
      active: true,
      formData: {},
    })

    const result = await Config.getActive(group.id)

    expect(result?.id).toBe(activeConfig.id)
  })

  it("does not return a different group's active config", async () => {
    const group = await Group.insert({})
    const otherGroup = await Group.insert({})

    await Config.insert({
      groupId: otherGroup.id,
      active: true,
      formData: {},
    })

    const result = await Config.getActive(group.id)

    expect(result).toBeUndefined()
  })
})
