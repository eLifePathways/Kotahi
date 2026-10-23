import { type CheerioAPI } from 'cheerio'

const unwrapBlockMath = ($: CheerioAPI): void => {
  $('p math-display, h2 math-display, h3 math-display, h4 math-display').each(
    (_, element) => {
      const $math = $(element)

      const blockMath = $('<math-display class="math-node"></math-display>')
      blockMath.append($math.contents())

      $math.parent().replaceWith(blockMath)
    },
  )
}

export default unwrapBlockMath
