import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { db, config, migrationManager, DbTestUtils, File } from '@coko/server'

import Manuscript from '../manuscript.model'

const MIGRATION_BEFORE_REMAP = '1791912695-remove-repoipaddress.ts'

const image = (objectId: string, key: string): Promise<{ id: string }> =>
  File.insert({
    name: key,
    tags: ['manuscriptImage'],
    objectId,
    storedObjects: [
      {
        type: 'original',
        key,
        mimetype: 'image/png',
        extension: 'png',
        size: 1,
      },
      {
        type: 'medium',
        key: `${key}-medium`,
        mimetype: 'image/png',
        extension: 'png',
        size: 1,
      },
    ],
  })

const img = (fileId: string): string =>
  `<img src="x" data-fileid="${fileId}" />`

const sourceOf = async (id: string): Promise<string> =>
  (await Manuscript.query().findById(id)).meta.source

describe('Remap version image file ids migration', () => {
  beforeAll(async () => {
    await config.init()
    db.init()
  })

  beforeEach(async () => {
    await DbTestUtils.dropAllTables()
    await migrationManager.migrate({ to: MIGRATION_BEFORE_REMAP })
  })

  afterAll(async () => {
    await DbTestUtils.clearDb()
  })

  it("points each version's images at its own copies", async () => {
    // Version 1 owns the originals
    const v1 = await Manuscript.insert({})
    const a1 = await image(v1.id, 'a.png')
    const b1 = await image(v1.id, 'b.png')
    const v1Source = `<p>First</p>${img(a1.id)}${img(b1.id)}`
    await Manuscript.query()
      .findById(v1.id)
      .patch({ meta: { source: v1Source } })

    // Version 2 has copies (new ids, same storage keys), but its source still
    // points at version 1's files, as the old createNewVersion left it
    const v2 = await Manuscript.insert({ parentId: v1.id })
    const a2 = await image(v2.id, 'a.png')
    const b2 = await image(v2.id, 'b.png')

    await Manuscript.query()
      .findById(v2.id)
      .patch({
        meta: {
          source: `<p>Second</p>${img(a1.id)}<p>between</p>${img(b1.id)}`,
          comments: [{ id: 'kept' }],
        },
      })

    // Version 3 was copied from version 2, so it inherited version 1's ids too
    const v3 = await Manuscript.insert({ parentId: v1.id })
    const a3 = await image(v3.id, 'a.png')

    await Manuscript.query()
      .findById(v3.id)
      .patch({ meta: { source: `<p>Third</p>${img(a1.id)}` } })

    await migrationManager.migrate({ step: 1 })

    expect(await sourceOf(v2.id)).toBe(
      `<p>Second</p>${img(a2.id)}<p>between</p>${img(b2.id)}`,
    )
    expect(await sourceOf(v3.id)).toBe(`<p>Third</p>${img(a3.id)}`)

    // The rest of meta survives
    expect((await Manuscript.query().findById(v2.id)).meta.comments).toEqual([
      { id: 'kept' },
    ])

    // The first version isn't a copy, so it's left as it was
    expect(await sourceOf(v1.id)).toBe(v1Source)
  })

  it('leaves ids it cannot match alone', async () => {
    const v1 = await Manuscript.insert({})
    const a1 = await image(v1.id, 'a.png')
    const unmatched = await image(v1.id, 'only-in-v1.png')

    const v2 = await Manuscript.insert({ parentId: v1.id })
    const a2 = await image(v2.id, 'a.png')
    const ownImage = await image(v2.id, 'own.png')

    const source = [
      img(a1.id),
      img(unmatched.id), // no copy in version 2
      img(ownImage.id), // already version 2's own
      img('8f7b4c1e-0000-4000-8000-000000000000'), // no such file
      img('not-a-uuid'),
      img('null'),
    ].join('')

    await Manuscript.query().findById(v2.id).patch({ meta: { source } })

    await migrationManager.migrate({ step: 1 })

    expect(await sourceOf(v2.id)).toBe(
      source.replace(`data-fileid="${a1.id}"`, `data-fileid="${a2.id}"`),
    )
  })
})
