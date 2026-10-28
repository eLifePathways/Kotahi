import { describe, it, expect } from 'vitest'

import HtmlDocument from '../HtmlDocument'
import splitFiguresOutOfBlocks from '../rules/splitFiguresOutOfBlocks'

const clean = (html: string): string =>
  new HtmlDocument(html).apply(splitFiguresOutOfBlocks).toHtml()

const FIGURE = '<figure><img src="a.png"></figure>'

describe('splitFiguresOutOfBlocks', () => {
  it('splits a heading around a figure', () => {
    expect(clean(`<h2>Before${FIGURE}After</h2>`)).toBe(
      `<h2>Before</h2>${FIGURE}<h2>After</h2>`,
    )
  })

  it("keeps the block's attributes on each part", () => {
    expect(clean(`<h3 class="title">Before${FIGURE}After</h3>`)).toBe(
      `<h3 class="title">Before</h3>${FIGURE}<h3 class="title">After</h3>`,
    )
  })

  it('keeps inline elements in the parts', () => {
    expect(clean(`<h2><em>Before</em>${FIGURE}</h2>`)).toBe(
      `<h2><em>Before</em></h2>${FIGURE}`,
    )
  })

  it('drops parts that are empty or only whitespace', () => {
    expect(clean(`<h2> ${FIGURE} </h2>`)).toBe(FIGURE)
  })

  it('splits around several figures', () => {
    expect(clean(`<h2>A${FIGURE}B${FIGURE}C</h2>`)).toBe(
      `<h2>A</h2>${FIGURE}<h2>B</h2>${FIGURE}<h2>C</h2>`,
    )
  })

  it('leaves blocks without figures alone', () => {
    const html = '<h2>Title</h2><p>Text</p>'
    expect(clean(html)).toBe(html)
  })
})
