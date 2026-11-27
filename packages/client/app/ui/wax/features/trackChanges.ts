import { isEmpty } from 'lodash'
import { isHistoryTransaction } from 'prosemirror-history'
import { Slice, type Attrs, type Mark, type Node } from 'prosemirror-model'
import {
  NodeSelection,
  Plugin,
  PluginKey,
  Selection,
  TextSelection,
  type Command,
  type EditorState,
  type Transaction,
} from 'prosemirror-state'
import {
  AddMarkStep,
  Mapping,
  RemoveMarkStep,
  ReplaceAroundStep,
  ReplaceStep,
  replaceStep,
  type Step,
  type StepMap,
} from 'prosemirror-transform'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { uuid } from '@coko/client'

import {
  findInlineNodes,
  findMark,
  findMarkPosition,
  parseFormatList,
  parseTracks,
} from './helpers'
import type { WaxFeature, WaxMarkSpec, WaxNodeSpec } from './types'

type TrackUser = { username: string }

type Permission = { accept: boolean; reject: boolean }

export type TrackPermissions = { own: Permission; others: Permission }

export type TrackChangesConfig = {
  enabled: boolean
  user?: TrackingUser
}

const insertionSpec: WaxMarkSpec = {
  attrs: {
    class: { default: 'insertion' },
    id: { default: '' },
    user: { default: 0 },
    username: { default: '' },
    date: { default: 0 },
    group: { default: '' },
    viewid: { default: '' },
    style: { default: null },
  },
  inclusive: false,
  group: 'track',
  parseDOM: [
    {
      tag: 'span.insertion',
      getAttrs(hook, next): void {
        Object.assign(hook, {
          class: hook.dom.getAttribute('class'),
          style: hook.dom.getAttribute('style'),
          id: hook.dom.dataset.id,
          user: hook.dom.dataset.user,
          username: hook.dom.dataset.username,
          date: parseInt(hook.dom.dataset.date, 10),
          group: hook.dom.dataset.group,
          viewid: hook.dom.dataset.viewid,
        })
        next()
      },
    },
  ],
  toDOM(hook, next) {
    hook.value = [
      'span',
      {
        class: hook.node.attrs.class,
        'data-id': hook.node.attrs.id,
        'data-user': hook.node.attrs.user,
        'data-username': hook.node.attrs.username,
        'data-date': hook.node.attrs.date,
        'data-group': hook.node.attrs.group,
        'data-viewid': hook.node.attrs.viewid,
        style: hook.node.attrs.style,
      },
    ]
    next()
  },
}

const deletionSpec: WaxMarkSpec = {
  attrs: {
    class: { default: 'deletion' },
    id: { default: '' },
    user: { default: 0 },
    username: { default: '' },
    date: { default: 0 },
    group: { default: '' },
    viewid: { default: '' },
    style: { default: null },
  },
  inclusive: false,
  group: 'track',
  parseDOM: [
    {
      tag: 'span.deletion',
      getAttrs(hook, next): void {
        Object.assign(hook, {
          class: hook.dom.getAttribute('class'),
          style: hook.dom.getAttribute('style'),
          id: hook.dom.dataset.id,
          user: hook.dom.dataset.user,
          username: hook.dom.dataset.username,
          date: parseInt(hook.dom.dataset.date, 10),
          group: hook.dom.dataset.group,
          viewid: hook.dom.dataset.viewid,
          color: hook.dom.dataset.color,
        })
        next()
      },
    },
  ],
  toDOM(hook, next) {
    hook.value = [
      'span',
      {
        class: hook.node.attrs.class,
        'data-id': hook.node.attrs.id,
        'data-user': hook.node.attrs.user,
        'data-username': hook.node.attrs.username,
        'data-date': hook.node.attrs.date,
        'data-group': hook.node.attrs.group,
        'data-viewid': hook.node.attrs.viewid,
        style: hook.node.attrs.style,
      },
    ]
    next()
  },
}

const formatChangeSpec: WaxMarkSpec = {
  attrs: {
    class: { default: 'format-change' },
    id: { default: '' },
    user: { default: 0 },
    username: { default: '' },
    date: { default: 0 },
    before: { default: [] },
    after: { default: [] },
    group: { default: '' },
    viewid: { default: '' },
  },
  inclusive: false,
  group: 'track',
  parseDOM: [
    {
      tag: 'span.format-change',
      getAttrs(hook, next): void {
        Object.assign(hook, {
          class: hook.dom.getAttribute('class'),
          id: hook.dom.dataset.id,
          user: hook.dom.dataset.user,
          username: hook.dom.dataset.username,
          date: parseInt(hook.dom.dataset.date, 10),
          before: parseFormatList(hook.dom.dataset.before),
          after: parseFormatList(hook.dom.dataset.after),
          group: hook.dom.dataset.group,
          viewid: hook.dom.dataset.viewid,
        })
        next()
      },
    },
  ],
  toDOM(hook, next) {
    hook.value = [
      'span',
      {
        class: hook.node.attrs.class,
        'data-id': hook.node.attrs.id,
        'data-user': hook.node.attrs.user,
        'data-username': hook.node.attrs.username,
        'data-date': hook.node.attrs.date,
        'data-before': JSON.stringify(hook.node.attrs.before),
        'data-after': JSON.stringify(hook.node.attrs.after),
        'data-group': hook.node.attrs.group,
        'data-viewid': hook.node.attrs.viewid,
      },
    ]
    next()
  },
}

