import type { AttributeSpec } from 'prosemirror-model'

import { sortBy } from 'lodash'
import {
  Plugin,
  PluginKey,
  TextSelection,
  type Command,
  type EditorState,
  type Transaction,
} from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { uuid } from '@coko/client'

import type { WaxFeature, WaxMarkSpec } from '../editor'

const commentMark = (showTitle: boolean): WaxMarkSpec => {
  const comment: WaxMarkSpec = {
    attrs: {
      class: { default: 'comment' },
      id: { default: '' },
      group: { default: '' },
      viewid: { default: '' },
      conversation: [] as AttributeSpec,
    },
    inclusive: false,
    excludes: '',
    parseDOM: [
      {
        tag: 'span.comment',
        getAttrs(hook, next): void {
          const parsedDom: Record<string, unknown> = {
            class: hook.dom.getAttribute('class'),
            id: hook.dom.dataset.id,
            group: hook.dom.dataset.group,
            viewid: hook.dom.dataset.viewid,
            conversation: JSON.parse(hook.dom.dataset.conversation),
          }

          if (showTitle) {
            parsedDom.title = hook.dom.dataset.title
          }

          Object.assign(hook, parsedDom)
          next()
        },
      },
    ],
    toDOM(hook, next): void {
      const attrs: Record<string, unknown> = {
        class: hook.node.attrs.class,
        'data-id': hook.node.attrs.id,
        'data-conversation': JSON.stringify(hook.node.attrs.conversation),
        'data-viewid': hook.node.attrs.viewid,
        'data-group': hook.node.attrs.group,
      }

      if (showTitle) {
        attrs['data-title'] = hook.node.attrs.title
      }

      hook.value = ['span', attrs]
      next()
    },
  }

  if (showTitle) {
    comment.attrs.title = { default: '' }
  }

  return comment
}

export type CommentEntry = {
  content: string
  displayName: string
  userId: string
  timestamp: number
}

export type CommentData = {
  type: 'comment'
  pmFrom: number
  pmTo: number
  conversation: CommentEntry[]
  title: string
  group: string
  viewId: string
}

export type Comment = {
  id: string
  from: number
  to: number
  data: CommentData
}

type CommentsState = { comments: Comment[] }

type CommentAction =
  | { type: 'add'; comment: Comment }
  | { type: 'update'; id: string; data: Partial<CommentData> }
  | { type: 'delete'; id: string }

export const commentsKey = new PluginKey<CommentsState>('comments')

const withRange = (comment: Comment, from: number, to: number): Comment => ({
  ...comment,
  from,
  to,
  data: { ...comment.data, pmFrom: from, pmTo: to },
})

const applyAction = (comments: Comment[], action: CommentAction): Comment[] => {
  if (action.type === 'add') return [...comments, action.comment]
  if (action.type === 'delete') return comments.filter(c => c.id !== action.id)

  return comments.map(c =>
    c.id === action.id ? { ...c, data: { ...c.data, ...action.data } } : c,
  )
}

const mapComments = (comments: Comment[], tr: Transaction): Comment[] =>
  comments
    .map(c => withRange(c, tr.mapping.map(c.from), tr.mapping.map(c.to)))
    .filter(c => c.from < c.to)

export const getComments = (state: EditorState): Comment[] =>
  commentsKey.getState(state)?.comments ?? []

export const getActiveComment = (state: EditorState): Comment | undefined => {
  const { from } = state.selection

  return sortBy(
    getComments(state).filter(c => from >= c.from && from < c.to),
    c => c.from,
  ).at(-1)
}

export const canAddComment = (state: EditorState): boolean => {
  const { from, to, empty } = state.selection
  if (empty || !commentsKey.getState(state)) return false
  let allowed = true

  state.doc.nodesBetween(from, to, node => {
    if (['math_display', 'math_inline', 'image'].includes(node.type.name))
      allowed = false
  })

  return allowed
}

export const addComment =
  (group = 'main'): Command =>
  (state, dispatch) => {
    if (!canAddComment(state)) return false
    const { from, to } = state.selection

    if (dispatch) {
      const comment = withRange(
        {
          id: uuid(),
          from,
          to,
          data: {
            type: 'comment',
            pmFrom: from,
            pmTo: to,
            conversation: [],
            title: '',
            group,
            viewId: 'main',
          },
        },
        from,
        to,
      )

      dispatch(
        state.tr
          .setMeta(commentsKey, { type: 'add', comment })
          .setSelection(TextSelection.create(state.doc, from)),
      )
    }

    return true
  }

export const replyToComment =
  (id: string, entry: CommentEntry, title?: string): Command =>
  (state, dispatch) => {
    const comment = getComments(state).find(c => c.id === id)
    if (!comment) return false

    if (dispatch) {
      dispatch(
        state.tr.setMeta(commentsKey, {
          type: 'update',
          id,
          data: {
            conversation: [...comment.data.conversation, entry],
            title: title ?? comment.data.title,
          },
        }),
      )
    }

    return true
  }

export const resolveComment =
  (id: string): Command =>
  (state, dispatch) => {
    if (!getComments(state).some(c => c.id === id)) return false
    if (dispatch)
      dispatch(state.tr.setMeta(commentsKey, { type: 'delete', id }))
    return true
  }

type CommentsPluginOptions = {
  initialComments?: Comment[]
  onChange?: (comments: Comment[]) => void
}

const commentsPlugin = ({
  initialComments = [],
  onChange,
}: CommentsPluginOptions): Plugin<CommentsState> =>
  new Plugin<CommentsState>({
    key: commentsKey,
    state: {
      init: (): CommentsState => ({
        comments: initialComments.map(c =>
          withRange(c, c.data.pmFrom ?? c.from, c.data.pmTo ?? c.to),
        ),
      }),
      apply(tr, value): CommentsState {
        const action = tr.getMeta(commentsKey) as CommentAction | undefined
        let { comments } = value
        if (tr.docChanged) comments = mapComments(comments, tr)
        if (action) comments = applyAction(comments, action)
        return comments === value.comments ? value : { comments }
      },
    },
    props: {
      decorations(state): DecorationSet {
        const active = getActiveComment(state)

        return DecorationSet.create(
          state.doc,
          getComments(state).map(c =>
            Decoration.inline(
              c.from,
              c.to,
              {
                class:
                  c.id === active?.id ? 'comment active-comment' : 'comment',
                'data-id': c.id,
              },
              { id: c.id, inclusiveEnd: true },
            ),
          ),
        )
      },
    },
    view: () => ({
      update(view, previous): void {
        const current = getComments(view.state)
        if (onChange && current !== getComments(previous)) onChange(current)
      },
    }),
  })

type CommentsFeatureOptions = CommentsPluginOptions & { showTitle?: boolean }

const comments = ({
  showTitle = false,
  ...options
}: CommentsFeatureOptions = {}): WaxFeature => ({
  name: 'comments',
  waxMarks: { comment: commentMark(showTitle) },
  plugins: () => ({ comments: commentsPlugin(options) }),
})

export default comments
