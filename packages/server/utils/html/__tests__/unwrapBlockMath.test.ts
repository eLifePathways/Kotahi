import { describe, it, expect } from 'vitest'

import HtmlDocument from '../HtmlDocument'
import unwrapBlockMath from '../rules/unwrapBlockMath'

const clean = (html: string): string =>
  new HtmlDocument(html).apply(unwrapBlockMath).toHtml()

describe('unwrapBlockMath', () => {
  it('replaces a paragraph holding block math with the math', () => {
    expect(clean('<p><math-display>x^2</math-display></p>')).toBe(
      '<math-display class="math-node">x^2</math-display>',
    )
  })

  it.each(['h2', 'h3', 'h4'])('does the same for %s headings', heading => {
    expect(
      clean(`<${heading}><math-display>x^2</math-display></${heading}>`),
    ).toBe('<math-display class="math-node">x^2</math-display>')
  })

  it('leaves block math that is not inside a paragraph or heading alone', () => {
    const html = '<math-display class="math-node">x^2</math-display>'
    expect(clean(html)).toBe(html)
  })

  it('leaves inline math alone', () => {
    const html = '<p>Where <math-inline>x</math-inline> is a number</p>'
    expect(clean(html)).toBe(html)
  })
})
