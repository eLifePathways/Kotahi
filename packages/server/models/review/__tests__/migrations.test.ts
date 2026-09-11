import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { config, db, DbTestUtils, migrationManager } from '@coko/server'

import Manuscript from '../../manuscript/manuscript.model'
import Review from '../review.model'
import User from '../../user/user.model'

describe('Review Migrations', () => {
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
