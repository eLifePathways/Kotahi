import {
  chainCommands,
  deleteSelection,
  newlineInCode,
} from 'prosemirror-commands'
import { InputRule } from 'prosemirror-inputrules'
import { keymap } from 'prosemirror-keymap'
import type { MarkSpec, Node, NodeSpec, NodeType } from 'prosemirror-model'
import {
  EditorState,
  NodeSelection,
  Plugin,
  PluginKey,
  TextSelection,
  type Command,
  type Transaction,
} from 'prosemirror-state'
import { StepMap } from 'prosemirror-transform'
import {
  Decoration,
  DecorationSet,
  EditorView,
  type NodeView,
} from 'prosemirror-view'
import { mathjax } from 'mathjax-full/js/mathjax'
import { TeX } from 'mathjax-full/js/input/tex.js'
import { SVG } from 'mathjax-full/js/output/svg'
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js'
import { RegisterHTMLHandler as registerHTMLHandler } from 'mathjax-full/js/handlers/html'
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js'

import type { WaxFeature } from './types'

/**
 * A ProseMirror command for determining whether to exit a math block, based on
 * specific conditions.  Normally called when the user has
 *
 * @param outerView The main ProseMirror EditorView containing this math node.
 * @param dir Used to indicate desired cursor position upon closing a math node.
 *     When set to -1, cursor will be placed BEFORE the math node.
 *     When set to +1, cursor will be placed AFTER the math node.
 * @param borderMode An exit condition based on cursor position and direction.
 * @param requireEmptySelection When TRUE, only exit the math node when the
 *    (inner) selection is empty.
 * @returns A new ProseMirror command based on the input configuration.
 */
const collapseMathCmd =
  (
    outerView: EditorView,
    dir: number,
    requireOnBorder: boolean,
    requireEmptySelection = true,
  ): Command =>
  (innerState, dispatch) => {
    // get selection info
    const outerState = outerView.state
    const { to: outerTo, from: outerFrom } = outerState.selection
    const { to: innerTo, from: innerFrom } = innerState.selection
    // only exit math node when selection is empty
    if (requireEmptySelection && innerTo !== innerFrom) {
      return false
    }
    const currentPos = dir > 0 ? innerTo : innerFrom
    // when requireOnBorder is TRUE, collapse only when cursor
    // is about to leave the bounds of the math node
    if (requireOnBorder) {
      // (subtract two from nodeSize to account for start and end tokens)
      const nodeSize = innerState.doc.nodeSize - 2
      // early return if exit conditions not met
      if (dir > 0 && currentPos < nodeSize) {
        return false
      }
      if (dir < 0 && currentPos > 0) {
        return false
      }
    }
    // all exit conditions met, so close the math node by moving the cursor outside
    if (dispatch) {
      // set outer selection to be outside of the nodeview
      const targetPos = dir > 0 ? outerTo : outerFrom
      outerView.dispatch(
        outerState.tr.setSelection(
          TextSelection.create(outerState.doc, targetPos),
        ),
      )
      // must return focus to the outer view, otherwise no cursor will appear
      outerView.focus()
    }
    return true
  }

//
//  Create DOM adaptor and register it for HTML documents
//
const packages = AllPackages.sort().join(', ')
const adaptor = liteAdaptor()
registerHTMLHandler(adaptor)
const tex = new TeX({ packages: packages.split(/\s*,\s*/) })
const svg = new SVG({ fontCache: 'none' })
const html = mathjax.document('', { InputJax: tex, OutputJax: svg })

type MathPluginState = {
  macros: Record<string, unknown>
  activeNodeViews: MathView[]
  prevCursorPos: number
}

type MathViewOptions = {
  katexOptions?: Record<string, unknown>
  tagName?: string
}

class MathView implements NodeView {
  dom: HTMLElement

  cursorSide: 'start' | 'end' = 'start'

  private node: Node

  private outerView: EditorView

  private getPos: () => number

  private onDestroy: (() => void) | undefined

  private mathPluginKey: PluginKey<MathPluginState>

  private isEditing = false

  private katexOptions: Record<string, unknown>

  private tagName: string

  private mathRenderElt: HTMLElement | undefined

  private mathSrcElt: HTMLElement | undefined

  private innerView: EditorView | undefined