const trackedBlock = (tag: string): WaxNodeSpec => ({
  content: 'inline*',
  group: 'block',
  priority: 0,
  defining: true,
  attrs: {
    id: { default: '' },
    track: { default: [] },
    group: { default: '' },
    viewid: { default: '' },
  },
  parseDOM: [
    {
      tag,
      getAttrs(hook, next): void {
        Object.assign(hook, {
          id: hook.dom.dataset.id,
          track: parseTracks(hook.dom.dataset.track),
          group: hook.dom.dataset.group,
          viewid: hook.dom.dataset.viewid,
        })
        next()
      },
    },
  ],
  toDOM(hook, next): void {
    if (hook.node.attrs.track && hook.node.attrs.track.length) {
      Object.assign((hook.value as readonly unknown[])[1], {
        'data-id': hook.node.attrs.id,
        'data-track': JSON.stringify(hook.node.attrs.track),
        'data-group': hook.node.attrs.group,
        'data-viewid': hook.node.attrs.viewid,
      })
    }
    next()
  },
})

const removeNode = (
  tr: Transaction,
  node: Node,
  nodePos: number,
  map: Mapping,
): void => {
  const newNodePos = map.map(nodePos)
  const selectionBefore = Selection.findFrom(tr.doc.resolve(newNodePos), -1)
  const start = selectionBefore.$anchor.pos
  const end = newNodePos + 1

  const delStep = replaceStep(tr.doc, start, end)

  tr.step(delStep)
  map.appendMap(delStep.getMap())
}

const isAllowed = (
  mark: Mark,
  user: TrackUser,
  permissions: TrackPermissions,
  action: keyof Permission,
): boolean =>
  mark.attrs.username === user.username
    ? permissions.own[action]
    : permissions.others[action]

export const acceptTrackChanges =
  (user: TrackUser, permissions: TrackPermissions): Command =>
  (state, dispatch) => {
    const {
      tr,
      selection: { from, to },
    } = state

    tr.setMeta('AcceptReject', true)
    const map = new Mapping()

    state.doc.nodesBetween(from, to, (node, pos) => {
      if (
        node.attrs.track &&
        node.attrs.track.find(t => t.type === 'deletion')
      ) {
        removeNode(tr, node, pos, map)
      }
      if (
        node.marks &&
        node.marks.find(mark => mark.type.name === 'deletion')
      ) {
        const deletionMark = node.marks.find(
          mark => mark.type.name === 'deletion',
        )

        if (!isAllowed(deletionMark, user, permissions, 'accept')) return

        const deletionStep = new ReplaceStep(
          map.map(Math.max(pos, from)),
          map.map(Math.min(pos + node.nodeSize, to)),
          Slice.empty,
        )
        tr.step(deletionStep)
        map.appendMap(deletionStep.getMap())
      } else if (
        node.attrs.track &&
        node.attrs.track.find(t => t.type === 'insertion')
      ) {
        const track = node.attrs.track.filter(t => t.type !== 'insertion')
        tr.setNodeMarkup(
          map.map(pos),
          null,
          Object.assign(node.attrs.track, { track }),
          node.marks,
        )
      } else if (
        node.marks &&
        node.marks.find(mark => mark.type.name === 'insertion')
      ) {
        const insertionMark = node.marks.find(
          mark => mark.type.name === 'insertion',
        )
        if (!isAllowed(insertionMark, user, permissions, 'accept')) return

        tr.step(
          new RemoveMarkStep(
            map.map(Math.max(pos, from)),
            map.map(Math.min(pos + node.nodeSize, to)),
            insertionMark,
          ),
        )
      } else if (
        node.marks &&
        node.marks.find(mark => mark.type.name === 'format_change')
      ) {
        const formatChangeMark = node.marks.find(
          mark => mark.type.name === 'format_change',
        )
        if (!isAllowed(formatChangeMark, user, permissions, 'accept')) return

        tr.step(
          new RemoveMarkStep(
            map.map(Math.max(pos, from)),
            map.map(Math.min(pos + node.nodeSize, to)),
            formatChangeMark,
          ),
        )
      } else if (
        node.attrs.track &&
        node.attrs.track.find(t => t.type === 'block_change')
      ) {
        tr.setNodeMarkup(
          map.map(pos),
          null,
          {
            class: node.attrs.class,
            track: [],
          },
          // Object.assign(node.attrs.track, { track }),
          node.marks,
        )
      }
    })
    if (tr.steps.length && dispatch) dispatch(tr)
    return tr.steps.length > 0
  }

