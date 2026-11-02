import { type CheerioAPI } from 'cheerio'

const UNSUPPORTED_IMAGE_SOURCE = /^data:image\/[ew]mf;base64,/

const replaceUnsupportedImages = ($: CheerioAPI): void => {
  $('img')
    .filter((_, element) =>
      UNSUPPORTED_IMAGE_SOURCE.test($(element).attr('src') ?? ''),
    )
    .attr({
      src: '',
      alt: 'Broken image',
      'data-original-name': 'broken-image',
    })
}

export default replaceUnsupportedImages
