import { type CheerioAPI } from 'cheerio'

const wrapLooseContent = ($: CheerioAPI): void => {
  const root = $.root()

  root.contents().each((_, node) => {
    const $node = $(node)

    if (node.type === 'text') {
      if (/\S/.test($node.text())) $node.wrap('<p></p>')
      return
    }

    if ($node.is('a')) {
      $node.wrap('<p></p>')
      return
    }

    if ($node.is('img')) {
      const isLast = !node.nextSibling
      $node.wrap('<figure></figure>')
      if (isLast) root.append('<p></p>')
    }
  })
}

export default wrapLooseContent