export const rejectTrackChanges =
  (user: TrackUser, permissions: TrackPermissions): Command =>
  (state, dispatch) => {
    const {
      tr,
      selection: { from, to },
    } = state
    tr.setMeta('AcceptReject', true)
    const map = new Mapping()

    state.doc.nodesBetween(from, to, (node, pos) => {
      if (
        node.marks &&
        node.marks.find(mark => mark.type.name === 'deletion')
      ) {
        const deletionMark = node.marks.find(
          mark => mark.type.name === 'deletion',
        )
        if (!isAllowed(deletionMark, user, permissions, 'reject')) return

        tr.step(
          new RemoveMarkStep(
            map.map(Math.max(pos, from)),
            map.map(Math.min(pos + node.nodeSize, to)),
            deletionMark,
          ),
        )
      } else if (
        node.attrs.track &&
        node.attrs.track.find(t => t.type === 'insertion')
      ) {
        removeNode(tr, node, pos, map)
      } else if (
        node.marks &&
        node.marks.find(mark => mark.type.name === 'insertion')
      ) {
        const insertionMark = node.marks.find(
          mark => mark.type.name === 'insertion',
        )

        if (!isAllowed(insertionMark, user, permissions, 'reject')) return

        const deletionStep = new ReplaceStep(
          map.map(Math.max(pos, from)),
          map.map(Math.min(pos + node.nodeSize, to)),
          Slice.empty,
        )
        tr.step(deletionStep)
        map.appendMap(deletionStep.getMap())
      } else if (
        node.marks &&
        node.marks.find(mark => mark.type.name === 'format_change')
      ) {
        const formatChangeMark = node.marks.find(
          mark => mark.type.name === 'format_change',
        )
        formatChangeMark.attrs.before.forEach(oldMark => {
          tr.step(
            new AddMarkStep(
              map.map(Math.max(pos, from)),
              map.map(Math.min(pos + node.nodeSize, to)),
              state.schema.marks[oldMark].create(),
            ),
          )
        })
        formatChangeMark.attrs.after.forEach(newMark => {
          tr.step(
            new RemoveMarkStep(
              map.map(Math.max(pos, from)),
              map.map(Math.min(pos + node.nodeSize, to)),
              node.marks.find(mark => mark.type.name === newMark),
            ),
          )
        })

        tr.step(
          new RemoveMarkStep(
            map.map(Math.max(pos, from)),
            map.map(Math.min(pos + node.nodeSize, to)),
            formatChangeMark,
          ),
        )
      } else if (!node.isInline && node.attrs.track) {
        const blockChangeTrack = node.attrs.track.find(
          t => t.type === 'block_change',
        )
        if (blockChangeTrack) {
          const track = node.attrs.track.filter(t => t !== blockChangeTrack)
          tr.setNodeMarkup(
            map.map(pos),
            state.schema.nodes[blockChangeTrack.before.type],
            Object.assign({}, node.attrs, blockChangeTrack.before.attrs, {
              track,
            }),
            node.marks,
          )
        }
      }
    })
    if (tr.steps.length && dispatch) dispatch(tr)
    return tr.steps.length > 0
  }

export type TrackedChange = {
  id: string
  type: 'insertion' | 'deletion' | 'format_change'
  from: number
  to: number
  username: string
  date: number
  text: string
}

const trackTypes = ['insertion', 'deletion', 'format_change'] as const

export const findTrackedChanges = (doc: Node): TrackedChange[] => {
  const changes: TrackedChange[] = []

  doc.descendants((node, pos) => {
    if (!node.isInline) return
    node.marks.forEach(mark => {
      const type = trackTypes.find(t => t === mark.type.name)
      if (!type) return
      const last = changes.at(-1)
      const text = node.isText ? node.text : ''

      if (
        last &&
        last.id === mark.attrs.id &&
        last.type === type &&
        last.to === pos
      ) {
        last.to = pos + node.nodeSize
        last.text += text
      } else {
        changes.push({
          id: mark.attrs.id,
          type,
          from: pos,
          to: pos + node.nodeSize,
          username: mark.attrs.username,
          date: mark.attrs.date,
          text,
        })
      }
    })
  })

  return changes
}

const inRange =
  (
    change: TrackedChange,
    run: (state: EditorState, dispatch?: (tr: Transaction) => void) => boolean,
  ): Command =>
  (state, dispatch) => {
    const ranged = state.apply(
      state.tr.setSelection(
        TextSelection.create(state.doc, change.from, change.to),
      ),
    )

    return run(ranged, dispatch)
  }

export const acceptChange = (
  change: TrackedChange,
  user: TrackUser,
  permissions: TrackPermissions,
): Command => inRange(change, acceptTrackChanges(user, permissions))

export const rejectChange = (
  change: TrackedChange,
  user: TrackUser,
  permissions: TrackPermissions,
): Command => inRange(change, rejectTrackChanges(user, permissions))

export const setChangesVisible =
  (show: boolean): Command =>
  (state, dispatch) => {
    const plugin = state.plugins.find(p =>
      (p as unknown as { key: string }).key.startsWith('hideShowPlugin'),
    )
    if (!plugin) return false

    if (dispatch) {
      ;(plugin.props as { setHideShow: (value: boolean) => void }).setHideShow(
        show,
      )
      dispatch(state.tr)
    }

    return true
  }

export type TrackingUser = {
  userId: string
  username: string
}

const insertionStyle = 'color: royalblue;'
const deletionStyle = 'color: indianred;'

type StepContext = {
  state: EditorState
  tr: Transaction
  newTr: Transaction
  map: Mapping
  doc: Node
  user: TrackingUser
  date: number
  group: string
  viewId: string
}

const markInsertion = (
  tr: Transaction,
  from: number,
  to: number,
  user: TrackingUser,
  date: number,
  group: string,
  viewId: string,
): void => {
  tr.removeMark(from, to, tr.doc.type.schema.marks.deletion)
  tr.removeMark(from, to, tr.doc.type.schema.marks.insertion)

  const insertionMark = tr.doc.type.schema.marks.insertion.create({
    user: user.userId,
    username: user.username,
    style: insertionStyle,
    // date
  })

  tr.addMark(from, to, insertionMark)
  // Add insertion mark also to block nodes (figures, text blocks) but not table cells/rows and lists.
  tr.doc.nodesBetween(from, to, (node, pos) => {
    if (
      pos < from ||
      ['bullet_list', 'ordered_list'].includes(node.type.name)
    ) {
      return true
    }

    if (node.isInline || ['table_row', 'table_cell'].includes(node.type.name)) {
      return false
    }

    if (node.attrs.track) {
      const track = [
        {
          type: 'insertion',
          user: user.userId,
          username: user.username,
          date,
          group,
          viewid: viewId,
        },
      ]

      tr.setNodeMarkup(
        pos,
        null,
        { ...node.attrs, track, group, id: uuid(), viewid: viewId },
        node.marks,
      )
    }

    if (node.type.name === 'table') {
      // A table was inserted. We don't add track marks to elements inside of it.
      return false
    }

    return undefined
  })
}

