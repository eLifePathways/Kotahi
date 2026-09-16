const htmlparser2 = require('htmlparser2')
const cheerio = require('cheerio')

const {
  convertTagsAndRemoveTags,
  convertCharacterEntities,
  removeIllegalCharacters,
} = require('../../utils/htmlUtils')

const sectionRegexes = [
  /<h1>((?:(?!<\/h1>)[\s\S])*)<\/h1>((?:(?!<h1>)[\s\S])*)/g,
  /<h2>((?:(?!<\/h2>)[\s\S])*)<\/h2>((?:(?!<h[12]>|<sec>)[\s\S])*)/g,
  /<h3>((?:(?!<\/h3>)[\s\S])*)<\/h3>((?:(?!<h[1-3]>|<sec>)[\s\S])*)/g,
  /<h4>((?:(?!<\/h4>)[\s\S])*)<\/h4>((?:(?!<h[1-4]>|<sec>)[\s\S])*)/g,
  /<h5>((?:(?!<\/h5>)[\s\S])*)<\/h5>((?:(?!<h[1-5]>|<sec>)[\s\S])*)/g,
  /<h6>((?:(?!<\/h6>)[\s\S])*)<\/h6>((?:(?!<h[1-6]>|<sec>)[\s\S])*)/g,
]

const insertSections = markup => {
  let result = markup
  // TODO: we need to run html to JATS on what's inside the title tag!
  sectionRegexes.forEach(regex => {
    result = result.replace(regex, '<sec><title>$1</title>$2</sec>')
  })
  const firstTitleContent = /<title>((?:(?!<\/title>)[\s\S])*)<\/title>/

  if (result.match(firstTitleContent)) {
    const replacementTitle = convertRemainingTags(
      result.match(firstTitleContent)[1],
    )

    result = result.replace(
      firstTitleContent,
      `<title>${replacementTitle}</title>`,
    )
  }

  return result
}

const convertImages = html => {
  // Note that this will destroy any non-HTML tags that happen before this!
  const dom = htmlparser2.parseDocument(html, { xmlMode: true })

  const $ = cheerio.load(dom, {
    xmlMode: true,
  })

  $('figure').replaceWith((index, el) => {
    const caption = $(el).find('figcaption').html() // this comes back null if not found
    const graphicElement = $(el).find('img')
    const graphicSrc = graphicElement.attr('src')
    const graphicId = graphicElement.attr('data-fileid')
    // 1 get caption if there is one
    // 2 get image if there is one
    // 3 change image tag
    // 4 change images attribute
    // 5 change figure tags
    // 6. clear out all content
    // 7. add caption if there is one
    // 8. add image
    const outCaption = caption ? `<caption><p>${caption}</p></caption>` : ''
    const outGraphic = `<graphic xlink:href="${graphicSrc}" id="graphic_${graphicId}" />`
    const output = `<fig>${outCaption}${outGraphic}</fig>`
    return output
  })

  const output = $.html()

  return output
}

/** Replace <a href="..."> with <ext-link ...> ONLY IF the target starts with 'http://', 'https://' or 'ftp://'.
 * For other targets such as '#ref1' or 'mailto:a@b.com', just strip the <a> tags off leaving the inner content.
 */
const convertLinks = markup => {
  return markup
    .replace(
      /<a href="((?:https?|ftp):\/\/[^"\s]+)"[^>]*>((?:(?!<\/a>)[\s\S])+)<\/a>/g,
      '<ext-link ext-link-type="uri" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="$1">$2</ext-link>',
    )
    .replace(/<a\b[^>]*>((?:(?!<\/a>)[\s\S])+)<\/a>/g, '$1')
}

const convertLists = markup => {
  return markup
    .replace(/<ol>/g, '<list list-type="order">')
    .replace(/<ul>/g, '<list list-type="bullet">')
    .replace(/<\/[ou]l>/g, '</list>')
}

const wrapStrayTextInParagraphs = markup => {
  const dom = htmlparser2.parseDocument(markup, { xmlMode: true })
  const $ = cheerio.load(dom, { xmlMode: true })

  $('sec')
    .contents()
    .filter((index, node) => node.type === 'text' && node.data.trim() !== '')
    .wrap('<p></p>')

  return $.html()
}

const convertSmallCaps = markup => {
  // TODO This regex approach is unsafe with nested spans.
  // Currently this is the only type of span emitted by the SimpleWaxEditor, so should be OK for now.
  return markup.replace(
    /<span class="small-caps">((?:(?!<\/span>)[\s\S])*)<\/span>/g,
    '<sc>$1</sc>',
  )
}

const htmlToJatsTagMap = {
  b: 'bold',
  strong: 'bold',
  blockquote: 'disp-quote',
  i: 'italic',
  em: 'italic',
  li: 'list-item',
  p: 'p',
  u: 'underline',
  // figure: 'fig',
  // ?: 'disp-formula',
  // img: 'graphic',
  // ?: 'inline-formula',
  // ?: 'mml:math',
  // ?: 'monospace',
  // ?: 'strike',
  // ?: 'tex-math',
}

const jatsTagsThatDontNeedConversion = [
  'ext-link',
  'list',
  'sc',
  'sec',
  'sub',
  'sup',
  'title',
  'xref',
  'graphic',
  'caption',
  'thead',
  'table',
  'tbody',
  'tr',
  'td',
  'math-inline',
  'math-display',
  'bold',
  'disp-quote',
  'italic',
  'underline',
  'list-item',
  '@sec',
  '@title',
  'fig',
  'table-wrap',
  'inline-formula',
  'disp-formula',
  'ref',
  'mixed-citation',
  'year',
  'source',
  'article-title',
  'string-name',
  'volume',
  'issue',
  'fpage',
  'lpage',
  'person-group',
  'label',
  // 'span', // using this for footnote citations, may need to cleanup later?
]

const convertRemainingTags = markup =>
  convertTagsAndRemoveTags(
    markup,
    htmlToJatsTagMap,
    jatsTagsThatDontNeedConversion,
  )

/** insertSections/convertImages/wrapStrayTextInParagraphs parse the markup
 * with htmlparser2 in xmlMode, which only decodes the 5 predefined XML
 * entities (amp, lt, gt, quot, apos) - anything else (e.g. &nbsp;) would
 * come out the other side as literal, unconverted text. And cheerio's own
 * serializer re-encodes special characters its own way on the way out
 * (e.g. '&' as the named '&amp;', not the numeric '&#x26;' this file uses
 * elsewhere), which isn't under our control. So this structural conversion
 * is sandwiched between two entity-normalizing passes: one before, to
 * protect entities the parser doesn't know, and one after, to undo
 * whatever encoding cheerio chose. */
const applyStructuralConversion = html => {
  let jats = html

  jats = insertSections(jats)
  jats = convertImages(jats)
  jats = convertLinks(jats)
  jats = convertLists(jats)
  jats = convertSmallCaps(jats)
  jats = convertRemainingTags(jats)
  jats = wrapStrayTextInParagraphs(jats)

  return jats
}

const htmlToJats = (html, convert) => {
  let jats = html

  jats = removeIllegalCharacters(jats)

  if (convert) {
    jats = applyStructuralConversion(jats)
  } else {
    jats = convertCharacterEntities(jats)
    jats = applyStructuralConversion(jats)
    jats = convertCharacterEntities(jats)
  }

  return jats
}

module.exports = htmlToJats
