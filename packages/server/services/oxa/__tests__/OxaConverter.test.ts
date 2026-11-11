import { describe, it, expect } from 'vitest'

import type Manuscript from '../../../models/manuscript/manuscript.model'
import OxaConverter, { type OxaConverterOptions } from '../OxaConverter'
import type { OxaDocument } from '../oxa.types'

const manuscript = {
  submission: {
    $title: '<p>A <em>simple</em> manuscript</p>',
    $authors: [
      {
        id: 'a1',
        firstName: 'Jane',
        lastName: 'Doe',
        affiliation: 'Example University',
      },
    ],
  },
  meta: {
    source: [
      '<h1>Introduction</h1>',
      '<p class="paragraph">Some <strong>bold</strong> text, see ',
      '<a href="https://example.com">this link</a>.</p>',
      '<ul><li><p class="paragraph">First item</p></li></ul>',
    ].join(''),
  },
} as unknown as Manuscript

describe('OxaConverter', () => {
  it('converts to standard OXA that passes validation', () => {
    const converter = new OxaConverter(manuscript)
    const document = converter.convert()

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
    const converter = new OxaConverter(manuscript, {
      enableRFC: true,
      enableExperimental: true,
    })

    const document = converter.convert()

    expect(document.metadata?.authors).toEqual([
      {
        identifier: 'author-a1',
        name: 'Jane Doe',
        givenName: 'Jane',
        familyName: 'Doe',
        affiliations: ['@aff-1'],
      },
    ])

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
      fields: Record<string, unknown>,
      options: OxaConverterOptions = {},
    ): OxaDocument =>
      new OxaConverter(fields as unknown as Manuscript, options).convert()

    it('converts an empty manuscript to an empty document', () => {
      expect(convert({})).toEqual({ type: 'Document', children: [] })
    })

    it('reads a plain string title', () => {
      expect(convert({ submission: { $title: 'Plain title' } }).title).toEqual([
        { type: 'Text', value: 'Plain title' },
      ])
    })

    it('joins headings and paragraphs in the title and drops other blocks', () => {
      expect(
        convert({
          submission: { $title: '<h1>Main</h1><hr><p>sub <em>title</em></p>' },
        }).title,
      ).toEqual([
        { type: 'Text', value: 'Main sub ' },
        { type: 'Emphasis', children: [{ type: 'Text', value: 'title' }] },
      ])
    })

    it('falls back to the meta title', () => {
      expect(convert({ meta: { title: 'Meta title' } }).title).toEqual([
        { type: 'Text', value: 'Meta title' },
      ])
    })

    it('omits an empty title', () => {
      expect(
        convert({ submission: { $title: '<p> </p>' } }),
      ).not.toHaveProperty('title')
    })

    it('adds the abstract to metadata only when experimental is on', () => {
      const fields = { submission: { $abstract: '<p>Abstract</p>' } }

      expect(convert(fields)).not.toHaveProperty('metadata')

      expect(convert(fields, { enableExperimental: true }).metadata).toEqual({
        abstract: [
          {
            type: 'Paragraph',
            children: [{ type: 'Text', value: 'Abstract' }],
          },
        ],
      })
    })

    it('falls back to the meta abstract', () => {
      expect(
        convert(
          { meta: { abstract: '<p>Meta abstract</p>' } },
          { enableExperimental: true },
        ).metadata,
      ).toMatchObject({ abstract: [{ type: 'Paragraph' }] })
    })
  })
})
