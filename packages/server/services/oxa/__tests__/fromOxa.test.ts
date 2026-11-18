import { describe, it, expect } from 'vitest'

import OxaConverter from '../OxaConverter'
import type { OxaDocument } from '../oxa.types'

const fileUrl = (file: { id: string }): string => `https://files/${file.id}`

const ALL = { enableRFC: true, enableExperimental: true, fileUrl }

const toOxa = (source: string): OxaDocument =>
  new OxaConverter(ALL).toOxa({ body: source })

const toHtml = (document: unknown): string =>
  new OxaConverter(ALL).fromOxa(document as OxaDocument)

const doc = (...children: unknown[]): unknown => ({
  type: 'Document',
  children,
})

describe('OxaConverter.fromOxa', () => {
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
      '<p class="paragraph">icon <img src="i.png" alt="i"> inline</p>',
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
    const converter = new OxaConverter({ enableRFC: true, fileUrl })

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
