import { ReplaceAroundStep, liftTarget, canJoin } from 'prosemirror-transform'
import { NodeRange, Fragment, Slice } from 'prosemirror-model'

// these are from here: https://github.com/atlassian/prosemirror-utils/tree/master/src

// Checks if the type a given `node` equals to a given `nodeType`.
/* below are from prosemirror-schema-list: */

export const equalNodeType = (nodeType, node) => {
  return (
    (Array.isArray(nodeType) && nodeType.indexOf(node.type) > -1) ||
    node.type === nodeType
  )
}

// Iterates over parent nodes starting from the given `$pos`, returning the closest node and its start position `predicate` returns truthy for. `start` points to the start position of the node, `pos` points directly before the node.
//
// ```javascript
// const predicate = node => node.type === schema.nodes.blockquote;
// const parent = findParentNodeClosestToPos(state.doc.resolve(5), predicate);
// ```
// eslint-disable-next-line consistent-return
export const findParentNodeClosestToPos = ($pos, predicate) => {
  // eslint-disable-next-line no-plusplus
  for (let i = $pos.depth; i > 0; i--) {
    const node = $pos.node(i)

    if (predicate(node)) {
      return {
        pos: i > 0 ? $pos.before(i) : 0,
        start: $pos.start(i),
        depth: i,
        node,
      }
    }
  }
}

// Iterates over parent nodes starting from the given `$pos`, returning closest node of a given `nodeType`. `start` points to the start position of the node, `pos` points directly before the node.
//
// ```javascript
// const parent = findParentNodeOfTypeClosestToPos(state.doc.resolve(10), schema.nodes.paragraph);
// ```
export const findParentNodeOfTypeClosestToPos = ($pos, nodeType) => {
  return findParentNodeClosestToPos($pos, node => equalNodeType(nodeType, node))
}

/**
Create a command to lift the list item around the selection up into
a wrapping list.
*/
function liftListItem(itemType) {
  return (state, dispatch) => {
    const { $from, $to } = state.selection

    const range = $from.blockRange(
      $to,
      // eslint-disable-next-line eqeqeq
      node => node.childCount > 0 && node.firstChild.type == itemType,
    )

    if (!range) return false
    if (!dispatch) return true
    // eslint-disable-next-line eqeqeq
    if ($from.node(range.depth - 1).type == itemType)
      // Inside a parent list
      return liftToOuterList(state, dispatch, itemType, range)
    return liftOutOfList(state, dispatch, range)
  }
}

function liftListItemToType(itemType, newType, newClass) {
  // console.log('in liftListItemToType', itemType, newType, newClass)

  return (state, dispatch) => {
    const { $from, $to } = state.selection

    const range = $from.blockRange(
      $to,
      // eslint-disable-next-line eqeqeq
      node => node.childCount > 0 && node.firstChild.type == itemType,
    )

    if (!range) return false
    if (!dispatch) return true

    // eslint-disable-next-line eqeqeq
    if ($from.node(range.depth - 1).type == itemType) {
      // Inside a parent list
      // console.log('going to lift to outer list')
      return liftToOuterList(state, dispatch, itemType, range)
    }

    // console.log('going to lift out of list')
    return liftOutOfList(state, dispatch, range, newType, newClass)
  }
}

function liftToOuterList(state, dispatch, itemType, range) {
  const { tr } = state
  const { end } = range
  const endOfList = range.$to.end(range.depth)

  if (end < endOfList) {
    // There are siblings after the lifted items, which must become
    // children of the last item
    tr.step(
      new ReplaceAroundStep(
        end - 1,
        endOfList,
        end,
        endOfList,
        new Slice(
          Fragment.from(itemType.create(null, range.parent.copy())),
          1,
          0,
        ),
        1,
        true,
      ),
    )

    range = new NodeRange(
      tr.doc.resolve(range.$from.pos),
      tr.doc.resolve(endOfList),
      range.depth,
    )
  }

  const target = liftTarget(range)
  if (target == null) return false
  tr.lift(range, target)
  const after = tr.mapping.map(end, -1) - 1
  if (canJoin(tr.doc, after)) tr.join(after)
  dispatch(tr.scrollIntoView())
  return true
}

function liftOutOfList(state, dispatch, range, newType, newClass) {
  // console.log('in lift out of list', newType.name)
  const { tr } = state
  const list = range.parent

  // Merge the list items into a single big item
  for (
    let pos = range.end, i = range.endIndex - 1, e = range.startIndex;
    i > e;
    // eslint-disable-next-line no-plusplus
    i--
  ) {
    // console.log('list.child(i).nodeSize: ', list.child(i).nodeSize)
    pos -= list.child(i).nodeSize
    tr.delete(pos - 1, pos + 1)
  }

  const $start = tr.doc.resolve(range.start)
  const item = $start.nodeAfter
  // console.log('$start.nodeAfter.nodeSize: ', $start.nodeAfter.nodeSize)
  // eslint-disable-next-line eqeqeq
  if (tr.mapping.map(range.end) != range.start + $start.nodeAfter.nodeSize)
    return false
  // eslint-disable-next-line eqeqeq
  const atStart = range.startIndex == 0
  // eslint-disable-next-line eqeqeq
  const atEnd = range.endIndex == list.childCount
  const p = $start.node(-1) // p is parent
  const indexBefore = $start.index(-1)
  if (
    !p.canReplace(
      indexBefore + (atStart ? 0 : 1),
      indexBefore + 1,
      item.content.append(atEnd ? Fragment.empty : Fragment.from(list)),
    )
  )
    return false
  const start = $start.pos
  // console.log('item.nodeSize: ', item.nodeSize)
  const end = start + item.nodeSize
  // Strip off the surrounding list. At the sides where we're not at
  // the end of the list, the existing list is closed. At sides where
  // this is the end, it is overwritten to its end.
  tr.step(
    new ReplaceAroundStep(
      start - (atStart ? 1 : 0),
      end + (atEnd ? 1 : 0),
      start + 1,
      end - 1,
      new Slice(
        (atStart
          ? Fragment.empty
          : Fragment.from(list.copy(Fragment.empty))
        ).append(
          atEnd ? Fragment.empty : Fragment.from(list.copy(Fragment.empty)),
        ),
        atStart ? 0 : 1,
        atEnd ? 0 : 1,
      ),
      atStart ? 0 : 1,
    ),
  )

  const { from, to } = state.selection
  let citationNumber = ''
  state.doc.nodesBetween(from, to, (node, pos) => {
    if (node.type.name === 'list_item' && node.attrs.listnumber) {
      citationNumber = node.attrs.listnumber
    }

    if (!node.isTextblock || node.hasMarkup(newType, { class: newClass }))
      return
    let applicable = false

    if (node.type === newType) {
      applicable = true
    } else {
      // const $pos = state.doc.resolve(pos)
      // const index = $pos.index()
      applicable = node.type.name === 'paragraph'
      //  ||
      // $pos.parent.canReplaceWith(index, index + 1, newType)
    }

    if (applicable) {
      // console.log(
      //   'applicable: ',
      //   applicable,
      //   node.type.name,
      //   'citationNumber:',
      //   citationNumber,
      // )
      // console.log('from: ', from, 'to: ', to, node, pos)

      const newStart = pos
      const newEnd = pos + 1

      tr.setBlockType(newStart, newEnd, newType, {
        ...node.attrs,
        citationNumber,
        class: newClass,
      })

      // should we then stop?
    }
  })
  if (!tr.steps.length) return false

  dispatch(tr.scrollIntoView())
  return true
}

export { liftListItem, liftListItemToType }
