import { forEach, each } from 'lodash'
import { uuid } from '@coko/client'
import { Plugin, PluginKey } from 'prosemirror-state'
import { DocumentHelpers } from 'wax-prosemirror-core'

const copyPasteCommentPugin = new PluginKey('copyPasteCommentPugin')

export default (props, context) => {
  return new Plugin({
    key: copyPasteCommentPugin,
    props: {
      transformPasted: slice => {
        const { activeView } = context.app.context
        const { content } = slice

        const commentNodes = DocumentHelpers.findChildrenByMark(
          content,
          activeView.state.schema.marks.comment,
          true,
        )

        const allComments = []

        // eslint-disable-next-line array-callback-return
        commentNodes.map(node => {
          // eslint-disable-next-line array-callback-return
          node.node.marks.map(comment => {
            if (comment.type.name === 'comment') {
              allComments.push(comment)
            }
          })
        })

        const groupedCommentsById = allComments.reduce((obj, mark) => {
          obj[mark.attrs.id] = [...(obj[mark.attrs.id] || []), mark]
          return obj
        }, {})

        forEach(Object.keys(groupedCommentsById), key => {
          const id = uuid()
          forEach(groupedCommentsById[key], comment => {
            comment.attrs.id = id
          })
        })

        const schemaNotes = []
        each(activeView.state.schema.nodes, node => {
          if (node.groups.includes('notes')) schemaNotes.push(node)
        })

        if (schemaNotes.length > 0) {
          schemaNotes.forEach(schemaNote => {
            const notes = DocumentHelpers.findChildrenByType(
              content,
              activeView.state.schema.nodes[schemaNote.name],
              true,
            )

            notes.forEach(note => {
              note.node.attrs.id = uuid()
            })
          })
        }

        return slice
      },
    },
  })
}
