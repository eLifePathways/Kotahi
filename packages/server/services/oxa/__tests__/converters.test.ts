import { describe, it, expect } from 'vitest'

import type Manuscript from '../../../models/manuscript/manuscript.model'
import OxaConverter, { type OxaConverterOptions } from '../OxaConverter'
import type { OxaDocument } from '../oxa.types'

const RFC: OxaConverterOptions = { enableRFC: true }
const EXPERIMENTAL: OxaConverterOptions = { enableExperimental: true }
const ALL: OxaConverterOptions = { enableRFC: true, enableExperimental: true }

const convert = (
  source: string,
  options: OxaConverterOptions = {},
  extra: Record<string, unknown> = {},
): OxaDocument =>
  new OxaConverter(
    { meta: { source }, submission: {}, ...extra } as unknown as Manuscript,
    options,
  ).convert()

const body = (
  source: string,
  options: OxaConverterOptions = {},
): OxaDocument['children'] => convert(source, options).children

const text = (value: string): Record<string, unknown> => ({
  type: 'Text',
  value,
})

const paragraph = (...children: unknown[]): Record<string, unknown> => ({
  type: 'Paragraph',
  children,
})

describe('standard converters', () => {
  describe('paragraph', () => {
    it('keeps id and classes, minus the editor paragraph class', () => {
      expect(body('<p class="paragraph intro" id="p1">a</p>')).toEqual([
        {
          type: 'Paragraph',
          id: 'p1',
          classes: ['intro'],
          children: [text('a')],
        },
      ])
    })

    it('drops empty paragraphs', () => {
      expect(body('<p class="paragraph">  </p><p></p>')).toEqual([])
    })
  })

  describe('heading', () => {
    it('converts all six levels', () => {
      const headings = [1, 2, 3, 4, 5, 6]
        .map(level => `<h${level}>H${level}</h${level}>`)
        .join('')

      expect(body(headings)).toEqual(
        [1, 2, 3, 4, 5, 6].map(level => ({
          type: 'Heading',
          level,
          children: [text(`H${level}`)],
        })),
      )
    })

    it('drops empty headings', () => {
      expect(body('<h1></h1>')).toEqual([])
    })
  })

  describe('inline marks', () => {
    it.each([
      ['strong', 'Strong'],
      ['b', 'Strong'],
      ['em', 'Emphasis'],
      ['i', 'Emphasis'],
      ['sub', 'Subscript'],
      ['sup', 'Superscript'],
    ])('converts <%s> to %s', (tag, type) => {
      expect(body(`<p>a <${tag}>b</${tag}></p>`)).toEqual([
        paragraph(text('a '), { type, children: [text('b')] }),
      ])
    })

    it('drops empty marks and merges the text around them', () => {
      expect(body('<p>a<strong></strong>b</p>')).toEqual([
        paragraph(text('ab')),
      ])
    })
  })

  describe('text', () => {
    it('merges adjacent text from unwrapped elements', () => {
      expect(body('<p><span class="insertion">kept</span> text</p>')).toEqual([
        paragraph(text('kept text')),
      ])
    })

    it('ignores comments', () => {
      expect(body('<p>a<!-- comment -->b</p>')).toEqual([paragraph(text('ab'))])
    })

    it('wraps loose inline content at the root in paragraphs', () => {
      expect(body('loose <strong>bold</strong><p>block</p>tail')).toEqual([
        paragraph(text('loose '), { type: 'Strong', children: [text('bold')] }),
        paragraph(text('block')),
        paragraph(text('tail')),
      ])
    })
  })

  describe('code', () => {
    it('converts code blocks with their language', () => {
      expect(
        body('<pre data-language="js"><code>const a = 1\n  a++</code></pre>'),
      ).toEqual([{ type: 'Code', value: 'const a = 1\n  a++', language: 'js' }])
    })

    it('converts inline code with its language', () => {
      expect(
        body('<p>run <code data-language="sh">ls  -la</code></p>'),
      ).toEqual([
        paragraph(text('run '), {
          type: 'InlineCode',
          value: 'ls  -la',
          language: 'sh',
        }),
      ])
    })
  })

  it('converts thematic breaks', () => {
    expect(body('<p>a</p><hr><p>b</p>')).toEqual([
      paragraph(text('a')),
      { type: 'ThematicBreak' },
      paragraph(text('b')),
    ])
  })

  describe('removed', () => {
    it('drops scripts, styles and tracked deletions with their content', () => {
      expect(
        body(
          '<p>keep<span class="deletion">gone</span></p><script>x</script><style>p{}</style>',
        ),
      ).toEqual([paragraph(text('keep'))])
    })

    it('does not collect footnotes inside deletions', () => {
      expect(
        body(
          '<p>a<span class="deletion">b<footnote id="f1">note</footnote></span></p>',
        ),
      ).toEqual([paragraph(text('a'))])
    })
  })

  describe('citation callout', () => {
    const callout = (items: string, label = '[1, 2]'): string =>
      `<p>see <span class="callout" data-citationitems='${items}'>${label}</span></p>`

    it('converts a callout to a group of cites', () => {
      expect(body(callout('[{"id":"r1"},{"id":"r2"}]'))).toEqual([
        paragraph(text('see '), {
          type: 'CiteGroup',
          kind: 'parenthetical',
          children: [
            { type: 'Cite', xref: 'r1' },
            { type: 'Cite', xref: 'r2' },
          ],
          data: { calloutText: '[1, 2]' },
        }),
      ])
    })

    it('unwraps callouts without citation items', () => {
      expect(body(callout('[]', 'plain'))).toEqual([
        paragraph(text('see plain')),
      ])
    })

    it('throws on malformed citation items', () => {
      expect(() => body(callout('not json'))).toThrow(SyntaxError)
    })
  })

  describe('reference', () => {
    it('converts a structured reference', () => {
      expect(
        body(
          `<p class="ref" id="r1" data-structure='{"title":"T","type":"book"}'>Ref</p>`,
        ),
      ).toEqual([
        {
          type: 'Reference',
          id: 'r1',
          csl: { title: 'T', type: 'book', id: 'r1' },
          children: [text('Ref')],
        },
      ])
    })

    it('defaults unstructured references to a generic document', () => {
      expect(
        body(`<p class="ref" id="r1" data-structure='"{}"'>Ref</p>`),
      ).toEqual([
        {
          type: 'Reference',
          id: 'r1',
          csl: { id: 'r1', type: 'document' },
          children: [text('Ref')],
        },
      ])
    })

    it('numbers references without an id', () => {
      expect(body('<p class="ref">A</p><p class="ref">B</p>')).toMatchObject([
        { id: 'ref-1' },
        { id: 'ref-2' },
      ])
    })

    it('throws on a malformed structure', () => {
      expect(() =>
        body(`<p class="ref" data-structure="not json">Ref</p>`),
      ).toThrow(SyntaxError)
    })

    it('adds the identifier and citation key when RFC is on', () => {
      expect(body('<p class="ref" id="r1">Ref</p>', RFC)).toMatchObject([
        { identifier: 'r1', csl: { 'citation-key': 'r1' } },
      ])

      expect(
        body(
          `<p class="ref" id="r1" data-structure='{"citation-key":"doe2020"}'>Ref</p>`,
          RFC,
        ),
      ).toMatchObject([
        { identifier: 'doe2020', csl: { 'citation-key': 'doe2020' } },
      ])
    })
  })
})

