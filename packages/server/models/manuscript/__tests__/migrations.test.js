/* eslint-disable */

const { db, migrationManager, useTransaction } = require('@coko/server')

const Manuscript = require('../manuscript.model')
const oldContent = require('./content')

// const oldContent = `<h1>title</h1><p>hello<footnote>foot</footnote></p><br/><ul><li><p>yes</p></li><li><p><span class="comment" data-id="6b46da14-ebc3-4398-a243-018d8c0f9c79" data-conversation="[{&quot;content&quot;:&quot;demo comment&quot;,&quot;displayName&quot;:&quot;demo&quot;,&quot;timestamp&quot;:1601559766164}]" data-viewid="main" data-group="main"><bold>item</bold></span></p></li></ul>`

// const oldContent = `<h1>chapter title</h1><br/><h2>notes with drag and drop</h2><br/><span class="comment" data-id="6b46da14-ebc3-4398-a243-018d8c0f9c79" data-conversation="[{&quot;content&quot;:&quot;demo comment&quot;,&quot;displayName&quot;:&quot;demo&quot;,&quot;timestamp&quot;:1601559766164}]" data-viewid="main" data-group="main"><bold>item</bold></span>`

describe('Manuscript Migrations', () => {
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
    expect(comments[0].from).toBe(1071)
    expect(comments[0].to).toBe(1076)
    expect(comments[1].from).toBe(1138)
    expect(comments[1].to).toBe(1143)

    // rollback
    // insert new content
    // run the rollback
    // check that old content is there
    // check that new content is removed
  }, 10000)

  // Leave this disabled as it takes a couple of minutes to complete
  /* eslint-disable-next-line jest/no-disabled-tests */
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
      expect(comments[0].from).toBe(1071)
      expect(comments[0].to).toBe(1076)
      expect(comments[1].from).toBe(1138)
      expect(comments[1].to).toBe(1143)
    })

    expect(true).toBe(true)
  }, 600000)
})