const markDeletion = (
  tr: Transaction,
  from: number,
  to: number,
  user: TrackingUser,
  date: number,
  group: string,
  viewId?: string,
): Mapping => {
  const deletionMark = tr.doc.type.schema.marks.deletion.create({
    user: user.userId,
    username: user.username,
    style: deletionStyle,
    // date
  })

  const deletionMap = new Mapping()

  tr.doc.nodesBetween(from, to, (node, pos) => {
    if (node.type.name.includes('table')) {
      return undefined
    }

    if (
      node.isInline &&
      node.marks.find(
        mark =>
          mark.type.name === 'insertion' &&
          mark.attrs.user.toString() === user.userId.toString(),
      )
    ) {
      const removeStep = new ReplaceStep(
        deletionMap.map(Math.max(from, pos)),
        deletionMap.map(Math.min(to, pos + node.nodeSize)),
        Slice.empty,
      )
      if (!tr.maybeStep(removeStep).failed) {
        deletionMap.appendMap(removeStep.getMap())
      }
    } else if (
      node.isInline &&
      !node.marks.find(mark => mark.type.name === 'deletion')
    ) {
      tr.addMark(
        deletionMap.map(Math.max(from, pos)),
        deletionMap.map(Math.min(to, pos + node.nodeSize)),
        deletionMark,
      )
    } else if (
      node.attrs.track &&
      !node.attrs.track.find(trackAttr => trackAttr.type === 'deletion') &&
      !['bullet_list', 'ordered_list'].includes(node.type.name)
    ) {
      if (
        node.attrs.track.find(
          trackAttr =>
            trackAttr.type === 'insertion' && trackAttr.user === user.userId,
        )
      ) {
        let removeStep: ReplaceStep | undefined
        if (node.isTextblock && node.nodeSize === 2) {
          removeNode(tr, node, pos, deletionMap)
          return undefined
        }
        if (node.isTextblock && to < pos + node.nodeSize) {
          const selectionBefore = Selection.findFrom(tr.doc.resolve(pos), -1)
          if (selectionBefore instanceof TextSelection) {
            removeStep = new ReplaceStep(
              // deletionMap.map(selectionBefore.$anchor.pos),
              deletionMap.map(Math.min(to, pos + node.nodeSize)),
              deletionMap.map(to),
              Slice.empty,
            )
          }
        } else {
          removeStep = new ReplaceStep(
            deletionMap.map(Math.max(from, pos)),
            deletionMap.map(Math.min(to, pos + node.nodeSize)),
            Slice.empty,
          )
        }

        if (!tr.maybeStep(removeStep).failed) {
          deletionMap.appendMap(removeStep.getMap())
        }
      }

      let counter = 2
      node.content.forEach(item => {
        item.marks.forEach(mark => {
          if (mark.type.name === 'deletion') {
            counter += item.nodeSize
          }
        })
      })

      if (
        node.content.size === 0 ||
        counter === node.nodeSize ||
        node.type.name === 'figure'
      ) {
        const track = node.attrs.track.slice()
        track.push({
          type: 'deletion',
          user: user.userId,
          username: user.username,
          style: deletionStyle,
          date,
          group,
          viewid: viewId,
        })
        tr.setNodeMarkup(
          deletionMap.map(pos),
          null,
          { ...node.attrs, track, group, id: uuid(), viewid: viewId },
          // Object.assign(node.attrs.track, { track }),
          node.marks,
        )
      }
    }

    return undefined
  })

  return deletionMap
}

const markWrapping = (
  tr: Transaction,
  pos: number,
  oldNode: Node,
  newNode: Node,
  user: TrackingUser,
  date: number,
  group: string,
  viewId: string,
): void => {
  let track = oldNode.attrs.track.slice()
  let blockTrack = track.find(t => t.type === 'block_change')

  if (blockTrack) {
    track = track.filter(t => t !== blockTrack)
    if (
      blockTrack.before.type !== newNode.type.name ||
      blockTrack.before.attrs.level !== newNode.attrs.level
    ) {
      blockTrack = {
        type: 'block_change',
        user: user.userId,
        username: user.username,
        date,
        before: blockTrack.before,
      }
      track.push(blockTrack)
    }
  } else {
    blockTrack = {
      type: 'block_change',
      user: user.userId,
      username: user.username,
      date,
      before: { type: oldNode.type.name, attrs: oldNode.attrs },
    }
    if (blockTrack.before.attrs.id) {
      delete blockTrack.before.attrs.id
    }
    if (blockTrack.before.attrs.track) {
      delete blockTrack.before.attrs.track
    }
    track.push(blockTrack)
  }
  tr.setNodeMarkup(pos, null, {
    ...newNode.attrs,
    track,
    group,
    id: uuid(),
    viewid: viewId,
  })
}