  // == Lifecycle ===================================== //
  /**
   * @param onDestroy Callback for when this NodeView is destroyed.
   *     This NodeView should unregister itself from the list of ICursorPosObservers.
   *
   * Math Views support the following options:
   * @option displayMode If TRUE, will render math in display mode, otherwise in inline mode.
   * @option tagName HTML tag name to use for this NodeView.  If none is provided,
   *     will use the node name with underscores converted to hyphens.
   */
  constructor(
    node: Node,
    view: EditorView,
    getPos: () => number,
    options: MathViewOptions,
    mathPluginKey: PluginKey<MathPluginState>,
    onDestroy?: () => void,
  ) {
    // store arguments
    this.node = node
    this.outerView = view
    this.getPos = getPos
    this.onDestroy = onDestroy && onDestroy.bind(this)
    this.mathPluginKey = mathPluginKey
    // options
    this.katexOptions = {
      globalGroup: true,
      throwOnError: false,
      ...options.katexOptions,
    }
    this.tagName = options.tagName || this.node.type.name.replace('_', '-')
    // create dom representation of nodeview
    this.dom = document.createElement(this.tagName)
    this.dom.classList.add('math-node')
    this.mathRenderElt = document.createElement('span')
    this.mathRenderElt.textContent = ''
    this.mathRenderElt.classList.add('math-render')
    this.dom.appendChild(this.mathRenderElt)
    this.mathSrcElt = document.createElement('span')
    this.mathSrcElt.classList.add('math-src')
    this.dom.appendChild(this.mathSrcElt)
    // ensure
    this.dom.addEventListener('click', () => this.ensureFocus())
    // render initial content
    this.renderMath()
  }

  destroy(): void {
    // close the inner editor without rendering
    this.closeEditor(false)
    // clean up dom elements
    if (this.mathRenderElt) {
      this.mathRenderElt.remove()
      this.mathRenderElt = undefined
    }
    if (this.mathSrcElt) {
      this.mathSrcElt.remove()
      this.mathSrcElt = undefined
    }
    this.dom.remove()
  }

  /**
   * Ensure focus on the inner editor whenever this node has focus.
   * This helps to prevent accidental deletions of math blocks.
   */
  ensureFocus(): void {
    if (this.innerView && this.outerView.hasFocus()) {
      this.innerView.focus()
    }
  }

  // == Updates ======================================= //
  update(node: Node): boolean {
    if (!node.sameMarkup(this.node)) return false
    this.node = node
    if (this.innerView) {
      const { state } = this.innerView
      const start = node.content.findDiffStart(state.doc.content)
      if (start != null) {
        const diff = node.content.findDiffEnd(state.doc.content)
        if (diff) {
          let { a: endA, b: endB } = diff
          const overlap = start - Math.min(endA, endB)
          if (overlap > 0) {
            endA += overlap
            endB += overlap
          }
          this.innerView.dispatch(
            state.tr
              .replace(start, endB, node.slice(start, endA))
              .setMeta('fromOutside', true),
          )
        }
      }
    }
    if (!this.isEditing) {
      this.renderMath()
    }
    return true
  }

  updateCursorPos(state: EditorState): void {
    const pos = this.getPos()
    const size = this.node.nodeSize
    const inPmSelection =
      state.selection.from < pos + size && pos < state.selection.to
    if (!inPmSelection) {
      this.cursorSide = pos < state.selection.from ? 'end' : 'start'
    }
  }

  // == Events ===================================== //
  selectNode(): void {
    this.dom.classList.add('ProseMirror-selectednode')
    if (!this.isEditing) {
      this.openEditor()
    }
  }

  deselectNode(): void {
    this.dom.classList.remove('ProseMirror-selectednode')
    if (this.isEditing) {
      this.closeEditor()
    }
  }

  stopEvent(event: Event): boolean {
    return (
      this.innerView !== undefined &&
      event.target !== undefined &&
      this.innerView.dom.contains(event.target as globalThis.Node)
    )
  }

  ignoreMutation(): boolean {
    return true
  }

  // == Rendering ===================================== //
  renderMath(): void {
    if (!this.mathRenderElt) {
      return
    }
    // get tex string to render
    const first = this.node.content.firstChild
    let texString = ''
    if (first && first.textContent !== null) {
      texString = first.textContent.trim()
    }
    // empty math?
    if (texString.length < 1) {
      this.dom.classList.add('empty-math')
      // clear rendered math, since this node is in an invalid state
      while (this.mathRenderElt.firstChild) {
        this.mathRenderElt.firstChild.remove()
      }
      // do not render empty math
      return
    }

    this.dom.classList.remove('empty-math')

    const rendered = html.convert(texString || '', {
      em: 16,
      ex: 8,
      containerWidth: 700,
    })

    this.mathRenderElt.innerHTML = adaptor.innerHTML(rendered)
  }

