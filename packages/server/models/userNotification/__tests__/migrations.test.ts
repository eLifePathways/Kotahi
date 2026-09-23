import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { migrationManager, db, config, DbTestUtils } from '@coko/server'

describe('UserNotification Migrations', () => {
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

  it('creates and drops user_notifications table', async () => {
    await migrationManager.migrate({ to: '1789019316-remove-chat-expanded.ts' })

    let tableExists = await db.schema.hasTable('user_notifications')

    expect(tableExists).toBe(false)

    await migrationManager.migrate({ step: 1 })

    tableExists = await db.schema.hasTable('user_notifications')

    expect(tableExists).toBe(true)

    await migrationManager.rollback({ step: 1 })

    tableExists = await db.schema.hasTable('user_notifications')

    expect(tableExists).toBe(false)
  })
})