const trackReplaceStep = (
  { state, tr, newTr, map, user, date, group, viewId }: StepContext,
  step: ReplaceStep,
  originalStep?: Step,
  originalStepIndex?: number,
): void => {
  const deletionMarkSchema = state.schema.marks.deletion
  const deletionMark = findMark(state, deletionMarkSchema, false) as
    | { to: number }
    | undefined
  const positionTo = deletionMark ? deletionMark.to : step.to

  const newStep = new ReplaceStep(
    positionTo, // We insert all the same steps, but with "from"/"to" both set to "to" in order not to delete content. Mapped as needed.
    positionTo,
    step.slice,
    (step as unknown as { structure: boolean }).structure,
  )

  // We didn't apply the original step in its original place. We adjust the map accordingly.
  const invertStep = originalStep.invert(tr.docs[originalStepIndex]).map(map)
  map.appendMap(invertStep.getMap())
  // map.appendMap(step.invert(doc).getMap());
  if (newStep) {
    const trTemp = state.apply(newTr).tr
    if (trTemp.maybeStep(newStep).failed) {
      return
    }
    const mappedNewStepTo = newStep.getMap().map(newStep.to)

    markInsertion(
      trTemp,
      newStep.from,
      mappedNewStepTo,
      user,
      date,
      group,
      viewId,
    )
    // We condense it down to a single replace step.
    const condensedStep = new ReplaceStep(
      newStep.from,
      newStep.to,
      trTemp.doc.slice(newStep.from, mappedNewStepTo),
    )

    newTr.step(condensedStep)
    const mirrorIndex = map.maps.length - 1
    map.appendMap(condensedStep.getMap(), mirrorIndex)
    if (!newTr.selection.eq(trTemp.selection)) {
      newTr.setSelection(trTemp.selection)
    }
  }
  if (step.from !== step.to) {
    map.appendMap(
      markDeletion(
        newTr,
        step.from,
        step.to,
        user,
        date,
        group,
        viewId,
      ) as unknown as StepMap,
    )
  }
}

const trackReplaceAroundStep = (
  { tr, newTr, map, doc, user, date, group, viewId }: StepContext,
  step: ReplaceAroundStep,
  originalStep: Step,
  originalStepIndex: number,
): void => {
  if (step.from === step.gapFrom && step.to === step.gapTo) {
    // wrapped in something
    newTr.step(step)
    const from = step.getMap().map(step.from, -1)
    const to = step.getMap().map(step.gapFrom)
    markInsertion(newTr, from, to, user, date, group, viewId)
  } else if (!step.slice.size || step.slice.content.childCount === 2) {
    const invertStep = originalStep.invert(tr.docs[originalStepIndex]).map(map)
    // unwrapped from something
    map.appendMap(invertStep.getMap())
    // map.appendMap(step.invert(doc).getMap());
    map.appendMap(
      markDeletion(
        newTr,
        step.from,
        step.gapFrom,
        user,
        date,
        group,
      ) as unknown as StepMap,
    )
  } else if (
    step.slice.size === 2 &&
    step.gapFrom - step.from === 1 &&
    step.to - step.gapTo === 1
  ) {
    // Replaced one wrapping with another
    newTr.step(step)
    const oldNode = doc.nodeAt(step.from)
    if (oldNode.attrs.track) {
      markWrapping(
        newTr,
        step.from,
        oldNode,
        step.slice.content.firstChild,
        user,
        date,
        group,
        viewId,
      )
    }
  } else {
    newTr.step(step)
    const ranges = [
      {
        from: step.getMap().map(step.from, -1),
        to: step.getMap().map(step.gapFrom),
      },
      {
        from: step.getMap().map(step.gapTo, -1),
        to: step.getMap().map(step.to),
      },
    ]
    ranges.forEach(range =>
      doc.nodesBetween(range.from, range.to, (node, pos) => {
        if (pos < range.from) {
          return true
        }
        markInsertion(newTr, range.from, range.to, user, date, group, viewId)
        return undefined
      }),
    )
  }
}

const trackAddMarkStep = (
  { state, newTr, doc, user, date, group, viewId }: StepContext,
  step: AddMarkStep,
): void => {
  doc.nodesBetween(step.from, step.to, (node, pos) => {
    if (!node.isInline) {
      return true
    }
    if (node.marks.find(mark => mark.type.name === 'deletion')) {
      return false
    }
    newTr.addMark(
      Math.max(step.from, pos),
      Math.min(step.to, pos + node.nodeSize),
      step.mark,
    )

    if (
      !['comment', 'deletion'].includes(step.mark.type.name) &&
      !node.marks.find(mark => mark.type === step.mark.type)
    ) {
      const formatChangeMark = node.marks.find(
        mark => mark.type.name === 'format_change',
      )
      let after: string[]
      let before: string[]
      if (formatChangeMark) {
        if (formatChangeMark.attrs.before.includes(step.mark.type.name)) {
          before = formatChangeMark.attrs.before.filter(
            markName => markName !== step.mark.type.name,
          )
          after = formatChangeMark.attrs.after
        } else {
          before = formatChangeMark.attrs.before
          after = formatChangeMark.attrs.after.concat(step.mark.type.name)
        }
      } else {
        before = []
        after = [step.mark.type.name]
      }
      if (after.length || before.length) {
        // Math.max(step.from, pos),
        // Math.min(step.to, pos + node.nodeSize),
        newTr.addMark(
          step.from,
          step.to,
          state.schema.marks.format_change.create({
            id: uuid(),
            user: user.userId,
            username: user.username,
            date,
            before,
            after,
            group,
            viewid: viewId,
          }),
        )
      } else if (formatChangeMark) {
        newTr.removeMark(
          Math.max(step.from, pos),
          Math.min(step.to, pos + node.nodeSize),
          formatChangeMark,
        )
      }
    }

    return undefined
  })
}

