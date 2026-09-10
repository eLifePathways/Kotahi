import path from 'path'
import fs from 'node:fs'
import { describe, beforeAll, beforeEach, afterAll, expect, it } from 'vitest'
import {
  db,
  migrationManager,
  createFile,
  fileStorage,
  config,
  DbTestUtils,
} from '@coko/server'

import User from '../user.model'

const defaultProfilePic = '/profiles/default_avatar.svg'

// Presigned S3 URLs embed a timestamp and a signature derived from it, so
// two calls for the same object key never produce identical strings. Compare
// everything but the query string when a URL has been freshly regenerated.
const withoutQuery = (url: string): string => url.split('?')[0]

describe('User migrations', () => {
  beforeAll(async () => {
    await config.init()
    db.init()
    fileStorage.init()
  })

  beforeEach(async () => {
    await DbTestUtils.dropAllTables()
  })

  afterAll(async () => {
    await DbTestUtils.clearDb()
    await db.destroy()
  })

  it('Make profile picture a file id foreign key', async () => {
    await migrationManager.migrate({
      to: '1738163837-add-is-imported-column.js',
    })

    let userWithoutPic = await User.insert({})

    // use pure knex as the updated model won't allow non-uuid value
    await db('users')
      .where({ id: userWithoutPic.id })
      .update({ profile_picture: defaultProfilePic })

    let userWithPic = await User.insert({})

    // createFile() (from the currently installed @coko/server) always inserts
    // a "meta" value, since it assumes the files table is fully up to date.
    // That column is only added by @coko/server's own
    // 1752222828-file-meta.js migration, which is dated *after* this test's
    // 1740059249-profile-picture-file-id.js migration under test - so we
    // can't migrate forward to pick it up without also running (and thus
    // losing the "before" state of) the migration this test is about.
    // Add the column directly instead, decoupled from migration ordering.
    if (!(await db.schema.hasColumn('files', 'meta'))) {
      await db.schema.table('files', table => {
        table.jsonb('meta').defaultTo('{}')
      })
    }

    const filePath = path.join(__dirname, 'profile.svg')

    const file = await createFile(
      fs.createReadStream(filePath),
      'profile.svg',
      {
        tags: ['profilePicture'],
        objectId: userWithPic.id,
      },
    )

    const storedObject = file.getStoredObjectBasedOnType('small')
    const url = await fileStorage.getURL(storedObject.key)

    await db('users')
      .where({ id: userWithPic.id })
      .update({ profile_picture: url })

    userWithoutPic = (await User.query().findById(userWithoutPic.id)) as User
    userWithPic = (await User.query().findById(userWithPic.id)) as User

    expect(userWithoutPic.profilePicture).toBe(defaultProfilePic)
    expect(userWithPic.profilePicture).toBe(url)

    await migrationManager.migrate({ step: 1 })

    userWithoutPic = (await User.query().findById(userWithoutPic.id)) as User
    userWithPic = (await User.query().findById(userWithPic.id)) as User

    expect(userWithoutPic.profilePicture).toBe(null)
    expect(userWithPic.profilePicture).toBe(file.id)

    await migrationManager.rollback({ step: 1 })

    userWithoutPic = (await User.query().findById(userWithoutPic.id)) as User
    userWithPic = (await User.query().findById(userWithPic.id)) as User

    expect(userWithoutPic.profilePicture).toBe(null)
    expect(withoutQuery(userWithPic.profilePicture as string)).toBe(
      withoutQuery(url as string),
    )
  })

  it('drops unique index on username column', async () => {
    await migrationManager.migrate({
      to: '1740059249-profile-picture-file-id.js',
    })

    const USERNAME_ONE = 'User One'
    const USERNAME_TWO = 'User Two'

    const userOne = await User.insert({ username: USERNAME_ONE })
    await expect(User.insert({ username: USERNAME_ONE })).rejects.toThrow()
    expect(userOne.username).toBe(USERNAME_ONE)

    await migrationManager.migrate({ step: 1 })

    const userTwo = await User.insert({ username: USERNAME_ONE })
    expect(userTwo.username).toBe(userOne.username)

    // patching for rollback to succeed, avoid constraint violation
    await User.query()
      .patch({ username: USERNAME_TWO })
      .where({ id: userTwo.id })

    await migrationManager.rollback({ step: 1 })

    await expect(User.insert({ username: USERNAME_ONE })).rejects.toThrow()
  })

  it('drops the menu pinned columns', async () => {
    let hasColumn: boolean

    await migrationManager.migrate({
      to: '1776094540-unique-name-group-id',
    })

    hasColumn = await db.schema.hasColumn('users', 'menu_pinned')
    expect(hasColumn).toBe(true)

    const columnInfoPre = await db('users').columnInfo('menu_pinned')
    expect(columnInfoPre.type).toEqual('boolean')

    await migrationManager.migrate({ step: 1 })

    hasColumn = await db.schema.hasColumn('users', 'menu_pinned')
    expect(hasColumn).toBe(false)

    await migrationManager.rollback({ step: 1 })

    hasColumn = await db.schema.hasColumn('users', 'menu_pinned')
    expect(hasColumn).toBe(true)

    const columnInfoRollback = await db('users').columnInfo('menu_pinned')
    expect(columnInfoRollback.type).toEqual('boolean')
  })
})
