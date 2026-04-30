/* eslint-disable */

const { migrationManager, db } = require('@coko/server')
const Group = require('../../group/group.model')
const Config = require('../../config/config.model')
const Notification = require('../notification.model')

describe('Notification Migrations', () => {
  beforeEach(async () => {
    const tables = await db('pg_tables')
      .select('tablename')
      .where('schemaname', 'public')

    for (const t of tables) {
      await db.raw(`DROP TABLE IF EXISTS public.${t.tablename} CASCADE`)
    }
  })

  afterAll(async () => {
    await db.destroy()
  })

  it('creates and seeds notification table', async () => {
    await migrationManager.migrate({ to: '1726216088-move-wax-comments.js' })

    let tableExists = await db.schema.hasTable('notifications')

    const group1 = await Group.insert({})
    const group2 = await Group.insert({})

    await Config.insert({
      active: true,
      groupId: group1.id,
      formData: {},
    })

    await Config.insert({
      active: true,
      groupId: group2.id,
      formData: {},
    })

    expect(tableExists).toBe(false)

    // migrate to original migration
    await migrationManager.migrate({ step: 1 })

    tableExists = await db.schema.hasTable('notifications')

    let notification1 = await Notification.find({
      groupId: group1.id,
    })

    let notification2 = await Notification.find({
      groupId: group2.id,
    })

    const totalCount1 = notification1.totalCount
    const totalCount2 = notification2.totalCount

    expect(tableExists).toBe(true)
    expect(notification1.totalCount).toBeGreaterThan(0)
    expect(notification2.totalCount).toBeGreaterThan(0)

    // migrate to second migration
    await migrationManager.migrate({ step: 1 })

    tableExists = await db.schema.hasTable('notifications')
    notification1 = await Notification.find({
      groupId: group1.id,
    })

    notification2 = await Notification.find({
      groupId: group2.id,
    })

    expect(tableExists).toBe(true)
    expect(notification1.totalCount).toBe(totalCount1)
    expect(notification2.totalCount).toBe(totalCount2)

    // undo second migration
    await migrationManager.rollback({ step: 1 })

    tableExists = await db.schema.hasTable('notifications')

    expect(tableExists).toBe(false)
  }, 10000)
})