const trackRemoveMarkStep = (
  { state, newTr, doc, user, date, group }: StepContext,
  step: RemoveMarkStep,
): void => {
  doc.nodesBetween(step.from, step.to, (node, pos) => {
    if (!node.isInline) {
      return true
    }
    if (node.marks.find(mark => mark.type.name === 'deletion')) {
      return false
    }
    newTr.removeMark(
      Math.max(step.from, pos),
      Math.min(step.to, pos + node.nodeSize),
      step.mark,
    )

    if (
      ['em', 'strong', 'underline'].includes(step.mark.type.name) &&
      node.marks.find(mark => mark.type === step.mark.type)
    ) {
      const formatChangeMark = node.marks.find(
        mark => mark.type.name === 'format_change',
      )
      let after: string[]
      let before: string[]
      if (formatChangeMark) {
        if (formatChangeMark.attrs.after.includes(step.mark.type.name)) {
          after = formatChangeMark.attrs.after.filter(
            markName => markName !== step.mark.type.name,
          )
          before = formatChangeMark.attrs.before
        } else {
          after = formatChangeMark.attrs.after
          before = formatChangeMark.attrs.before.concat(step.mark.type.name)
        }
      } else {
        after = []
        before = [step.mark.type.name]
      }
      if (after.length || before.length) {
        newTr.addMark(
          Math.max(step.from, pos),
          Math.min(step.to, pos + node.nodeSize),
          state.schema.marks.format_change.create({
            user: user.userId,
            username: user.username,
            date,
            before,
            after,
            id: uuid(),
            group,
          }),
        )
      } else if (formatChangeMark) {
        newTr.removeMark(
          Math.max(step.from, pos),
          Math.min(step.to, pos + node.nodeSize),
          formatChangeMark,
        )
      }
    }

    return undefined
  })
}

const untrackedMeta = [
  'inputType',
  'uiEvent',
  'paste',
  'pointer',
  'imagePlaceHolder$',
  'imagePlaceHolder$1',
]

const metaOf = (tr: Transaction): Record<string, unknown> =>
  (tr as unknown as { meta: Record<string, unknown> }).meta

const trackedTransaction = (
  tr: Transaction,
  state: EditorState,
  user: TrackingUser,
  group = 'main',
  viewId = 'main',
): Transaction => {
  // Don't track table operations
  if (!tr.selectionSet) {
    const $pos = state.selection.$anchor
    for (let { depth } = $pos; depth > 0; depth -= 1) {
      const node = $pos.node(depth)
      if (node.type.spec.tableRole === 'table') {
        return tr
      }
    }
  }

  const meta = metaOf(tr)

  if (
    !tr.steps.length ||
    (meta && !Object.keys(meta).every(key => untrackedMeta.includes(key))) ||
    tr.getMeta('inputType') === 'AcceptReject' ||
    isHistoryTransaction(tr)
  ) {
    return tr
  }

  // const group = tr.getMeta('outsideView') ? tr.getMeta('outsideView') : 'main';
  const newTr = state.tr
  const map = new Mapping()
  const date = Math.floor(Date.now())

  tr.steps.forEach((originalStep, originalStepIndex) => {
    const step = originalStep.map(map)
    if (!step) return
    const context: StepContext = {
      state,
      tr,
      newTr,
      map,
      doc: newTr.doc,
      user,
      date,
      group,
      viewId,
    }

    if (step.constructor === ReplaceStep) {
      trackReplaceStep(
        context,
        step as ReplaceStep,
        originalStep,
        originalStepIndex,
      )
    } else if (step.constructor === ReplaceAroundStep) {
      trackReplaceAroundStep(
        context,
        step as ReplaceAroundStep,
        originalStep,
        originalStepIndex,
      )
    } else if (step.constructor === AddMarkStep) {
      trackAddMarkStep(context, step as AddMarkStep)
    } else if (step.constructor === RemoveMarkStep) {
      trackRemoveMarkStep(context, step as RemoveMarkStep)
    }
  })

  if (tr.getMeta('inputType')) newTr.setMeta(tr.getMeta('inputType'), undefined)

  if (tr.getMeta('uiEvent')) newTr.setMeta(tr.getMeta('uiEvent'), undefined)

  if (tr.selectionSet) {
    const deletionMarkSchema = state.schema.marks.deletion
    const deletionMark = findMark(state, deletionMarkSchema, false) as
      | { to: number }
      | undefined

    const deletedRange =
      !state.selection.empty &&
      tr.selection.empty &&
      tr.selection.from === state.selection.from

    if (
      tr.selection instanceof TextSelection &&
      (tr.selection.from < state.selection.from || deletedRange)
    ) {
      const caretPos = map.map(tr.selection.from, -1)
      newTr.setSelection(new TextSelection(newTr.doc.resolve(caretPos)))
    } else if (tr.selection.from > state.selection.from && deletionMark) {
      const caretPos = map.map(deletionMark.to + 1, 1)
      newTr.setSelection(new TextSelection(newTr.doc.resolve(caretPos)))
    } else {
      newTr.setSelection(tr.selection.map(newTr.doc, map))
    }
  } else if (
    state.selection.from - tr.selection.from > 1 &&
    tr.selection.$head.depth > 1
  ) {
    const caretPos = map.map(tr.selection.from - 2, -1)
    newTr.setSelection(new TextSelection(newTr.doc.resolve(caretPos)))
  } else {
    if (
      state.selection.from === state.selection.to &&
      tr.selection.$head.depth > 1 &&
      state.selection.from - tr.selection.from === 1
    ) {
      tr.steps.forEach(originalStep => {
        const step = originalStep.map(map) as ReplaceStep & {
          from: number
          to: number
        }
        step.from += 1
        step.to += 1

        trackReplaceStep(
          {
            state,
            tr,
            newTr,
            map,
            doc: newTr.doc,
            user,
            date,
            group,
            viewId: undefined,
          },
          step,
        )
      })
      const caretPos = map.map(tr.selection.from - 1, -1)
      newTr.setSelection(new TextSelection(newTr.doc.resolve(caretPos)))
    } else if (state.selection.from === state.selection.to) {
      const caretPos = map.map(tr.selection.from, -1)
      newTr.setSelection(new TextSelection(newTr.doc.resolve(caretPos)))
    }
    const slice = map.slice(newTr.selection.from, newTr.selection.to)
    map.appendMap(slice as unknown as StepMap)
  }

  if (tr.storedMarksSet) newTr.setStoredMarks(tr.storedMarks)

  if (tr.scrolledIntoView) newTr.scrollIntoView()

  if (
    !isEmpty(meta) &&
    Object.keys(meta).every(key => key.includes('imagePlaceHolder'))
  ) {
    const imagePlaceholder = state.plugins.find(plugin =>
      (plugin as unknown as { key: string }).key.startsWith('imagePlaceHolder'),
    )
    return newTr.setMeta(imagePlaceholder, { remove: { id: {} } })
  }
  return newTr
}

