import { describe, it, expect } from 'vitest'
import { htmlToJats } from '../jatsUtils'

describe('htmlToJats', () => {
  it('converts', () => {
    expect(
      htmlToJats(`
      <p class="paragraph">
      Abstract containing <strong>bold</strong>, <em>italic</em>, <u>underline</u>,
      <span class="small-caps">smallcaps</span>, <sup>superscript</sup><sub>subscript</sub>
      </p>`),
    ).toEqual(`
      <p>
      Abstract containing <bold>bold</bold>, <italic>italic</italic>, <underline>underline</underline>,
      <sc>smallcaps</sc>, <sup>superscript</sup><sub>subscript</sub>
      </p>`)
  })

  it('inserts sections', () => {
    expect(
      htmlToJats(`
        <h1>H1</h1>
        <h2>H2</h2>
        <h3>H3</h3>
        <h5>H5</h5>
        <h4>H4</h4>
        <h3>H3</h3>
        <h4>H4</h4>
        <h2>H2</h2>`),
    ).toEqual(`
        <sec><title>H1</title>
        <sec><title>H2</title>
        <sec><title>H3</title>
        <sec><title>H5</title>
        </sec><sec><title>H4</title>
        </sec></sec><sec><title>H3</title>
        <sec><title>H4</title>
        </sec></sec></sec><sec><title>H2</title></sec></sec>`)
  })

  it('converts links', () => {
    expect(
      htmlToJats(`
      <a href="https://a.com" foo="bar">A</a>
      <a href="http://b.com">B</a>
      <a href="ftp://c.com:8080/123?x=y&z=w#ref1">C</a>
      <a href="#ref1">D</a>
      <a href="mailto:x@y.com">E</a>
      <a href="" download="resource.png">F</a>
      `),
    ).toEqual(`
      <ext-link ext-link-type="uri" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://a.com">A</ext-link>
      <ext-link ext-link-type="uri" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="http://b.com">B</ext-link>
      <ext-link ext-link-type="uri" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="ftp://c.com:8080/123?x=y&#x26;z=w#ref1">C</ext-link>
      D
      E
      F
      `)
  })

  it('preserves the three legal control characters (tab, LF, CR) and space', () => {
    const input = 'A\x09\x0A\x0D\x20B'
    expect(htmlToJats(input)).toEqual(input)
  })

  it('strips illegal characters', () => {
    expect(htmlToJats('A\x08B')).toEqual('AB')
    expect(htmlToJats('A\x0CB')).toEqual('AB')
    expect(htmlToJats('A\x0EB')).toEqual('AB')
    expect(htmlToJats('A\x1FB')).toEqual('AB')
  })

  it('strips DEL and the C1 control block', () => {
    expect(htmlToJats('A\x7FB')).toEqual('AB')
    expect(htmlToJats('A\x80B')).toEqual('AB')
    expect(htmlToJats('A\x9FB')).toEqual('AB')
  })

  it('converts an astral (non-BMP) character to a numeric entity', () => {
    expect(htmlToJats('A😉B')).toEqual('A&#x1F609;B')
  })

  it('strips lone (unpaired) surrogates', () => {
    expect(htmlToJats('A\uD800B')).toEqual('AB')
    expect(htmlToJats('A\uDC00B')).toEqual('AB')
  })

  it('strips noncharacters', () => {
    expect(htmlToJats('A\uFFFEB')).toEqual('AB')
  })

  it('wraps stray text in p tags', () => {
    const input = `<h2>My section</h2>Some stray text<p>Text</p>`
    const output = `<sec><title>My section</title><p>Some stray text</p><p>Text</p></sec>`

    expect(htmlToJats(input)).toEqual(output)
  })

  it('wraps stray text caused by dropped tags in p tags', () => {
    const input =
      '<h2>My section</h2><span class="footnote-marker">1</span><p>Text</p>'
    const output = `<sec><title>My section</title><p>1</p><p>Text</p></sec>`

    expect(htmlToJats(input)).toEqual(output)
  })

  it('handles html entities', () => {
    expect(htmlToJats('&lt;')).toEqual('&#x3C;')
    expect(htmlToJats('&gt;')).toEqual('&#x3E;')
    expect(htmlToJats('&')).toEqual('&#x26;')
    expect(htmlToJats('&amp;')).toEqual('&#x26;') // ampersand
    expect(htmlToJats('&nbsp;')).toEqual('&#xA0;') // non-breaking space
    expect(htmlToJats('&#8212;')).toEqual('&#x2014;') // em dash
    expect(htmlToJats('&#8211;')).toEqual('&#x2013;') // en dash
    expect(htmlToJats('&#169;')).toEqual('&#xA9;') // copyright
    expect(htmlToJats('€')).toEqual('&#x20AC;')
    expect(htmlToJats('&#8203;')).toEqual('&#x200B;') // zero width space
    expect(htmlToJats('&ZeroWidthSpace;')).toEqual('&#x200B;')
    expect(htmlToJats('&shy;')).toEqual('&#xAD;')
  })

  it('handles greek letters and symbols', () => {
    expect(htmlToJats('&alpha;')).toEqual('&#x3B1;')
    expect(htmlToJats('&beta;')).toEqual('&#x3B2;')
    expect(htmlToJats('&pi;')).toEqual('&#x3C0;')
    expect(htmlToJats('&sum;')).toEqual('&#x2211;')
    expect(htmlToJats('&infin;')).toEqual('&#x221E;')
    expect(htmlToJats('&times;')).toEqual('&#xD7;')
    expect(htmlToJats('&deg;')).toEqual('&#xB0;')
  })

  it('handles slashes', () => {
    expect(htmlToJats('some /text')).toEqual('some /text')
    expect(htmlToJats('some \text')).toEqual('some \text')
  })

  it('handles quotation', () => {
    expect(htmlToJats(`some 'text'`)).toEqual(`some &#x27;text&#x27;`)
    expect(htmlToJats(`some &apos;text&apos;`)).toEqual(`some &#x27;text&#x27;`)
    expect(htmlToJats(`some "text"`)).toEqual(`some &#x22;text&#x22;`)
    expect(htmlToJats(`some &quot;text&quot;`)).toEqual(`some &#x22;text&#x22;`)
  })

  it('handles gt and lt symbols', () => {
    expect(htmlToJats(`<`)).toEqual(`&#x3C;`)
    expect(htmlToJats(`>`)).toEqual(`&#x3E;`)
    expect(htmlToJats(`< hello`)).toEqual(`&#x3C; hello`)
    expect(htmlToJats(`hello <`)).toEqual(`hello &#x3C;`)

    // This (unescaped, no space between symbol and next word) would FAIL,
    // as it would be interpreted as a tag. The correct solution would be
    // to escape it at the source (eg. wax).
    // expect(htmlToJats(`<hello`)).toThrow()
  })

  it('handles italic', () => {
    expect(htmlToJats('<i>test</i>')).toEqual('<italic>test</italic>')
    expect(htmlToJats('<em>test</em>')).toEqual('<italic>test</italic>')

    // italic in a table cell
    expect(
      htmlToJats('<table><tbody><tr><td><i>test</i></td></tr></tbody></table>'),
    ).toEqual(
      '<table><tbody><tr><td><italic>test</italic></td></tr></tbody></table>',
    )
  })
})
