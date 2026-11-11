import { describe, it, expect } from 'vitest'
import { load } from 'cheerio'

import normalizeWhitespace from '../whitespace'

const normalize = (html: string): string => {
  const $ = load(html, { xml: { xmlMode: false } }, false)
  normalizeWhitespace($.root()[0].children)
  return $.html()
}

describe('normalizeWhitespace', () => {
  it('collapses whitespace runs and trims the start and end of a line', () => {
    expect(normalize('<p>  a \n\t b  </p>')).toBe('<p>a b</p>')
  })

  it('collapses non-breaking spaces like other whitespace', () => {
    expect(normalize('<p>a  b</p>')).toBe('<p>a b</p>')
  })

  it('drops a space that follows another space across inline tags', () => {
    expect(normalize('<p> a <strong> b </strong> c </p>')).toBe(
      '<p>a <strong>b </strong>c</p>',
    )
  })

  it('ends a line at a line break', () => {
    expect(normalize('<p>a <br> b</p>')).toBe('<p>a<br>b</p>')
  })

  it('treats each block as its own line', () => {
    expect(normalize('<section> one <p> two </p> three </section>')).toBe(
      '<section>one<p>two</p>three</section>',
    )
  })

  it('leaves preserved elements untouched', () => {
    expect(normalize('<pre>  a\n    b  </pre>')).toBe('<pre>  a\n    b  </pre>')

    expect(normalize('<math-display> x  ^ 2 </math-display>')).toBe(
      '<math-display> x  ^ 2 </math-display>',
    )
  })

  it('keeps spaces around inline content that is not text', () => {
    expect(normalize('<p>a <code> x </code> b</p>')).toBe(
      '<p>a <code> x </code> b</p>',
    )

    expect(normalize('<p>a <img src="x.png"> b</p>')).toBe(
      '<p>a <img src="x.png"> b</p>',
    )
  })

  it('still trims spaces at the edges of a line around inline content', () => {
    expect(normalize('<p> <img src="x.png"> </p>')).toBe(
      '<p><img src="x.png"></p>',
    )
  })

  it('normalizes footnotes separately from the surrounding text', () => {
    expect(normalize('<p>a<footnote>  note  </footnote> b</p>')).toBe(
      '<p>a<footnote>note</footnote> b</p>',
    )
  })

  it('ignores script and style content', () => {
    expect(normalize('<p>a</p><script>  x  </script>')).toBe(
      '<p>a</p><script>  x  </script>',
    )

    expect(normalize('<p>a</p><style>  p { }  </style>')).toBe(
      '<p>a</p><style>  p { }  </style>',
    )
  })
})