type Range = { from: number; to: number; attrs?: Attrs }

type SelectedChanges = {
  insertion: Range | false
  deletion: Range | false
  formatChange: Range | false
}

type FoundTrack = Mark | { type: string; [key: string]: unknown } | undefined

const findSelectedChanges = (state: EditorState): SelectedChanges => {
  const { selection } = state
  const selectedChanges: SelectedChanges = {
    insertion: false,
    deletion: false,
    formatChange: false,
  }

  let insertionPos: number | false = false
  let deletionPos: number | false = false
  let formatChangePos: number | false = false
  let insertionMark: FoundTrack
  let deletionMark: FoundTrack
  let formatChangeMark: FoundTrack
  let insertionSize: number | undefined
  let deletionSize: number | undefined
  let formatChangeSize: number | undefined

  const visit = (node: Node, pos: number): void => {
    if (!insertionMark) {
      insertionMark = node.attrs.track
        ? node.attrs.track.find(trackAttr => trackAttr.type === 'insertion')
        : node.marks.find(
            mark => mark.type.name === 'insertion' && !mark.attrs.approved,
          )
      if (insertionMark) {
        insertionPos = pos
        if (!node.isInline) {
          insertionSize = node.nodeSize
        }
      }
    }
    if (!deletionMark) {
      deletionMark = node.attrs.track
        ? node.attrs.track.find(trackAttr => trackAttr.type === 'deletion')
        : node.marks.find(mark => mark.type.name === 'deletion')
      if (deletionMark) {
        deletionPos = pos
        if (!node.isInline) {
          deletionSize = node.nodeSize
        }
      }
    }
    if (!formatChangeMark) {
      formatChangeMark = node.marks.find(
        mark => mark.type.name === 'format_change',
      )
      if (formatChangeMark) {
        formatChangePos = pos
        if (!node.isInline) {
          formatChangeSize = node.nodeSize
        }
      }
    }
  }

  if (selection.empty) {
    const resolvedPos = state.doc.resolve(selection.from)
    const marks = resolvedPos.marks()

    if (marks) {
      insertionMark = marks.find(
        mark => mark.type.name === 'insertion' && !mark.attrs.approved,
      )

      if (insertionMark) {
        insertionPos = selection.from
      }
      deletionMark = marks.find(mark => mark.type.name === 'deletion')

      if (deletionMark) {
        deletionPos = selection.from
      }
      formatChangeMark = marks.find(mark => mark.type.name === 'format_change')

      if (formatChangeMark) {
        formatChangePos = selection.from
      }
    }

    /* TEMP */
    state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
      visit(node, pos)
      return false
    })
    /* TILL HERE */
  } else {
    state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
      if (pos < selection.from) {
        return true
      }
      visit(node, pos)
      return false
    })
  }

  const positionOf = (
    pos: number | false,
    size: number | undefined,
    markType: string,
  ): Range =>
    size
      ? { from: pos as number, to: (pos as number) + size }
      : findMarkPosition(state, pos as number, markType)

  if (insertionMark) {
    selectedChanges.insertion = positionOf(
      insertionPos,
      insertionSize,
      'insertion',
    )
  }

  if (deletionMark) {
    selectedChanges.deletion = positionOf(deletionPos, deletionSize, 'deletion')
  }

  if (formatChangeMark) {
    selectedChanges.formatChange = positionOf(
      formatChangePos,
      formatChangeSize,
      'format_change',
    )
  }

  return selectedChanges
}

type TrackPluginState = {
  decos: DecorationSet
  trackChange?: Range
}

const trackKey = new PluginKey<TrackPluginState>('track')

