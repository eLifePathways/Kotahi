import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import cheerio from 'cheerio'
import {
  uuid,
  uuidValidate,
  db,
  config,
  migrationManager,
  fileStorage,
  DbTestUtils,
  File,
} from '@coko/server'

import sanitizeWaxImages from '../sanitizeWaxImages'
import Manuscript from '../../models/manuscript/manuscript.model'

// 1x1 transparent png
const otherBase64Image =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='

const getFileIds = (html: string): string[] => {
  const $ = cheerio.load(html)
  return $('img')
    .map((i, elem) => $(elem).attr('data-fileid'))
    .get()
}

const countManuscriptFiles = async (manuscriptId: string): Promise<number> => {
  const { result } = await File.find({ objectId: manuscriptId })
  return result.length
}

const base64Image =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII='

describe('Sanitize wax images', () => {
  beforeAll(async () => {
    await config.init()
    db.init()
    await migrationManager.migrate()
    fileStorage.init()
  })

  beforeEach(async () => {
    await DbTestUtils.clearDb()
  })

  afterAll(async () => {
    await DbTestUtils.clearDb()
  })

  it('converts and uploads base64 images', async () => {
    const content = `
      <p>
        <img src=${base64Image} />
      </p>
    `

    const sanitized = await sanitizeWaxImages(content)
    const $ = cheerio.load(sanitized)
    const sanitizedImage = $('img')[0]

    expect($(sanitizedImage).attr('src')).toBe(undefined)
    expect(uuidValidate($(sanitizedImage).attr('data-fileid'))).toBe(true) // is uuid
  })

  it('removes src from images', async () => {
    const id = uuid()

    const content = `
      <p>
        <img data-fileid=${id} src="https://example.com/" />
      </p>
    `

    const sanitized = await sanitizeWaxImages(content)
    const $ = cheerio.load(sanitized)
    const sanitizedImage = $('img')[0]

    expect($(sanitizedImage).attr('src')).toBe(undefined)
    expect($(sanitizedImage).attr('data-fileid')).toBe(id)
  })

  it('throws an error if a non-base64 image has no file id', async () => {
    const content = `
      <p>
        <img src="https://example.com/" />
      </p>
    `

    await expect(sanitizeWaxImages(content)).rejects.toThrow()
  })

  it('reuses the same file when unchanged editor content is saved repeatedly', async () => {
    // The production editor keeps the base64 src (it never sees the data-fileid
    // assigned on save), so every autosave sends the same image again.
    const manuscript = await Manuscript.insert({})
    const content = `<p>Some text</p><img src="${base64Image}" />`

    const saves = []

    // Saves happen one after another, as with the editor's debounced autosave
    for (const typed of ['a', 'ab', 'abc', 'abcd', 'abcde']) {
      // eslint-disable-next-line no-await-in-loop
      const sanitized = await sanitizeWaxImages(
        `${content}<p>${typed}</p>`,
        manuscript.id,
      )

      saves.push(sanitized)
    }

    const fileIds = saves.map(html => getFileIds(html)[0])

    expect(new Set(fileIds).size).toBe(1)
    expect(await countManuscriptFiles(manuscript.id)).toBe(1)
  })

  it('creates one file for an image that appears more than once in the content', async () => {
    const manuscript = await Manuscript.insert({})

    const content = `<img src="${base64Image}" /><p>x</p><img src="${base64Image}" />`
    const sanitized = await sanitizeWaxImages(content, manuscript.id)
    const [first, second] = getFileIds(sanitized)

    expect(first).toBe(second)
    expect(await countManuscriptFiles(manuscript.id)).toBe(1)
  })

  it('creates separate files for different images', async () => {
    const manuscript = await Manuscript.insert({})

    const content = `<img src="${base64Image}" /><img src="${otherBase64Image}" />`
    const sanitized = await sanitizeWaxImages(content, manuscript.id)
    const [first, second] = getFileIds(sanitized)

    expect(first).not.toBe(second)
    expect(await countManuscriptFiles(manuscript.id)).toBe(2)
  })

  it('does not reuse an image file belonging to another manuscript', async () => {
    const manuscriptOne = await Manuscript.insert({})
    const manuscriptTwo = await Manuscript.insert({})
    const content = `<img src="${base64Image}" />`

    const [idOne] = getFileIds(
      await sanitizeWaxImages(content, manuscriptOne.id),
    )
    const [idTwo] = getFileIds(
      await sanitizeWaxImages(content, manuscriptTwo.id),
    )

    expect(idOne).not.toBe(idTwo)
    expect(await countManuscriptFiles(manuscriptOne.id)).toBe(1)
    expect(await countManuscriptFiles(manuscriptTwo.id)).toBe(1)
  })
})