describe('RFC converters', () => {
  const files = [
    {
      id: 'f1',
      storedObjects: [{ type: 'original', mimetype: 'image/png' }],
    },
  ]

  const figure = '<figure><img src="a.png" alt="Alt" data-fileid="f1"></figure>'

  it('converts block images with their encoding format', () => {
    expect(convert(figure, RFC, { files }).children).toEqual([
      { type: 'Image', url: 'a.png', alt: 'Alt', encodingFormat: 'image/png' },
    ])
  })

  it('converts inline images', () => {
    expect(body('<p>icon <img src="i.png" alt="i"> here</p>', RFC)).toEqual([
      paragraph(
        text('icon '),
        { type: 'InlineImage', url: 'i.png', alt: 'i' },
        text(' here'),
      ),
    ])
  })

  it('drops images without a source', () => {
    expect(body('<figure><img alt="Alt"></figure>', RFC)).toEqual([])
  })

  it('falls back to alt text when RFC is off', () => {
    expect(body(figure)).toEqual([paragraph(text('Alt'))])

    expect(body('<p>icon <img src="i.png" alt=" i "> here</p>')).toEqual([
      paragraph(text('icon i here')),
    ])
  })

  it('drops images without alt text when RFC is off', () => {
    expect(body('<figure><img src="a.png"></figure>')).toEqual([])
  })
})

