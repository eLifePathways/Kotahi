import { type CheerioAPI } from 'cheerio'

const TRACKED_KEEP_SELECTOR = 'span.insertion, span.format-change'

const acceptTrackChanges = ($: CheerioAPI): void => {
  $('span.deletion').remove()

  let tracked = $(TRACKED_KEEP_SELECTOR)

  while (tracked.length) {
    tracked.each((_, element) => {
      $(element).replaceWith($(element).contents())
    })

    tracked = $(TRACKED_KEEP_SELECTOR)
  }
}

export default acceptTrackChanges
