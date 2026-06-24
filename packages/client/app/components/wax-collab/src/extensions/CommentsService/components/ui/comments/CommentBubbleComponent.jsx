/* eslint-disable consistent-return */
/* eslint-disable default-param-last */
/* eslint react/prop-types: 0 */

/* eslint-disable react-hooks/exhaustive-deps */

import { useLayoutEffect, useContext } from 'react'
import { WaxContext, DocumentHelpers } from 'wax-prosemirror-core'
import { AddMarkStep } from 'prosemirror-transform'
import { uuid } from '@coko/client'
import CommentBubble from './CommentBubble'

const createComment = (
  state,
  dispatch,
  group,
  viewid,
  conversation = [],
  title = '',
  posFrom,
  posTo,
) => {
  const {
    selection: { $from, $to },
  } = state

  let fromPosition = $from.pos
  let toPosition = $to.pos

  if ($from.pos === $to.pos) {
    fromPosition = posFrom
    toPosition = posTo
  }

  let footnote = false
  let footnoteNode
  state.doc.nodesBetween($from.pos, $to.pos, node => {
    if (node.type.groups.includes('notes')) {
      footnote = true
      footnoteNode = node
    }
  })

  if (footnote) {
    if (
      footnoteNode.content.size + 2 ===
      state.selection.to - state.selection.from
    ) {
      return createCommentOnSingleFootnote(
        state,
        dispatch,
        group,
        viewid,
        conversation,
        title,
      )
    }

    return createCommentOnFootnote(
      state,
      dispatch,
      group,
      viewid,
      conversation,
      title,
    )
  }

  dispatch(
    state.tr
      .addMark(
        fromPosition,
        toPosition,
        state.config.schema.marks.comment.create({
          id: uuid(),
          group,
          viewid,
          conversation,
          title,
        }),
      )
      .setMeta('forceUpdate', true),
  )
}

const createCommentOnSingleFootnote = (
  state,
  dispatch,
  group,
  viewid,
  conversation,
  title,
) => {
  const { tr } = state
  tr.step(
    new AddMarkStep(
      state.selection.from,
      state.selection.from + 1,
      state.config.schema.marks.comment.create({
        id: uuid(),
        group,
        conversation,
        viewid,
        title,
      }),
    ),
  ).setMeta('forceUpdate', true)
  dispatch(tr)
}

const createCommentOnFootnote = (
  state,
  dispatch,
  group,
  viewid,
  conversation,
  title,
) => {
  const {
    selection: { $from },
    selection,
    tr,
  } = state

  // const { content } = $from.parent
  const $pos = state.doc.resolve($from.pos)
  const commentStart = $from.pos - $pos.textOffset
  const commentEnd = commentStart + $pos.parent.child($pos.index()).nodeSize

  let start = $from.pos
  let end = commentEnd
  const ranges = []

  const allFragments = []

  selection.content().content.content.forEach(node => {
    node.content.content.forEach(fragment => {
      allFragments.push(fragment)
    })
  })

  allFragments.forEach((contentNode, index) => {
    start = index === 0 ? start : end
    end = index === 0 ? end : end + contentNode.nodeSize
    ranges.push({
      start,
      end,
      footnote: contentNode.type.groups.includes('notes'),
    })
  })

  const mergedRanges = []
  ranges.forEach(item => {
    if (item.footnote) {
      mergedRanges[mergedRanges.length - 1].end =
        mergedRanges[mergedRanges.length - 1].end + 1
    } else {
      mergedRanges.push(item)
    }
  })

  const id = uuid()

  mergedRanges.forEach(range => {
    tr.step(
      new AddMarkStep(
        range.start,
        range.end,
        state.config.schema.marks.comment.create({
          id,
          group,
          conversation,
          viewid,
          title,
        }),
      ),
    ).setMeta('forceUpdate', true)
  })

  dispatch(tr)
}

const CommentBubbleComponent = ({ setPosition, position, group }) => {
  const { activeView, activeViewId } = useContext(WaxContext)
  const { state, dispatch } = activeView

  useLayoutEffect(() => {
    const WaxSurface = activeView.dom.getBoundingClientRect()
    const { selection } = activeView.state
    const { from, to } = selection
    const start = activeView.coordsAtPos(from)
    const end = activeView.coordsAtPos(to)
    const difference = end.top - start.top
    const left = WaxSurface.width - 20
    const top = end.top - WaxSurface.top - difference / 2 - 5
    setPosition({ ...position, left, top })
  }, [position.left])

  const createCommentBubble = event => {
    event.preventDefault()
    createComment(state, dispatch, group, activeViewId)
    activeView.focus()
  }

  const isCommentAllowed = () => {
    const commentMark = activeView.state.schema.marks.comment
    const marks = DocumentHelpers.findMark(state, commentMark, true)

    let allowed = true
    state.doc.nodesBetween(
      state.selection.$from.pos,
      state.selection.$to.pos,
      node => {
        if (
          node.type.name === 'math_display' ||
          node.type.name === 'math_inline' ||
          node.type.name === 'image'
        ) {
          allowed = false
        }
      },
    )
    // TODO Overlapping comments . for now don't allow
    marks.forEach(mark => {
      if (mark.attrs.group === 'main') allowed = false
    })

    // TO DO this is because of a bug and overlay doesn't rerender. Fix in properly in Notes, and remove
    if (activeViewId !== 'main' && marks.length >= 1) allowed = false
    return allowed
  }

  return (
    isCommentAllowed() && (
      <CommentBubble
        onClick={event => {
          createCommentBubble(event)
        }}
      />
    )
  )
}

export default CommentBubbleComponent
