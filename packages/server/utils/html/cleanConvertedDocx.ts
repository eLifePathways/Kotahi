import HtmlDocument from './HtmlDocument'
import acceptTrackChanges from './rules/acceptTrackChanges'
import replaceUnsupportedImages from './rules/replaceUnsupportedImages'
import splitFiguresOutOfBlocks from './rules/splitFiguresOutOfBlocks'
import unwrapBlockMath from './rules/unwrapBlockMath'
import wrapLooseContent from './rules/wrapLooseContent'

const cleanConvertedDocx = (html: string): string =>
  new HtmlDocument(html)
    .apply(wrapLooseContent)
    .apply(acceptTrackChanges)
    .apply(unwrapBlockMath)
    .apply(replaceUnsupportedImages)
    .apply(splitFiguresOutOfBlocks)
    .toHtml()

export default cleanConvertedDocx
