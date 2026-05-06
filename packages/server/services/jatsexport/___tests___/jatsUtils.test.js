/* eslint-disable */

const { htmlToJats } = require('../jatsUtils')

describe('htmlToJats', () => {
  test('illegalChars', () => {
    expect(htmlToJats('ABC😉\x00\r\n\x0B\x9FXYZ')).toEqual(
      'ABC&#x1F609;\r\nXYZ',
    )
  })
  test('insertSections', () => {
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
  test('convertLinks', () => {
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
  test('generalConversion', () => {
    expect(
      htmlToJats(`
<p class="paragraph">
Abstract containing <strong>bold</strong>, <em>italic</em>, <u>underline</u>,
<span class="small-caps">smallcaps</span>, <sup>superscript</sup><sub>subscript</sub>
</p>
    `),
    ).toEqual(`
<p>
Abstract containing <bold>bold</bold>, <italic>italic</italic>, <underline>underline</underline>,
<sc>smallcaps</sc>, <sup>superscript</sup><sub>subscript</sub>
</p>
    `)
  })
})
