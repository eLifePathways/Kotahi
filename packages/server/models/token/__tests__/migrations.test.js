/* eslint-disable */

const { db, migrationManager, uuid } = require('@coko/server')
const Group = require('../../group/group.model')
const Token = require('../token.model')

describe('Token Migrations', () => {
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

  it('creates and drops tokens table', async () => {
    await migrationManager.migrate({
      to: '1757670017-activate-empty-notifications.js',
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

    await expect(async () => {
      await Token.insert({ name: 'specialToken', value: uuid(), groupId })
    }).rejects.toThrow()

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
