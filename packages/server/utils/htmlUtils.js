const he = require('he')

// note this regex is intended for node, and doesn't work in some browsers (so it breaks Storybook on Safari)
const paragraphOrListItemRegex =
  /(?<=<p\b[^>]*>)[\s\S]*?(?=<\/p>)|(?<=<li>)(?:(?!<p\b)[\s\S])*?(?=<\/li>)/g

const getParagraphOrListItems = html => {
  return html
    .match(paragraphOrListItemRegex)
    .map(s => s.trim())
    .filter(s => !!s)
}

const convertTagsAndRemoveTags = (markup, tagsToConvert, tagsToIgnore) => {
  const openTagRegex = /<([^/>\s]+)(?:(?!\/?>)[\s\S])*>/g
  const closeTagRegex = /<\/([^/>\s]+)>/g
  const selfClosingTagRegex = /<([^/>\s]+)(?:(?!\/?>)[\s\S])*\/>/g

  const convertSomeTags = (mkup, tagRegex, tagType) => {
    let result = ''
    let lastIndex = 0

    while (true) {
      const match = tagRegex.exec(mkup)
      if (!match) break
      result += mkup.substring(lastIndex, match.index)
      const tagName = match[1]

      if (tagsToIgnore.includes(tagName)) result += match[0]
      else {
        const replacementTag = tagsToConvert[tagName]

        if (replacementTag) {
          if (tagType === 'open') result += `<${replacementTag}>`
          else if (tagType === 'close') result += `</${replacementTag}>`
          else if (tagType === 'self-close') result += `<${replacementTag}/>`
        }
      }

      lastIndex = match.index + match[0].length
    }

    result += mkup.substring(lastIndex)
    return result
  }

  let result = markup
  result = convertSomeTags(result, openTagRegex, 'open')
  result = convertSomeTags(result, closeTagRegex, 'close')
  result = convertSomeTags(result, selfClosingTagRegex, 'self-close')
  return result
}

const convertCharacterEntities = markup => {
  const entityRegex = /&[a-zA-Z#0-9]+;/g
  let result = ''
  let lastIndex = 0

  while (true) {
    const match = entityRegex.exec(markup)
    if (!match) break
    result += markup.substring(lastIndex, match.index)
    result += he.encode(he.decode(match[0]))
    lastIndex = match.index + match[0].length
  }

  result += markup.substring(lastIndex)
  return result
}

const illegalCharRegex =
  // eslint-disable-next-line no-control-regex
  /[\p{Cs}\p{Cn}\x00-\x08\x0B-\x0C\x0E-\x1F\x7F\x80-\x9F]/gu

/** Remove surrogates, unassigned characters (including noncharacters) and control characters other than ASCII whitespace. */
const removeIllegalCharacters = markup => markup.replace(illegalCharRegex, '')

module.exports = {
  getParagraphOrListItems,
  convertTagsAndRemoveTags,
  convertCharacterEntities,
  removeIllegalCharacters,
}
