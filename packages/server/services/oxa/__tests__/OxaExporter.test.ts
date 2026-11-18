import { describe, it, expect } from 'vitest'

import OxaExporter from '../OxaExporter'
import type { OxaConverterOptions, OxaSource } from '../OxaConverter'
import type { OxaDocument } from '../oxa.types'

const fileUrl = (file: { id: string }): string => `https://files/${file.id}`

const source: OxaSource = {
  title: '<p>A <em>simple</em> manuscript</p>',
  body: [
    '<h1>Introduction</h1>',
    '<p class="paragraph">Some <strong>bold</strong> text, see ',
    '<a href="https://example.com">this link</a>.</p>',
    '<ul><li><p class="paragraph">First item</p></li></ul>',
  ].join(''),
}

describe('OxaExporter', () => {
  it('converts to standard OXA that passes validation', () => {
    const document = new OxaExporter({
      enableRFC: false,
      enableExperimental: false,
      fileUrl,
    }).toOxa(source)

    expect(document).toEqual({
      type: 'Document',
      title: [
        { type: 'Text', value: 'A ' },
        { type: 'Emphasis', children: [{ type: 'Text', value: 'simple' }] },
        { type: 'Text', value: ' manuscript' },
      ],
      children: [
        {
          type: 'Heading',
          level: 1,
          children: [{ type: 'Text', value: 'Introduction' }],
        },
        {
          type: 'Paragraph',
          children: [
            { type: 'Text', value: 'Some ' },
            { type: 'Strong', children: [{ type: 'Text', value: 'bold' }] },
            { type: 'Text', value: ' text, see this link.' },
          ],
        },
        {
          type: 'Paragraph',
          children: [{ type: 'Text', value: '• First item' }],
        },
      ],
    })
  })

  it('emits RFC and experimental nodes when enabled', () => {
    const document = new OxaExporter({
      enableRFC: true,
      enableExperimental: true,
      fileUrl,
    }).toOxa(source)

    expect(document.children[1]).toMatchObject({
      type: 'Paragraph',
      children: expect.arrayContaining([
        expect.objectContaining({ type: 'Link', url: 'https://example.com' }),
      ]),
    })

    expect(document.children[2]).toMatchObject({
      type: 'List',
      ordered: false,
    })
  })

  describe('document', () => {
    const convert = (
      input: OxaSource,
      options: OxaConverterOptions = {},
    ): OxaDocument => new OxaExporter({ ...options, fileUrl }).toOxa(input)

    it('converts an empty source to an empty document', () => {
      expect(convert({})).toEqual({ type: 'Document', children: [] })
    })

    it('reads a plain string title', () => {
      expect(convert({ title: 'Plain title' }).title).toEqual([
        { type: 'Text', value: 'Plain title' },
      ])
    })

    it('joins headings and paragraphs in the title and drops other blocks', () => {
      expect(
        convert({ title: '<h1>Main</h1><hr><p>sub <em>title</em></p>' }).title,
      ).toEqual([
        { type: 'Text', value: 'Main sub ' },
        { type: 'Emphasis', children: [{ type: 'Text', value: 'title' }] },
      ])
    })

    it('omits an empty title', () => {
      expect(convert({ title: '<p> </p>' })).not.toHaveProperty('title')
    })

    it('puts metadata in data at its path', () => {
      expect(
        convert({
          metadata: [
            { path: 'doi', value: '10.1000/xyz' },
            { path: 'topics', value: ['coral', 'reefs'] },
            { path: '_reviews.0.comment', value: 'Good' },
          ],
        }).data,
      ).toEqual({
        doi: '10.1000/xyz',
        topics: ['coral', 'reefs'],
        _reviews: [{ comment: 'Good' }],
      })
    })

    it('converts HTML metadata and drops entries that convert to nothing', () => {
      expect(
        convert({
          metadata: [
            { path: 'abstract', value: '<p>Abstract</p>', html: true },
            { path: 'empty', value: '<p></p>', html: true },
          ],
        }).data,
      ).toEqual({
        abstract: [
          {
            type: 'Paragraph',
            children: [{ type: 'Text', value: 'Abstract' }],
          },
        ],
      })
    })

    it('ignores paths that would write to an object prototype', () => {
      const document = convert({
        metadata: [
          { path: '__proto__.polluted', value: 'yes' },
          { path: 'a.constructor.prototype.polluted', value: 'yes' },
        ],
      })

      expect(document.data).not.toHaveProperty('polluted')
      expect(({} as Record<string, unknown>).polluted).toBeUndefined()
    })

    it('keeps metadata from the body apart from source metadata', () => {
      expect(
        convert(
          {
            body: '<p class="fundingstatement">Funded by NSF.</p>',
            metadata: [{ path: 'fundingStatement', value: 'From the form' }],
          },
          { enableExperimental: true },
        ).data,
      ).toEqual({
        fundingStatement: 'From the form',
        _body: {
          fundingStatement: [[{ type: 'Text', value: 'Funded by NSF.' }]],
        },
      })
    })

    it('lists file metadata with their URLs', () => {
      expect(
        convert({
          metadata: [
            {
              path: 'attachments',
              files: [
                { id: 'f1', name: 'data.csv', mimetype: 'text/csv' },
                { id: 'f2', name: 'raw.zip', mimetype: 'application/zip' },
              ],
            },
          ],
        }).data,
      ).toEqual({
        attachments: [
          {
            name: 'data.csv',
            url: 'https://files/f1',
            encodingFormat: 'text/csv',
          },
          {
            name: 'raw.zip',
            url: 'https://files/f2',
            encodingFormat: 'application/zip',
          },
        ],
      })
    })

    it('lets later entries win on the same path', () => {
      expect(
        convert({
          metadata: [
            { path: 'volumeNumber', value: '5' },
            { path: 'volumeNumber', value: '4' },
          ],
        }).data,
      ).toEqual({ volumeNumber: '4' })
    })

    it('never emits metadata', () => {
      const document = convert(
        { metadata: [{ path: 'doi', value: '10.1000/xyz' }] },
        { enableRFC: true, enableExperimental: true },
      )

      expect(document).not.toHaveProperty('metadata')
    })
  })
})