  // == Inner Editor ================================== //
  dispatchInner(tr: Transaction): void {
    if (!this.innerView) {
      return
    }
    const { state, transactions } = this.innerView.state.applyTransaction(tr)
    this.innerView.updateState(state)
    if (!tr.getMeta('fromOutside')) {
      const outerTr = this.outerView.state.tr
      const offsetMap = StepMap.offset(this.getPos() + 1)
      transactions.forEach(transaction => {
        transaction.steps.forEach(step => {
          const mapped = step.map(offsetMap)
          if (!mapped) {
            throw Error('step discarded!')
          }
          outerTr.step(mapped)
        })
      })
      if (outerTr.docChanged) this.outerView.dispatch(outerTr)
    }
  }

  openEditor(): void {
    if (this.innerView) {
      throw Error('inner view should not exist!')
    }
    // create a nested ProseMirror view
    this.innerView = new EditorView(this.mathSrcElt, {
      state: EditorState.create({
        doc: this.node,
        plugins: [
          keymap({
            Tab: (state, dispatch) => {
              if (dispatch) {
                dispatch(state.tr.insertText('\t'))
              }
              return true
            },
            Backspace: chainCommands(deleteSelection, state => {
              // default backspace behavior for non-empty selections
              if (!state.selection.empty) {
                return false
              }
              // default backspace behavior when math node is non-empty
              if (this.node.textContent.length > 0) {
                return false
              }
              // otherwise, we want to delete the empty math node and focus the outer view
              this.outerView.dispatch(this.outerView.state.tr.insertText(''))
              this.outerView.focus()
              return true
            }),
            'Ctrl-Backspace': () => {
              // delete math node and focus the outer view
              this.outerView.dispatch(this.outerView.state.tr.insertText(''))
              this.outerView.focus()
              return true
            },
            Enter: chainCommands(
              newlineInCode,
              collapseMathCmd(this.outerView, +1, false),
            ),
            'Ctrl-Enter': collapseMathCmd(this.outerView, +1, false),
            ArrowLeft: collapseMathCmd(this.outerView, -1, true),
            ArrowRight: collapseMathCmd(this.outerView, +1, true),
            ArrowUp: collapseMathCmd(this.outerView, -1, true),
            ArrowDown: collapseMathCmd(this.outerView, +1, true),
          }),
        ],
      }),
      dispatchTransaction: this.dispatchInner.bind(this),
    })
    // focus element
    const innerState = this.innerView.state
    this.innerView.focus()
    // request outer cursor position before math node was selected
    const maybePos = this.mathPluginKey.getState(
      this.outerView.state,
    )?.prevCursorPos
    if (maybePos === null || maybePos === undefined) {
      console.error(
        '[prosemirror-math] Error:  Unable to fetch math plugin state from key.',
      )
    }
    const prevCursorPos = maybePos ?? 0
    // compute position that cursor should appear within the expanded math node
    const innerPos = prevCursorPos <= this.getPos() ? 0 : this.node.nodeSize - 2
    this.innerView.dispatch(
      innerState.tr.setSelection(
        TextSelection.create(innerState.doc, innerPos),
      ),
    )
    this.isEditing = true
  }

  /**
   * Called when the inner ProseMirror editor should close.
   *
   * @param render Optionally update the rendered math after closing. (which
   *    is generally what we want to do, since the user is done editing!)
   */
  closeEditor(render = true): void {
    if (this.innerView) {
      this.innerView.destroy()
      this.innerView = undefined
    }
    if (render) {
      this.renderMath()
    }
    this.isEditing = false
  }
}

// uniquely identifies the prosemirror-math plugin
const MATH_PLUGIN_KEY = new PluginKey<MathPluginState>('prosemirror-math')

/**
 * Returns a function suitable for passing as a field in `EditorProps.nodeViews`.
 * @param displayMode TRUE for block math, FALSE for inline math.
 * @see https://prosemirror.net/docs/ref/#view.EditorProps.nodeViews
 */
const createMathView =
  (displayMode: boolean) =>
  (node: Node, view: EditorView, getPos: () => number): MathView => {
    const pluginState = MATH_PLUGIN_KEY.getState(view.state)
    if (!pluginState) {
      throw new Error('no math plugin!')
    }
    const nodeViews = pluginState.activeNodeViews
    // set up NodeView
    const nodeView = new MathView(
      node,
      view,
      getPos,
      { katexOptions: { displayMode, macros: pluginState.macros } },
      MATH_PLUGIN_KEY,
      () => {
        nodeViews.splice(nodeViews.indexOf(nodeView))
      },
    )
    nodeViews.push(nodeView)
    return nodeView
  }

