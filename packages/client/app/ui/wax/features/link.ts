import { toggleMark } from 'prosemirror-commands'
import { InputRule } from 'prosemirror-inputrules'
import type { MarkType } from 'prosemirror-model'
import type { Command, EditorState } from 'prosemirror-state'

import { createLink, isOnSameTextBlock, markActive } from './helpers'
import type { WaxFeature, WaxMarkSpec } from './types'

const linkMark: WaxMarkSpec = {
  attrs: {
    href: { default: null },
    rel: { default: '' },
    target: { default: 'blank' },
    title: { default: null },
  },
  excludes: 'link',
  inclusive: false,
  parseDOM: [
    {
      tag: 'a[href]',
      getAttrs(hook, next): void {
        const href = hook.dom.getAttribute('href')
        const target = href && href.indexOf('#') === 0 ? '' : 'blank'
        Object.assign(hook, {
          href: hook.dom.getAttribute('href'),
          title: hook.dom.getAttribute('title'),
          target,
        })
        next()
      },
    },
  ],
  toDOM(hook, next) {
    hook.value = ['a', hook.node.attrs, 0]
    next()
  },
}

const linkPattern =
  /(?:(?:(https|http|ftp)+):\/\/)?(?:\S+(?::\S*)?(@))?(?:(?:([a-z0-9][a-z0-9-]*)?[a-z0-9]+)(?:\.(?:[a-z0-9-])*[a-z0-9]+)*(?:\.(?:[a-z]{2,})(:\d{1,5})?))(?:\/[^\s]*)?\s$/i

const linkRule = (markType: MarkType): InputRule =>
  new InputRule(linkPattern, (state, match, start, end) => {
    const $start = state.doc.resolve(start)
    if (!$start.parent.type.allowsMarkType(markType)) return null

    const linkString = match[0].substring(0, match[0].length - 1)

    const attrs =
      match[2] === '@'
        ? { href: `mailto:${linkString}` }
        : { href: linkString, target: '_blank' }

    return state.tr
      .addMark(start, end, markType.create(attrs))
      .insertText(' ', start + linkString.length)
  })

export const isLinkActive = (state: EditorState): boolean =>
  markActive(state.schema.marks.link)(state)

export const canToggleLink = (state: EditorState): boolean =>
  isOnSameTextBlock(state)

export const toggleLink: Command = (state, dispatch) => {
  if (isLinkActive(state)) {
    toggleMark(state.schema.marks.link)(state, dispatch)
    return true
  }

  if (dispatch) createLink(state, dispatch)
  return true
}

export type ActiveLink = { href: string; from: number; to: number }

export const getActiveLink = (state: EditorState): ActiveLink | null => {
  const type = state.schema.marks.link
  const { $from, $to } = state.selection
  if (!$from.sameParent($to)) return null

  let pos = $from.start()
  let current: ActiveLink | null = null
  let found: ActiveLink | null = null

  $from.parent.forEach(child => {
    const end = pos + child.nodeSize
    const mark = type.isInSet(child.marks)

    if (mark && current && current.href === mark.attrs.href) current.to = end
    else
      current = mark
        ? { href: mark.attrs.href ?? '', from: pos, to: end }
        : null

    if (current && current.from <= $from.pos && current.to >= $to.pos)
      found = current

    pos = end
  })

  return found
}

export const setLink =
  (href: string): Command =>
  (state, dispatch) => {
    const type = state.schema.marks.link
    const active = getActiveLink(state)
    const { from, to } = active ?? state.selection
    if (from === to) return false

    if (dispatch) {
      dispatch(
        state.tr
          .removeMark(from, to, type)
          .addMark(from, to, type.create({ href, target: 'blank' })),
      )
    }

    return true
  }

export const removeLink: Command = (state, dispatch) => {
  const active = getActiveLink(state)
  if (!active) return false
  if (dispatch)
    dispatch(
      state.tr.removeMark(active.from, active.to, state.schema.marks.link),
    )
  return true
}

const link: WaxFeature = {
  name: 'link',
  waxMarks: { link: linkMark },
  rules: schema => [linkRule(schema.marks.link)],
}

export default link