const trackChangePlugin = (): Plugin<TrackPluginState> =>
  new Plugin<TrackPluginState>({
    key: trackKey,
    state: {
      init: (): TrackPluginState => ({ decos: DecorationSet.empty }),
      apply(tr, prev, oldState, state): TrackPluginState {
        const meta = tr.getMeta(trackKey)
        if (meta) {
          return meta
        }

        const {
          selection: { from, to },
        } = state

        let { decos } = trackKey.getState(oldState)
        let currentTrackSelected: Range | undefined
        decos = DecorationSet.empty
        if (tr.selectionSet) {
          const { insertion, deletion, formatChange } =
            findSelectedChanges(state)
          const decoType = (tr.selection as NodeSelection).node
            ? Decoration.node
            : Decoration.inline

          state.doc.nodesBetween(from, to, (node, pos) => {
            if (
              node.attrs.track &&
              node.attrs.track.find(
                track =>
                  track.type === 'block_change' ||
                  track.type === 'insertion' ||
                  track.type === 'deletion',
              )
            ) {
              let nodeSize = pos
              node.descendants(childNode => {
                nodeSize += childNode.nodeSize
              })
              // Active block
              node.attrs.track[0].id = node.attrs.id
              currentTrackSelected = {
                from: pos,
                to: nodeSize,
                attrs: node.attrs.track[0],
              }
              decos = decos.add(tr.doc, [
                decoType(pos, nodeSize, {
                  class: 'selected-block-change',
                }),
              ])
            }
          })

          if (insertion) {
            decos = decos.add(tr.doc, [
              decoType(insertion.from, insertion.to, {
                class: 'selected-insertion',
              }),
            ])
          }
          if (deletion) {
            decos = decos.add(tr.doc, [
              decoType(deletion.from, deletion.to, {
                class: 'selected-deletion',
              }),
            ])
          }
          if (formatChange) {
            if (from === to) currentTrackSelected = formatChange
            decos = decos.add(tr.doc, [
              decoType(formatChange.from, formatChange.to, {
                class: 'selected-format-change',
              }),
            ])
          }
        } else {
          decos = decos.map(tr.mapping, tr.doc)
        }
        return {
          trackChange: currentTrackSelected,
          decos,
        }
      },
    },
    props: {
      decorations(state): DecorationSet {
        return trackKey.getState(state).decos
      },
      handleDOMEvents: {
        focus: (): boolean => {
          // view.dispatch(deactivateAllSelectedChanges(view.state.tr));
          return false
        },
      },
    },
  })

type HideShowState = {
  createdDecorations?: DecorationSet
  allMatches?: { mark: Mark; pos: number }[]
}

const hideShowKey = new PluginKey<HideShowState>('hideShowPlugin')

const getTrackChanges = (state: EditorState): { mark: Mark; pos: number }[] => {
  const finalTracks: { mark: Mark; pos: number }[] = []

  findInlineNodes(state.doc).forEach(({ node, pos }) => {
    node.marks.forEach(mark => {
      if (
        mark.type.name === 'insertion' ||
        mark.type.name === 'deletion' ||
        mark.type.name === 'format_change'
      ) {
        finalTracks.push({ mark, pos })
      }
    })
  })

  return finalTracks
}

let showHide = false

const hideShowPlugin = (): Plugin<HideShowState> =>
  new Plugin<HideShowState>({
    key: hideShowKey,
    state: {
      init: (): HideShowState =>
        DecorationSet.empty as unknown as HideShowState,
      apply(tr, prev, _, newState): HideShowState {
        let createdDecorations = DecorationSet.empty
        const allMatches = getTrackChanges(newState)
        if (allMatches.length > 0 && showHide) {
          const decorations = allMatches
            .map(({ mark, pos }) => {
              if (mark.type.name === 'insertion') {
                const position = findMarkPosition(newState, pos, 'insertion')

                return Decoration.inline(position.from, position.to, {
                  class: 'show-insertion',
                })
              }
              if (mark.type.name === 'deletion') {
                const position = findMarkPosition(newState, pos, 'deletion')

                return Decoration.inline(position.from, position.to, {
                  class: 'hide-deletion',
                })
              }
              return undefined
            })
            .filter(Boolean)
          createdDecorations = DecorationSet.create(newState.doc, decorations)
        }
        return {
          createdDecorations,
          allMatches,
        }
      },
    },
    props: {
      decorations: (state): DecorationSet =>
        hideShowKey.getState(state)?.createdDecorations,
      setHideShow: (show: boolean): void => {
        showHide = show
      },
    } as Plugin<HideShowState>['props'],
  })

const configKey = new PluginKey<TrackChangesConfig>('trackChangesConfig')

const configPlugin = (
  initialConfig: TrackChangesConfig,
): Plugin<TrackChangesConfig> =>
  new Plugin<TrackChangesConfig>({
    key: configKey,
    state: {
      init: (): TrackChangesConfig => initialConfig,
      apply: (tr, config): TrackChangesConfig =>
        tr.getMeta(configKey) ?? config,
    },
  })

export const setTrackChangesConfig =
  (config: TrackChangesConfig): Command =>
  (state, dispatch) => {
    dispatch?.(
      state.tr.setMeta(configKey, config).setMeta('addToHistory', false),
    )
    return true
  }

const trackChanges = (
  config: TrackChangesConfig = { enabled: false },
): WaxFeature => ({
  name: 'trackChanges',
  waxMarks: {
    format_change: formatChangeSpec,
    insertion: insertionSpec,
    deletion: deletionSpec,
  },
  waxNodes: {
    title: trackedBlock('h1'),
    heading2: trackedBlock('h2'),
    heading3: trackedBlock('h3'),
    heading4: trackedBlock('h4'),
    heading5: trackedBlock('h5'),
    heading6: trackedBlock('h6'),
  },
  plugins: () => ({
    trackChangePlugin: trackChangePlugin(),
    hideShowPlugin: hideShowPlugin(),
    trackChangesConfigPlugin: configPlugin(config),
  }),
  transformTransaction: (tr, state): Transaction => {
    if (tr.getMeta(configKey)) return tr
    const { enabled, user } = configKey.getState(state) ?? { enabled: false }
    return enabled && user ? trackedTransaction(tr, state, user) : tr
  },
  sync: setTrackChangesConfig(config),
})

export default trackChanges
