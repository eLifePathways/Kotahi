import { describe, it, expect } from 'vitest'

import HtmlDocument from '../HtmlDocument'
import wrapLooseContent from '../rules/wrapLooseContent'

const clean = (html: string): string =>
  new HtmlDocument(html).apply(wrapLooseContent).toHtml()

describe('wrapLooseContent', () => {
  it('wraps loose text in a paragraph', () => {
    expect(clean('Some text<p>A paragraph</p>')).toBe(
      '<p>Some text</p><p>A paragraph</p>',
    )
  })

  it('leaves whitespace between blocks alone', () => {
    expect(clean('<p>One</p>\n<p>Two</p>')).toBe('<p>One</p>\n<p>Two</p>')
  })

  it('wraps loose links in a paragraph', () => {
    expect(clean('<a href="https://example.org">A link</a><p>Text</p>')).toBe(
      '<p><a href="https://example.org">A link</a></p><p>Text</p>',
    )
  })

  it('wraps loose images in a figure', () => {
    expect(clean('<p>Before</p><img src="a.png"><p>After</p>')).toBe(
      '<p>Before</p><figure><img src="a.png"></figure><p>After</p>',
    )
  })

  it('adds an empty paragraph after an image at the end of the document', () => {
    expect(clean('<p>Before</p><img src="a.png">')).toBe(
      '<p>Before</p><figure><img src="a.png"></figure><p></p>',
    )
  })

  it('leaves content that is already inside a block alone', () => {
    const html = '<p>Text <a href="#">a link</a> <img src="a.png"></p>'
    expect(clean(html)).toBe(html)
  })
})
