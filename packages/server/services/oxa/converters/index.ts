import type { AnyConverter, ConverterOptions } from './OxaNodeConverter'

import CitationCalloutConverter from './standard/citationCallout'
import { CodeBlockConverter, InlineCodeConverter } from './standard/code'
import DocumentConverter from './standard/document'
import EmphasisConverter from './standard/emphasis'
import HeadingConverter from './standard/heading'
import ParagraphConverter from './standard/paragraph'
import ReferenceConverter from './standard/reference'
import RemovedConverter from './standard/removed'
import StrongConverter from './standard/strong'
import SubscriptConverter from './standard/subscript'
import SuperscriptConverter from './standard/superscript'
import TextConverter from './standard/text'
import ThematicBreakConverter from './standard/thematicBreak'

import { ImageConverter, InlineImageConverter } from './rfc/image'

import BlockQuoteConverter from './experimental/blockQuote'
import CaptionConverter from './experimental/caption'
import FigureConverter from './experimental/figure'
import FootnoteConverter from './experimental/footnote'
import FundingConverter from './experimental/funding'
import LineBreakConverter from './experimental/lineBreak'
import LinkConverter from './experimental/link'
import ListConverter from './experimental/list'
import ListItemConverter from './experimental/listItem'
import { InlineMathConverter, MathConverter } from './experimental/math'
import SectionConverter from './experimental/section'
import SmallCapsConverter from './experimental/smallCaps'
import StrikethroughConverter from './experimental/strikethrough'
import TableConverter from './experimental/table'
import TableCellConverter from './experimental/tableCell'
import TableRowConverter from './experimental/tableRow'
import UnderlineConverter from './experimental/underline'

/**
 * Order matters here.
 * Each node is converted by the first converter that matches it.
 */
const createConverters = (options: ConverterOptions): AnyConverter[] => [
  new TextConverter(options),
  new DocumentConverter(options),
  new RemovedConverter(options),
  new HeadingConverter(options),
  new ReferenceConverter(options),
  new FundingConverter(options),
  new ParagraphConverter(options),
  new CodeBlockConverter(options),
  new ThematicBreakConverter(options),
  new ListConverter(options),
  new ListItemConverter(options),
  new TableConverter(options),
  new TableRowConverter(options),
  new TableCellConverter(options),
  new FigureConverter(options),
  new CaptionConverter(options),
  new InlineImageConverter(options),
  new ImageConverter(options),
  new BlockQuoteConverter(options),
  new MathConverter(options),
  new SectionConverter(options),
  new CitationCalloutConverter(options),
  new StrongConverter(options),
  new EmphasisConverter(options),
  new SubscriptConverter(options),
  new SuperscriptConverter(options),
  new UnderlineConverter(options),
  new StrikethroughConverter(options),
  new SmallCapsConverter(options),
  new InlineCodeConverter(options),
  new LinkConverter(options),
  new LineBreakConverter(options),
  new InlineMathConverter(options),
  new FootnoteConverter(options),
]

export default createConverters
