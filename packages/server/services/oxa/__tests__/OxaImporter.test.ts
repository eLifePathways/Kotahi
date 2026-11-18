import { describe, it, expect } from 'vitest'

import OxaExporter from '../OxaExporter'
import OxaImporter from '../OxaImporter'
import type { OxaDocument } from '../oxa.types'

const fileUrl = (file: { id: string }): string => `https://files/${file.id}`

const ALL = { enableRFC: true, enableExperimental: true }

const toOxa = (source: string): OxaDocument =>
  new OxaExporter({ ...ALL, fileUrl }).toOxa({ body: source })

const toHtml = (document: unknown): string =>
  new OxaImporter(ALL).fromOxa(document as OxaDocument).body

const doc = (...children: unknown[]): unknown => ({
  type: 'Document',
  children,
})

describe('OxaImporter', () => {
  it('round-trips every node type', () => {
    const source = [
      '<h2>Intro</h2>',
      '<p class="paragraph intro" id="p1">Some <strong>bold</strong>, <em>it</em>, ',
      '<sub>2</sub>, <sup>3</sup>, <u>u</u>, <span class="small-caps">sc</span>, ',
      '<span class="strikethrough">st</span>, <code data-language="js">x()</code>, ',
      '<a href="https://example.com" title="Ex">link</a>, a&lt;b &amp; "q"<br>next',
      '<footnote id="f1">Note <em>here</em></footnote> and ',
      '<math-inline class="math-node">a+b</math-inline> see ',
      `<span class="callout" id="c1" data-citationitems='[{"id":"r1"}]'>[1]</span></p>`,
      '<pre data-language="py"><code>print(1)\n  x</code></pre>',
      '<hr>',
      '<blockquote><p class="paragraph">Quote</p></blockquote>',
      '<ul><li><p class="paragraph">One</p></li></ul>',
      '<ol start="3"><li><p class="paragraph">Three</p>',
      '<ol><li><p class="paragraph">Nested</p></li></ol></li></ol>',
      '<figure><img src="a.png" alt="Alt"><figcaption>Figure caption</figcaption></figure>',
      '<table><caption><p class="paragraph">Table caption</p></caption>',
      '<tbody><tr><th>H</th><td colspan="2">C</td></tr></tbody></table>',
      '<math-display class="math-node">x^2</math-display>',
      '<section class="abstractSection" id="s1"><p class="paragraph">Abstract</p></section>',
      `<p class="ref" id="r1" data-structure='{"title":"T","type":"book"}'>Ref</p>`,
    ].join('')

    const document = toOxa(source)

    expect(toOxa(toHtml(document))).toEqual(document)
  })

  it('renders the HTML the editor expects', () => {
    expect(
      toHtml(
        doc(
          {
            type: 'Paragraph',
            id: 'p1',
            classes: ['intro'],
            children: [{ type: 'Text', value: 'a < b & "c"' }],
          },
          {
            type: 'Heading',
            level: 3,
            children: [{ type: 'Text', value: 'H' }],
          },
          {
            type: 'Paragraph',
            children: [
              {
                type: 'CiteGroup',
                kind: 'parenthetical',
                children: [
                  { type: 'Cite', xref: 'r1' },
                  { type: 'Cite', xref: 'r2' },
                ],
                data: { calloutText: '[1, 2]' },
              },
            ],
          },
        ),
      ),
    ).toBe(
      [
        '<p id="p1" class="paragraph intro">a &lt; b &amp; &quot;c&quot;</p>',
        '<h3>H</h3>',
        '<p class="paragraph"><span class="callout" ',
        'data-citationitems="[{&quot;id&quot;:&quot;r1&quot;},{&quot;id&quot;:&quot;r2&quot;}]" ',
        'data-citationcallouttext="[1, 2]">[1, 2]</span></p>',
      ].join(''),
    )
  })

  it('puts a table caption inside the table', () => {
    expect(
      toHtml(
        doc({
          type: 'Figure',
          children: [
            {
              type: 'Caption',
              children: [
                {
                  type: 'Paragraph',
                  children: [{ type: 'Text', value: 'Cap' }],
                },
              ],
            },
            {
              type: 'Table',
              children: [
                {
                  type: 'TableRow',
                  children: [
                    {
                      type: 'TableCell',
                      header: true,
                      children: [{ type: 'Text', value: 'H' }],
                    },
                  ],
                },
              ],
            },
          ],
        }),
      ),
    ).toBe(
      '<table><caption><p class="paragraph">Cap</p></caption><tbody><tr><th>H</th></tr></tbody></table>',
    )
  })

  it('wraps a block image outside a figure in one', () => {
    expect(toHtml(doc({ type: 'Image', url: 'a.png', alt: 'A' }))).toBe(
      '<figure><img src="a.png" alt="A"></figure>',
    )
  })

  it('renders a cite outside a group as its own callout', () => {
    expect(
      toHtml(
        doc({ type: 'Paragraph', children: [{ type: 'Cite', xref: 'r1' }] }),
      ),
    ).toBe(
      '<p class="paragraph"><span class="callout" data-citationitems="[{&quot;id&quot;:&quot;r1&quot;}]"></span></p>',
    )
  })

  it('returns the title as a paragraph and data as metadata entries', () => {
    const source = new OxaImporter(ALL).fromOxa({
      type: 'Document',
      title: [
        { type: 'Text', value: 'A ' },
        { type: 'Emphasis', children: [{ type: 'Text', value: 'title' }] },
      ],
      children: [],
      data: {
        doi: '10.1000/xyz',
        authors: [{ firstName: 'Jane' }],
        abstract: [
          { type: 'Paragraph', children: [{ type: 'Text', value: 'Abs' }] },
        ],
        _body: { fundingStatement: 'Funded' },
        empty: [],
      },
    })

    expect(source).toEqual({
      body: '',
      title: '<p class="paragraph">A <em>title</em></p>',
      metadata: [
        { path: 'doi', value: '10.1000/xyz' },
        { path: 'authors', value: [{ firstName: 'Jane' }] },
        {
          path: 'abstract',
          value: '<p class="paragraph">Abs</p>',
          html: true,
        },
        { path: '_body.fundingStatement', value: 'Funded' },
        { path: 'empty', value: [] },
      ],
    })
  })

  it('reads inline arrays and single nodes in data as rich text', () => {
    expect(
      new OxaImporter(ALL).fromOxa({
        type: 'Document',
        children: [],
        data: {
          inlines: [
            { type: 'Text', value: 'A ' },
            { type: 'Strong', children: [{ type: 'Text', value: 'b' }] },
          ],
          block: {
            type: 'Paragraph',
            children: [{ type: 'Text', value: 'P' }],
          },
          inline: { type: 'Text', value: 'T' },
        },
      }).metadata,
    ).toEqual([
      {
        path: 'inlines',
        value: '<p class="paragraph">A <strong>b</strong></p>',
        html: true,
      },
      { path: 'block', value: '<p class="paragraph">P</p>', html: true },
      { path: 'inline', value: '<p class="paragraph">T</p>', html: true },
    ])
  })

  it('leaves data arrays that are not valid blocks as they are', () => {
    const invalid = [{ type: 'Paragraph' }]

    expect(
      new OxaImporter(ALL).fromOxa({
        type: 'Document',
        children: [],
        data: { invalid },
      }).metadata,
    ).toEqual([{ path: 'invalid', value: invalid }])
  })

  describe('inline images', () => {
    const image = (url: string): unknown => ({
      type: 'InlineImage',
      url,
      alt: url,
    })

    const text = (value: string): unknown => ({ type: 'Text', value })

    it('moves them into figures after their paragraph, in order', () => {
      expect(
        toHtml(
          doc(
            {
              type: 'Paragraph',
              children: [
                text('a '),
                image('1.png'),
                text(' b'),
                image('2.png'),
              ],
            },
            { type: 'Paragraph', children: [text('next')] },
          ),
        ),
      ).toBe(
        [
          '<p class="paragraph">a  b</p>',
          '<figure><img src="1.png" alt="1.png"></figure>',
          '<figure><img src="2.png" alt="2.png"></figure>',
          '<p class="paragraph">next</p>',
        ].join(''),
      )
    })

    it('drops a paragraph that only held images', () => {
      expect(
        toHtml(doc({ type: 'Paragraph', children: [image('1.png')] })),
      ).toBe('<figure><img src="1.png" alt="1.png"></figure>')
    })

    it('keeps the figure inside the section and moves it out of lists', () => {
      expect(
        toHtml(
          doc({
            type: 'Section',
            children: [
              {
                type: 'List',
                ordered: false,
                children: [
                  {
                    type: 'ListItem',
                    children: [
                      {
                        type: 'Paragraph',
                        children: [text('item '), image('1.png')],
                      },
                    ],
                  },
                ],
              },
            ],
          }),
        ),
      ).toBe(
        '<section><ul><li><p class="paragraph">item </p></li></ul><figure><img src="1.png" alt="1.png"></figure></section>',
      )
    })
  })

  describe('funding', () => {
    const paragraph = (value: string): unknown => ({
      type: 'Paragraph',
      children: [{ type: 'Text', value }],
    })

    const text = (value: string): unknown => ({ type: 'Text', value })

    const funding = {
      _body: {
        funding: [
          {
            source: [
              { type: 'Emphasis', children: [text('NSF')] },
              text(' grant'),
            ],
            awardId: [text('123')],
          },
          { awardId: [text('456')] },
          { source: [{ type: 'Paragraph' }] },
        ],
        fundingStatement: [[text('Funded by NSF.')], [text('And <others>.')]],
      },
    }

    const FUNDING_HTML = [
      '<p class="fundingsource"><em>NSF</em> grant</p>',
      '<p class="awardid">123</p>',
      '<p class="awardid">456</p>',
      '<p class="fundingstatement">Funded by NSF.</p>',
      '<p class="fundingstatement">And &lt;others&gt;.</p>',
    ].join('')

    it('puts funding before the references section', () => {
      expect(
        toHtml({
          ...(doc(paragraph('Body'), {
            type: 'Section',
            classes: ['references'],
            children: [paragraph('Ref')],
          }) as object),
          data: funding,
        }),
      ).toBe(
        `<p class="paragraph">Body</p>${FUNDING_HTML}<section class="reflist"><p class="paragraph">Ref</p></section>`,
      )
    })

    it('puts funding at the end without a references section', () => {
      expect(
        toHtml({ ...(doc(paragraph('Body')) as object), data: funding }),
      ).toBe(`<p class="paragraph">Body</p>${FUNDING_HTML}`)
    })

    it('round-trips funding paragraphs', () => {
      const source =
        '<p class="fundingsource"><em>NSF</em> <a href="https://nsf.gov">grant</a></p><p class="awardid">123</p><p class="fundingstatement">Thanks</p>'
      expect(toHtml(toOxa(source))).toBe(source)
    })

    it('ignores funding when experimental is off', () => {
      expect(
        new OxaImporter({ enableRFC: true, enableExperimental: false }).fromOxa(
          {
            ...(doc(paragraph('Body')) as OxaDocument),
            data: funding,
          },
        ).body,
      ).toBe('<p class="paragraph">Body</p>')
    })
  })

  it('rejects node types the schema does not know', () => {
    expect(() =>
      toHtml(
        doc({
          type: 'Paragraph',
          children: [
            { type: 'Mystery', children: [{ type: 'Text', value: 'x' }] },
          ],
        }),
      ),
    ).toThrow('Invalid OXA document')
  })

  it('rejects experimental node types when experimental is off', () => {
    const converter = new OxaImporter({
      enableRFC: true,
      enableExperimental: false,
    })

    expect(() =>
      converter.fromOxa(
        doc({
          type: 'Paragraph',
          children: [
            { type: 'Underline', children: [{ type: 'Text', value: 'x' }] },
          ],
        }) as OxaDocument,
      ),
    ).toThrow('Invalid OXA document')
  })
})
