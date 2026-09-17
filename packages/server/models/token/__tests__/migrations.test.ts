import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { config, db, DbTestUtils, migrationManager, uuid } from '@coko/server'

import Group from '../../group/group.model'
import Token from '../token.model'

describe('Token Migrations', () => {
  beforeAll(async () => {
    await config.init()
    db.init()
  })

  beforeEach(async () => {
    await DbTestUtils.dropAllTables()
  })

  afterAll(async () => {
    await DbTestUtils.clearDb()
    await db.destroy()
  })

  it('creates and drops tokens table', async () => {
    await migrationManager.migrate({
      to: '1768312501-meta-pg-boss',
    })

    let tableExists = await db.schema.hasTable('tokens')

    expect(tableExists).toBe(false)

    await migrationManager.migrate({ step: 1 })

    tableExists = await db.schema.hasTable('tokens')

    expect(tableExists).toBe(true)

    await migrationManager.rollback({ step: 1 })

    tableExists = await db.schema.hasTable('tokens')

    expect(tableExists).toBe(false)
  }, 30000)

  it('creates a constraint on names and groupId pairs', async () => {
    await migrationManager.migrate({ to: '1775729239-token.js' })

    const { id: groupId } = await Group.insert({})

    const firstToken = await Token.insert({
      name: 'specialToken',
      value: uuid(),
      groupId,
    })

    await migrationManager.migrate({ step: 1 })

    await expect(
      Token.insert({ name: 'specialToken', value: uuid(), groupId }),
    ).rejects.toThrow()

    await migrationManager.rollback({ step: 1 })

    const secondToken = await Token.insert({
      name: 'specialToken',
      value: uuid(),
      groupId,
    })

    expect(firstToken.name).toBe(secondToken.name)
    expect(firstToken.groupId).toBe(secondToken.groupId)
  }, 30000)
})
