import { describe, it, expect } from 'vitest'

import HtmlDocument from '../HtmlDocument'
import acceptTrackChanges from '../rules/acceptTrackChanges'

const clean = (html: string): string =>
  new HtmlDocument(html).apply(acceptTrackChanges).toHtml()

describe('acceptTrackChanges', () => {
  it('removes deletions', () => {
    expect(clean('<p>Hello <span class="deletion">old </span>world</p>')).toBe(
      '<p>Hello world</p>',
    )
  })

  it('keeps the content of insertions', () => {
    expect(clean('<p>Hello <span class="insertion">new </span>world</p>')).toBe(
      '<p>Hello new world</p>',
    )
  })

  it('keeps the formatting inside format changes', () => {
    expect(
      clean('<p><span class="format-change"><strong>Bold</strong></span></p>'),
    ).toBe('<p><strong>Bold</strong></p>')
  })

  it('unwraps nested tracked changes', () => {
    expect(
      clean(
        '<p><span class="insertion">A <span class="format-change"><em>B</em></span></span></p>',
      ),
    ).toBe('<p>A <em>B</em></p>')
  })

  it('removes deletions inside insertions', () => {
    expect(
      clean(
        '<p><span class="insertion">Keep<span class="deletion"> drop</span></span></p>',
      ),
    ).toBe('<p>Keep</p>')
  })

  it('leaves other spans alone', () => {
    const html = '<p><span class="comment">Note</span></p>'
    expect(clean(html)).toBe(html)
  })
})