describe('experimental converters', () => {
  describe('inline marks', () => {
    it.each([
      ['<u>b</u>', 'Underline'],
      ['<span class="small-caps">b</span>', 'SmallCaps'],
      ['<s>b</s>', 'Strikethrough'],
      ['<span class="strikethrough">b</span>', 'Strikethrough'],
    ])('converts %s to %s', (html, type) => {
      expect(body(`<p>a ${html}</p>`, EXPERIMENTAL)).toEqual([
        paragraph(text('a '), { type, children: [text('b')] }),
      ])
    })

    it.each([
      '<u>b</u>',
      '<span class="small-caps">b</span>',
      '<s>b</s>',
      '<span class="strikethrough">b</span>',
    ])('falls back to plain text for %s', html => {
      expect(body(`<p>a ${html}</p>`)).toEqual([paragraph(text('a b'))])
    })

    it('unwraps highlights', () => {
      expect(body('<p>a <span class="highlight">b</span></p>', ALL)).toEqual([
        paragraph(text('a b')),
      ])
    })
  })

  describe('link', () => {
    const link = '<p><a href="https://example.com" title="Example">site</a></p>'

    it('converts links with their title', () => {
      expect(body(link, EXPERIMENTAL)).toEqual([
        paragraph({
          type: 'Link',
          url: 'https://example.com',
          title: 'Example',
          children: [text('site')],
        }),
      ])
    })

    it('falls back to the link text', () => {
      expect(body(link)).toEqual([paragraph(text('site'))])
    })

    it('unwraps anchors without a href and drops empty links', () => {
      expect(body('<p><a>x</a><a href="y"></a></p>', EXPERIMENTAL)).toEqual([
        paragraph(text('x')),
      ])
    })
  })

  describe('list', () => {
    it('converts ordered lists with a start number', () => {
      expect(
        body('<ol start="3"><li><p>a</p></li><li>b</li></ol>', EXPERIMENTAL),
      ).toEqual([
        {
          type: 'List',
          ordered: true,
          start: 3,
          children: [
            { type: 'ListItem', children: [paragraph(text('a'))] },
            { type: 'ListItem', children: [text('b')] },
          ],
        },
      ])
    })

    it('omits the start number when it is 1', () => {
      expect(
        body('<ul><li>a</li></ul><ol><li>b</li></ol>', EXPERIMENTAL),
      ).toEqual([
        {
          type: 'List',
          ordered: false,
          children: [{ type: 'ListItem', children: [text('a')] }],
        },
        {
          type: 'List',
          ordered: true,
          children: [{ type: 'ListItem', children: [text('b')] }],
        },
      ])
    })

    it('keeps empty list items', () => {
      expect(body('<ul><li></li></ul>', EXPERIMENTAL)).toEqual([
        {
          type: 'List',
          ordered: false,
          children: [{ type: 'ListItem', children: [] }],
        },
      ])
    })

    it('falls back to paragraphs with text markers', () => {
      expect(
        body('<ul><li>a</li></ul><ol start="3"><li>b</li><li>c</li></ol>'),
      ).toEqual([
        paragraph(text('• a')),
        paragraph(text('3. b')),
        paragraph(text('4. c')),
      ])
    })

    it('flattens nested lists in the fallback', () => {
      expect(body('<ul><li>a<ul><li>b</li></ul></li></ul>')).toEqual([
        paragraph(text('• a')),
        paragraph(text('• b')),
      ])
    })

    it('puts the marker in its own paragraph when an item starts with a block', () => {
      expect(body('<ul><li><pre>code</pre></li></ul>')).toEqual([
        paragraph(text('• ')),
        { type: 'Code', value: 'code' },
      ])
    })
  })

  describe('table', () => {
    const table =
      '<table><tbody><tr><th>H1</th><th>H2</th></tr><tr><td colspan="2" rowspan="3">a</td></tr></tbody></table>'

    it('converts tables, rows and cells', () => {
      expect(body(table, EXPERIMENTAL)).toEqual([
        {
          type: 'Table',
          children: [
            {
              type: 'TableRow',
              children: [
                { type: 'TableCell', header: true, children: [text('H1')] },
                { type: 'TableCell', header: true, children: [text('H2')] },
              ],
            },
            {
              type: 'TableRow',
              children: [
                {
                  type: 'TableCell',
                  colspan: 2,
                  rowspan: 3,
                  children: [text('a')],
                },
              ],
            },
          ],
        },
      ])
    })

    it('marks cells in a table head as header cells', () => {
      expect(
        body('<table><thead><tr><td>H</td></tr></thead></table>', EXPERIMENTAL),
      ).toMatchObject([
        { children: [{ children: [{ type: 'TableCell', header: true }] }] },
      ])
    })

    it('wraps a table and its caption in a figure', () => {
      expect(
        body(
          '<table><caption><p>Cap</p></caption><tbody><tr><td>a</td></tr></tbody></table>',
          EXPERIMENTAL,
        ),
      ).toEqual([
        {
          type: 'Figure',
          children: [
            { type: 'Caption', children: [paragraph(text('Cap'))] },
            {
              type: 'Table',
              children: [
                {
                  type: 'TableRow',
                  children: [{ type: 'TableCell', children: [text('a')] }],
                },
              ],
            },
          ],
        },
      ])
    })

    it('drops tables without rows', () => {
      expect(
        body(
          '<table><caption><p>Cap</p></caption><tbody><tr></tr></tbody></table>',
          EXPERIMENTAL,
        ),
      ).toEqual([])
    })

    it('falls back to one paragraph per row', () => {
      expect(
        body(
          `<table><caption><p>Cap</p></caption><tbody><tr><td><p>a</p><p>b</p></td><td>c</td></tr></tbody></table>`,
        ),
      ).toEqual([paragraph(text('Cap')), paragraph(text('a b | c'))])
    })
  })

  describe('figure', () => {
    const figure =
      '<figure><img src="a.png" alt="Alt"><figcaption>Cap</figcaption></figure>'

    it('converts figures with images and captions', () => {
      expect(body(figure, ALL)).toEqual([
        {
          type: 'Figure',
          children: [
            { type: 'Image', url: 'a.png', alt: 'Alt' },
            { type: 'Caption', children: [text('Cap')] },
          ],
        },
      ])
    })

    it('falls back to the image and caption text', () => {
      expect(body(figure, RFC)).toEqual([
        { type: 'Image', url: 'a.png', alt: 'Alt' },
        paragraph(text('Cap')),
      ])
    })
  })

  describe('footnote', () => {
    const note =
      '<p>Text<footnote id="f1">Note <em>here</em></footnote> more<footnote id="f2">Two</footnote></p>'

    it('converts footnotes inline', () => {
      expect(body(note, EXPERIMENTAL)).toEqual([
        paragraph(
          text('Text'),
          {
            type: 'Footnote',
            id: 'f1',
            children: [
              text('Note '),
              { type: 'Emphasis', children: [text('here')] },
            ],
          },
          text(' more'),
          { type: 'Footnote', id: 'f2', children: [text('Two')] },
        ),
      ])
    })

    it('falls back to numbered notes at the end of the document', () => {
      expect(body(note)).toEqual([
        paragraph(
          text('Text'),
          { type: 'Superscript', children: [text('1')] },
          text(' more'),
          { type: 'Superscript', children: [text('2')] },
        ),
        { type: 'ThematicBreak' },
        paragraph(text('1. Note '), {
          type: 'Emphasis',
          children: [text('here')],
        }),
        paragraph(text('2. Two')),
      ])
    })

    it('drops empty footnotes without using up a number', () => {
      expect(
        body(
          '<p>a<footnote id="f1"></footnote>b<footnote id="f2">Note</footnote></p>',
        ),
      ).toEqual([
        paragraph(text('ab'), { type: 'Superscript', children: [text('1')] }),
        { type: 'ThematicBreak' },
        paragraph(text('1. Note')),
      ])
    })

    it('restarts numbering on every conversion', () => {
      const converter = new OxaConverter({
        meta: { source: note },
        submission: {},
      } as unknown as Manuscript)

      expect(converter.convert()).toEqual(converter.convert())
    })
  })

  describe('math', () => {
    const math =
      '<math-display>x^2</math-display><p>so <math-inline>a  +b</math-inline></p>'

    it('converts display and inline math', () => {
      expect(body(math, EXPERIMENTAL)).toEqual([
        { type: 'Math', value: 'x^2' },
        paragraph(text('so '), { type: 'InlineMath', value: 'a  +b' }),
      ])
    })

    it('falls back to LaTeX code', () => {
      expect(body(math)).toEqual([
        { type: 'Code', language: 'latex', value: 'x^2' },
        paragraph(text('so '), {
          type: 'InlineCode',
          language: 'latex',
          value: 'a  +b',
        }),
      ])
    })
  })

  describe('line break', () => {
    it('converts line breaks', () => {
      expect(body('<p>a <br> b</p>', EXPERIMENTAL)).toEqual([
        paragraph(text('a'), { type: 'Break' }, text('b')),
      ])
    })

    it('falls back to a newline', () => {
      expect(body('<p>a<br>b</p>')).toEqual([paragraph(text('a\nb'))])
    })
  })

  describe('section', () => {
    const section =
      '<section class="abstractSection custom" id="s1"><p>A</p></section>'

    it('converts sections and maps known kinds', () => {
      expect(body(section, EXPERIMENTAL)).toEqual([
        {
          type: 'Section',
          id: 's1',
          classes: ['abstract', 'custom'],
          children: [paragraph(text('A'))],
        },
      ])
    })

    it('drops empty sections', () => {
      expect(
        body('<section class="glossary"></section>', EXPERIMENTAL),
      ).toEqual([])
    })

    it('falls back to its content', () => {
      expect(body(section)).toEqual([paragraph(text('A'))])
    })
  })

  describe('block quote', () => {
    const quote = '<blockquote><p>Q</p></blockquote>'

    it('converts block quotes', () => {
      expect(body(quote, EXPERIMENTAL)).toEqual([
        { type: 'BlockQuote', children: [paragraph(text('Q'))] },
      ])
    })

    it('falls back to its content', () => {
      expect(body(quote)).toEqual([paragraph(text('Q'))])
    })
  })

  describe('funding', () => {
    const funding = [
      '<p class="fundingsource">NSF</p>',
      '<p class="awardid">123</p>',
      '<p class="awardid">456</p>',
      '<p class="fundingstatement">Funded by NSF.</p>',
      '<p>Body</p>',
    ].join('')

    it('moves funding paragraphs into metadata', () => {
      const document = convert(funding, EXPERIMENTAL)

      expect(document.children).toEqual([paragraph(text('Body'))])

      expect(document.metadata).toMatchObject({
        funding: [
          { source: 'NSF', awardId: '123' },
          { source: '', awardId: '456' },
        ],
        fundingStatement: 'Funded by NSF.',
      })
    })

    it('falls back to paragraphs', () => {
      expect(body(funding)).toEqual([
        {
          type: 'Paragraph',
          classes: ['fundingsource'],
          children: [text('NSF')],
        },
        { type: 'Paragraph', classes: ['awardid'], children: [text('123')] },
        { type: 'Paragraph', classes: ['awardid'], children: [text('456')] },
        {
          type: 'Paragraph',
          classes: ['fundingstatement'],
          children: [text('Funded by NSF.')],
        },
        paragraph(text('Body')),
      ])
    })
  })
})
