/* eslint-disable */

const path = require('path')
const fs = require('fs-extra')

const {
  db,
  migrationManager,
  createFile,
  fileStorage,
} = require('@coko/server')

const User = require('../user.model')

const defaultProfilePic = '/profiles/default_avatar.svg'

describe('User migrations', () => {
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

  it('Make profile picture a file id foreign key', async () => {
    await migrationManager.migrate({
      to: '1733476232-move-group-manager-to-group-admin.js',
    })

    let userWithoutPic = await User.query().insert({})

    // use pure knex as the updated model won't allow non-uuid value
    await db('users')
      .where({ id: userWithoutPic.id })
      .update({ profile_picture: defaultProfilePic })

    let userWithPic = await User.query().insert({})

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

    userWithoutPic = await User.query().findById(userWithoutPic.id)
    userWithPic = await User.query().findById(userWithPic.id)

    expect(userWithoutPic.profilePicture).toBe(defaultProfilePic)
    expect(userWithPic.profilePicture).toBe(url)

    await migrationManager.migrate({ step: 1 })

    userWithoutPic = await User.query().findById(userWithoutPic.id)
    userWithPic = await User.query().findById(userWithPic.id)

    expect(userWithoutPic.profilePicture).toBe(null)
    expect(userWithPic.profilePicture).toBe(file.id)

    await migrationManager.rollback({ step: 1 })

    userWithoutPic = await User.query().findById(userWithoutPic.id)
    userWithPic = await User.query().findById(userWithPic.id)

    expect(userWithoutPic.profilePicture).toBe(null)
    expect(userWithPic.profilePicture).toBe(url)
  })

  it('drops unique index on username column', async () => {
    await migrationManager.migrate({
      to: '1740059249-profile-picture-file-id.js',
    })

    const USERNAME_ONE = 'User One'
    const USERNAME_TWO = 'User Two'

    const userOne = await User.query().insert({ username: USERNAME_ONE })

    await expect(async () => {
      User.query().insert({ username: USERNAME_ONE })
    }).rejects.toThrow()

    expect(userOne.username).toBe(USERNAME_ONE)

    await migrationManager.migrate({ step: 1 })

    const userTwo = await User.query().insert({ username: USERNAME_ONE })

    expect(userTwo.username).toBe(userOne.username)

    // patching for rollback to succeed, avoid constraint violation
    await User.query()
      .patch({ username: USERNAME_TWO })
      .where({ id: userTwo.id })

    await migrationManager.rollback({ step: 1 })

    await expect(async () => {
      User.query().insert({ username: USERNAME_ONE })
    }).rejects.toThrow()
  })
})
