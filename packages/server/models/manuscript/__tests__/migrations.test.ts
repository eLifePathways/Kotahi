import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import {
  db,
  config,
  migrationManager,
  useTransaction,
  DbTestUtils,
} from '@coko/server'

import Manuscript from '../manuscript.model'
import Team from '../../team/team.model'
import User from '../../user/user.model'

import oldContent from './content'

const MIGRATION_BEFORE_SEARCH_CHANGES = '1783674872-remove-menu-pinned.ts'

const matchesSearch = async (manuscriptId, term): Promise<boolean> => {
  const { rows } = await db.raw(
    `select (search_tsvector @@ to_tsquery('english', ?)) as matched from manuscripts where id = ?`,
    [term, manuscriptId],
  )

  return rows[0].matched
}

// const oldContent = `<h1>title</h1><p>hello<footnote>foot</footnote></p><br/><ul><li><p>yes</p></li><li><p><span class="comment" data-id="6b46da14-ebc3-4398-a243-018d8c0f9c79" data-conversation="[{&quot;content&quot;:&quot;demo comment&quot;,&quot;displayName&quot;:&quot;demo&quot;,&quot;timestamp&quot;:1601559766164}]" data-viewid="main" data-group="main"><bold>item</bold></span></p></li></ul>`
// const oldContent = `<h1>chapter title</h1><br/><h2>notes with drag and drop</h2><br/><span class="comment" data-id="6b46da14-ebc3-4398-a243-018d8c0f9c79" data-conversation="[{&quot;content&quot;:&quot;demo comment&quot;,&quot;displayName&quot;:&quot;demo&quot;,&quot;timestamp&quot;:1601559766164}]" data-viewid="main" data-group="main"><bold>item</bold></span>`

describe('Manuscript Migrations', () => {
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

  it('Move wax comments to separate field', async () => {
    // check that old content is removed
    // check that new content is there

    await migrationManager.migrate({
      to: '1724847088-user-id-team-id-not-null.js',
    })

    await Manuscript.insert({
      meta: {
        source: oldContent,
      },
    })

    await migrationManager.migrate({
      step: 1,
    })

    const manuscripts = await Manuscript.find({})

    const { comments } = manuscripts.result[0].meta
    expect(comments && comments[0].from).toBe(1071)
    expect(comments && comments[0].to).toBe(1076)
    expect(comments && comments[1].from).toBe(1138)
    expect(comments && comments[1].to).toBe(1143)

    // rollback
    // insert new content
    // run the rollback
    // check that old content is there
    // check that new content is removed
  }, 10000)

  // Leave this disabled as it takes a couple of minutes to complete
  /* eslint-disable-next-line vitest/no-disabled-tests */
  it.skip('more', async () => {
    await migrationManager.migrate({
      to: '1724847088-user-id-team-id-not-null.js',
    })

    const N = 10000

    // console.log('migrated up until here')

    await useTransaction(async trx => {
      await Promise.all(
        Array.from(Array(N)).map(async () => {
          await Manuscript.insert(
            {
              meta: {
                source: oldContent,
              },
            },
            { trx },
          )
        }),
      )
    })

    // console.log('created a bunch of manuscripts')

    await migrationManager.migrate({
      step: 1,
    })

    const manuscripts = await Manuscript.find({})

    manuscripts.result.forEach(m => {
      const { comments } = m.meta
      expect(comments && comments[0].from).toBe(1071)
      expect(comments && comments[0].to).toBe(1076)
      expect(comments && comments[1].from).toBe(1138)
      expect(comments && comments[1].to).toBe(1143)
    })

    expect(true).toBe(true)
  }, 600000)

  it('restricts search to manuscripts-table data', async () => {
    await migrationManager.migrate({ to: MIGRATION_BEFORE_SEARCH_CHANGES })

    const manuscript = await Manuscript.insert({
      submission: { $title: 'Wombat Manuscript Title' },
    })

    const reviewer = await User.insert({ username: 'quokkaville' })

    const reviewerTeam = await Team.insert({
      objectId: manuscript.id,
      objectType: 'manuscript',
      role: 'reviewer',
      displayName: 'Reviewers',
    })

    await Team.addMember(reviewerTeam.id, reviewer.id)

    // The trigger only fires on manuscript insert/update, so re-touch the manuscript now that
    // the reviewer team member exists, to bring search_tsvector up to date with it.
    await db.raw('update manuscripts set updated = updated where id = ?', [
      manuscript.id,
    ])

    // Before the migration: both the title and the reviewer's username match.
    expect(await matchesSearch(manuscript.id, 'wombat')).toBe(true)
    expect(await matchesSearch(manuscript.id, 'quokkaville')).toBe(true)

    await migrationManager.migrate({ step: 1 })

    // After the migration: the title still matches, but the reviewer no longer does, since
    // matching is now restricted to manuscripts-table data.
    expect(await matchesSearch(manuscript.id, 'wombat')).toBe(true)
    expect(await matchesSearch(manuscript.id, 'quokkaville')).toBe(false)

    await migrationManager.rollback({ step: 1 })

    // After rolling back: both match again.
    expect(await matchesSearch(manuscript.id, 'wombat')).toBe(true)
    expect(await matchesSearch(manuscript.id, 'quokkaville')).toBe(true)
  })
})
