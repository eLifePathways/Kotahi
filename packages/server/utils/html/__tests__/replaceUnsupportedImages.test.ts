import { describe, it, expect } from 'vitest'

import HtmlDocument from '../HtmlDocument'
import replaceUnsupportedImages from '../rules/replaceUnsupportedImages'

const clean = (html: string): string =>
  new HtmlDocument(html).apply(replaceUnsupportedImages).toHtml()

const BROKEN_IMAGE =
  '<img src="" alt="Broken image" data-original-name="broken-image">'

describe('replaceUnsupportedImages', () => {
  it('replaces EMF images with a broken image placeholder', () => {
    expect(clean('<img src="data:image/emf;base64,AAAA">')).toBe(BROKEN_IMAGE)
  })

  it('replaces WMF images, overwriting their alt text', () => {
    expect(clean('<img src="data:image/wmf;base64,AAAA" alt="Chart">')).toBe(
      BROKEN_IMAGE,
    )
  })

  it('leaves supported data URI images alone', () => {
    const html = '<img src="data:image/png;base64,AAAA">'
    expect(clean(html)).toBe(html)
  })

  it('leaves images with a URL alone', () => {
    const html = '<img src="https://example.org/figure.emf">'
    expect(clean(html)).toBe(html)
  })
})
