import { describe, it, expect } from 'vitest'
import cheerio from 'cheerio'

import {
  filterOutUnreferencedImages,
  getImageFileIdsInSource,
  remapImageFileIds,
  replaceImageFromNunjucksTemplate,
  replaceImageSrc,
  replaceImageSrcResponsive,
} from '../fileStorageUtils'

const file = (
  id: string,
  tags: string[],
): { id: string; tags: string[]; storedObjects: never[] } => ({
  id,
  tags,
  storedObjects: [],
})

describe('getImageFileIdsInSource', () => {
  it('collects data-fileid values from img elements', () => {
    const source = `
      <p><img data-fileid="a" /><img data-fileid="b" /></p>
      <img data-fileid="a" /><img src="x.png" /><img data-fileid="null" />
      <link data-fileid="c" />
    `

    expect([...getImageFileIdsInSource(source)].sort()).toEqual(['a', 'b'])
  })

  it('handles missing source', () => {
    expect(getImageFileIdsInSource(undefined).size).toBe(0)
    expect(getImageFileIdsInSource('').size).toBe(0)
  })
})

describe('filterOutUnreferencedImages', () => {
  const files = [
    file('used', ['manuscriptImage']),
    file('orphan1', ['manuscriptImage']),
    file('orphan2', ['manuscriptImage']),
    file('docx', ['manuscript']),
    file('pdf', ['printReadyPdf']),
    { id: 'untagged', tags: null, storedObjects: [] },
  ]

  it('drops manuscriptImage files the source does not reference', () => {
    const source = '<p>Text</p><img data-fileid="used" />'

    expect(filterOutUnreferencedImages(files, source).map(f => f.id)).toEqual([
      'used',
      'docx',
      'pdf',
      'untagged',
    ])
  })

  it('drops all images when the source references none', () => {
    expect(
      filterOutUnreferencedImages(files, '<p>No images</p>').map(f => f.id),
    ).toEqual(['docx', 'pdf', 'untagged'])
  })

  it('keeps everything if the source references files it was not given', () => {
    // e.g. a later version whose source still points at the previous version's files
    const source = '<img data-fileid="used" /><img data-fileid="elsewhere" />'

    expect(filterOutUnreferencedImages(files, source)).toBe(files)
  })
})

describe('remapImageFileIds', () => {
  it('replaces mapped data-fileid values and leaves the rest of the HTML alone', () => {
    const source =
      '<p>Text <img src="a" data-fileid="old-1" /><img data-fileid=\'old-2\'>' +
      '<img data-fileid="other" /></p>'

    const idMap = new Map([
      ['old-1', 'new-1'],
      ['old-2', 'new-2'],
    ])

    expect(remapImageFileIds(source, idMap)).toBe(
      '<p>Text <img src="a" data-fileid="new-1" /><img data-fileid=\'new-2\'>' +
        '<img data-fileid="other" /></p>',
    )
  })

  it('returns the source unchanged when there is nothing to map', () => {
    const source = '<img data-fileid="old-1" />'

    expect(remapImageFileIds(source, new Map())).toBe(source)
    expect(remapImageFileIds(null, new Map([['a', 'b']]))).toBeNull()
  })
})

describe('image src replacement', () => {
  const withSizes = (
    id: string,
    sizes: string[],
    mimetype = 'image/png',
  ): {
    id: string
    storedObjects: { type: string; url: string; mimetype: string }[]
  } => ({
    id,
    storedObjects: sizes.map(type => ({
      type,
      url: `${id}-${type}`,
      mimetype,
    })),
  })

  const ALL_SIZES = ['original', 'small', 'medium', 'full']

  const files = [
    withSizes('image', ALL_SIZES),
    // Files that file storage did not recognise as images (eg. base64 svgs
    // saved as ".svg+xml") only have an original, so other sizes must not be
    // required.
    withSizes('originalOnly', ['original']),
    withSizes('empty', []),
    // File storage writes PNG data into the other sizes of an SVG, so only the
    // original can be displayed.
    withSizes('svg', ALL_SIZES, 'image/svg+xml'),
  ]

  const imageAttribute = (html: string, id: string, name: string): string =>
    cheerio.load(html)(`img[data-fileid="${id}"]`).attr(name)

  it('replaceImageSrc uses the requested size, or the original when that size is missing or the image is an svg', async () => {
    const html = await replaceImageSrc(
      '<img data-fileid="image" /><img data-fileid="originalOnly" />' +
        '<img data-fileid="empty" src="kept" /><img data-fileid="svg" />',
      files,
      'medium',
    )

    expect(imageAttribute(html, 'image', 'src')).toBe('image-medium')
    expect(imageAttribute(html, 'originalOnly', 'src')).toBe(
      'originalOnly-original',
    )
    expect(imageAttribute(html, 'empty', 'src')).toBe('kept')
    expect(imageAttribute(html, 'svg', 'src')).toBe('svg-original')
  })

  it.each(['originalOnly', 'svg'])(
    'replaceImageSrcResponsive uses the original for every size of %s',
    async id => {
      const html = await replaceImageSrcResponsive(
        `<img data-fileid="${id}" />`,
        files,
      )

      const attribute = (name: string): string => imageAttribute(html, id, name)

      expect(attribute('src')).toBe(`${id}-original`)
      expect(attribute('data-low-def')).toBe(`${id}-original`)
      expect(attribute('data-standard-def')).toBe(`${id}-original`)
      expect(attribute('data-hi-def')).toBe(`${id}-original`)
    },
  )

  it('replaceImageFromNunjucksTemplate uses the original when the size is missing or the image is an svg', () => {
    expect(
      replaceImageFromNunjucksTemplate(
        '<img src="old" data-id="image" /><img src="old" data-id="originalOnly" />' +
          '<img src="old" data-id="empty" /><img src="old" data-id="svg" />',
        files,
        'medium',
      ),
    ).toBe(
      '<img src="image-medium" data-id="image" />' +
        '<img src="originalOnly-original" data-id="originalOnly" />' +
        '<img src="old" data-id="empty" />' +
        '<img src="svg-original" data-id="svg" />',
    )
  })
})
