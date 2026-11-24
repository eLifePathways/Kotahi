import type { AutocompleteAction, Options } from 'prosemirror-autocomplete'

import askAi from '../features/askAi'
import blockQuote from '../features/blockQuote'
import callout from '../features/callout'
import citation from '../features/citation'
import code from '../features/code'
import comments, { type Comment } from '../features/comments'
import emphasis from '../features/emphasis'
import enter from '../features/enter'
import findAndReplace from '../features/findAndReplace'
import handlebars from '../features/handlebars'
import headings from '../features/headings'
import history from '../features/history'
import images from '../features/images'
import jatsTags from '../features/jatsTags'
import trackedParagraph from '../features/trackedParagraph'
import link from '../features/link'
import lists from '../features/lists'
import math from '../features/math'
import mention from '../features/mention'
import notes from '../features/notes'
import smallCaps from '../features/smallCaps'
import strikethrough from '../features/strikethrough'
import strong from '../features/strong'
import subscript from '../features/subscript'
import superscript from '../features/superscript'
import tables from '../features/tables'
import title from '../features/title'
import trackChanges from '../features/trackChanges'
import typography from '../features/typography'
import underline from '../features/underline'
import type { WaxFeature } from '../features/types'

export type HandlebarsActions = (action: AutocompleteAction) => void

const marks = (): WaxFeature[] => [
  code,
  strong,
  emphasis,
  subscript,
  superscript,
  strikethrough,
  underline,
  smallCaps,
]

const listFeatures = (): WaxFeature[] => [blockQuote, lists]

const blocks = (): WaxFeature[] => [headings, title]

type CommentOptions = {
  initialComments?: Comment[]
  onCommentsChange?: (comments: Comment[]) => void
}

type ImageOptions = { imageConfig?: unknown }

export const simpleFeatures = ({
  handlebarsActions,
}: { handlebarsActions?: HandlebarsActions } = {}): WaxFeature[] => [
  typography,
  history,
  ...marks(),
  link,
  ...listFeatures(),
  math,
  notes,
  ...(handlebarsActions ? [handlebars(handlebarsActions)] : []),
  ...blocks(),
]

export const chatFeatures = ({
  onEnterPress,
  autoCompleteReducer,
}: {
  onEnterPress: (html: string) => void
  autoCompleteReducer: Options['reducer']
}): WaxFeature[] => [
  typography,
  history,
  mention({ reducer: autoCompleteReducer }),
  enter({ getContentOnEnter: onEnterPress }),
  ...marks(),
  link,
  ...listFeatures(),
  math,
  notes,
  ...blocks(),
]

export const fullFeatures = ({
  initialComments,
  onCommentsChange,
  imageConfig,
}: CommentOptions & ImageOptions = {}): WaxFeature[] => [
  trackedParagraph,
  typography,
  askAi,
  history,
  findAndReplace,
  images(imageConfig),
  ...marks(),
  link,
  ...listFeatures(),
  math,
  notes,
  tables,
  ...blocks(),
  trackChanges,
  comments({ showTitle: true, initialComments, onChange: onCommentsChange }),
  jatsTags,
  citation(),
  callout(),
]

export const productionFeatures = ({
  initialComments,
  onCommentsChange,
  imageConfig,
}: CommentOptions & ImageOptions = {}): WaxFeature[] => [
  trackedParagraph,
  typography,
  askAi,
  history,
  images(imageConfig),
  ...marks(),
  ...listFeatures(),
  ...blocks(),
  notes,
  comments({ showTitle: true, initialComments, onChange: onCommentsChange }),
  link,
  trackChanges,
  math,
  findAndReplace,
  tables,
  jatsTags,
  citation(),
  callout(),
]

export const contentFeatures = ({
  imageConfig,
}: ImageOptions = {}): WaxFeature[] => [
  trackedParagraph,
  typography,
  history,
  findAndReplace,
  images(imageConfig),
  ...marks(),
  link,
  ...listFeatures(),
  math,
  tables,
  ...blocks(),
]