const mathPlugin = new Plugin<MathPluginState>({
  key: MATH_PLUGIN_KEY,
  state: {
    init: (): MathPluginState => ({
      macros: {},
      activeNodeViews: [],
      prevCursorPos: 0,
    }),
    apply: (tr, value, oldState): MathPluginState => ({
      // these values are left unchanged
      activeNodeViews: value.activeNodeViews,
      macros: value.macros,
      // update with the second-most recent cursor pos
      prevCursorPos: oldState.selection.from,
    }),
    /** @todo (8/21/20) implement serialization for math plugin */
    // toJSON(value) { },
    // fromJSON(config, value, state){ return {}; }
  },
  props: {
    nodeViews: {
      math_inline: createMathView(false),
      math_display: createMathView(true),
    },
  },
})

const mathSelect = new PluginKey<DecorationSet>('mathSelect')

/**
 * Uses the selection to determine which math_select decorations
 * should be applied to the given document.
 * @param arg Should be either a Transaction or an EditorState,
 *     although any object with `selection` and `doc` will work.
 */
const checkSelection = (arg: EditorState | Transaction): DecorationSet => {
  const { from } = arg.selection
  const { content } = arg.selection.content()
  const result: { start: number; end: number }[] = []
  content.descendants((node, pos) => {
    if (node.type.name === 'text') {
      return false
    }
    if (node.type.name.startsWith('math_')) {
      result.push({
        start: Math.max(from + pos - 1, 0),
        end: from + pos + node.nodeSize - 1,
      })
      return false
    }
    return true
  })
  return DecorationSet.create(
    arg.doc,
    result.map(({ start, end }) =>
      Decoration.node(start, end, { class: 'math-select' }),
    ),
  )
}

/**
 * Due to the internals of KaTeX, by default, selecting rendered
 * math will put a box around each individual character of a
 * math expression.  This plugin attempts to make math selections
 * slightly prettier by instead setting a background color on the node.
 *
 * (remember to use the included math.css!)
 *
 * @todo (6/13/20) math selection rectangles are not quite even with text
 */
const mathSelectPlugin: Plugin<DecorationSet> = new Plugin<DecorationSet>({
  key: mathSelect,
  state: {
    init: (config, partialState): DecorationSet => checkSelection(partialState),
    apply: (tr, oldState): DecorationSet => {
      if (!tr.selection || !tr.selectionSet) {
        return oldState
      }
      return checkSelection(tr)
    },
  },
  props: {
    decorations: (state): DecorationSet => mathSelectPlugin.getState(state),
  },
})

const mathDisplayNode: NodeSpec = {
  group: 'block math',
  content: 'text*',
  atom: true,
  code: true,
  toDOM: () => ['math-display', { class: 'math-node' }, 0],
  parseDOM: [{ tag: 'math-display' }],
}

const mathInlineNode: NodeSpec = {
  group: 'inline math',
  content: 'text*',
  inline: true,
  atom: true,
  toDOM: () => ['math-inline', { class: 'math-node' }, 0],
  parseDOM: [{ tag: 'math-inline' }],
}

const mathSelectMark: MarkSpec = {
  toDOM: () => ['math-select', 0],
  parseDOM: [{ tag: 'math-select' }],
}

const blockRule = (pattern: RegExp, nodeType: NodeType): InputRule =>
  new InputRule(pattern, (state, match, start, end) => {
    const $start = state.doc.resolve(start)

    if (
      !$start
        .node(-1)
        .canReplaceWith($start.index(-1), $start.indexAfter(-1), nodeType)
    )
      return null

    const tr = state.tr.delete(start, end).setBlockType(start, start, nodeType)

    return tr.setSelection(
      NodeSelection.create(tr.doc, tr.mapping.map($start.pos - 1)),
    )
  })

const inlineRule = (pattern: RegExp, nodeType: NodeType): InputRule =>
  new InputRule(pattern, (state, match, start, end) => {
    const $start = state.doc.resolve(start)
    const $end = state.doc.resolve(end)

    if (!$start.parent.canReplaceWith($start.index(), $end.index(), nodeType))
      return null

    return state.tr.replaceRangeWith(
      start,
      end,
      nodeType.create(undefined, nodeType.schema.text(match[1])),
    )
  })

const math: WaxFeature = {
  name: 'math',
  nodes: {
    math_display: mathDisplayNode,
    math_inline: mathInlineNode,
  },
  marks: { math_select: mathSelectMark },
  plugins: () => ({
    mathplugin: mathPlugin,
    mathselectplugin: mathSelectPlugin,
  }),
  rules: schema => [
    blockRule(/^\$\$\s+$/, schema.nodes.math_display),
    inlineRule(/(?!\\)\$(.+)(?!\\)\$/, schema.nodes.math_inline),
  ],
}

export default math
