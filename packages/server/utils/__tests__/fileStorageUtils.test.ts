import { describe, it, expect } from 'vitest'

import {
  filterOutUnreferencedImages,
  getImageFileIdsInSource,
  remapImageFileIds,
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
