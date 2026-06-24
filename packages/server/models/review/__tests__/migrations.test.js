/* eslint-disable */

const { db, migrationManager } = require('@coko/server')

const Manuscript = require('../../manuscript/manuscript.model')
const Review = require('../review.model')
const User = require('../../user/user.model')

describe('Review Migrations', () => {
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

  it('adds `is_imported` column', async () => {
    await migrationManager.migrate({
      to: '1733476232-move-group-manager-to-group-admin.js',
    })

    const manuscript = await Manuscript.insert({})

    let review1Before = await Review.insert({
      manuscriptId: manuscript.id,
      jsonData: {
        comment: '<p class="paragraph">Anonymous review comment</p>',
      },
    })

    review1Before = await Review.findById(review1Before.id)

    expect(review1Before.isImported).toBe(undefined)

    await migrationManager.migrate({ step: 1 })

    const review1After = await Review.findById(review1Before.id)

    expect(review1After.isImported).toBe(true)

    const user = await User.insert({})

    let review2 = await Review.insert({
      manuscriptId: manuscript.id,
      userId: user.id,
      jsonData: { comment: '<p class="paragraph">User review comment</p>' },
    })

    review2 = await Review.findById(review2.id)

    expect(review2.isImported).toBe(false)
  })
})
