import { type AnyNode, type CheerioAPI } from 'cheerio'

const BLOCK_SELECTOR = 'p, h1, h2, h3, h4, h5, h6'

const splitFiguresOutOfBlocks = ($: CheerioAPI): void => {
  $(BLOCK_SELECTOR)
    .filter((_, block) => $(block).children('figure').length > 0)
    .each((_, block) => {
      const $block = $(block)
      const replacement: AnyNode[] = []
      let segment = $block.clone().empty()

      const closeSegment = (): void => {
        const hasContent =
          /\S/.test(segment.text()) || segment.children().length > 0

        if (hasContent) replacement.push(segment[0])
        segment = $block.clone().empty()
      }

      $block
        .contents()
        .toArray()
        .forEach(node => {
          if ($(node).is('figure')) {
            closeSegment()
            replacement.push(node)
          } else {
            segment.append(node)
          }
        })

      closeSegment()
      $block.replaceWith(replacement)
    })
}

export default splitFiguresOutOfBlocks
