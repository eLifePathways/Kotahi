import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from 'react'
import { EditorState, type Transaction } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import styled, { keyframes } from 'styled-components'
import { th } from '@coko/client'

import { WaxEngineContext } from './context'
import { parse, serialize } from './htmlFormat'
import { nodeViewsPlugin } from './nodeViews'
import createPlugins from './plugins'

const cursorBlink = keyframes`
  to {
    visibility: hidden;
  }
`

const Mount = styled.div`
  /* stylelint-disable selector-class-pattern, declaration-no-important, declaration-block-no-duplicate-properties, property-no-vendor-prefix, font-family-name-quotes */
  background: #fff;
  color: #111;
  font-family: Arial;
  font-feature-settings: 'liga' 0;
  font-size: ${th('fontSizeBaseSmall')};
  font-variant-ligatures: none;
  line-height: 1.6;
  white-space: pre-wrap;
  white-space: break-spaces;
  word-wrap: break-word;
  -webkit-font-variant-ligatures: none;

  &:focus {
    outline: none;
  }

  & pre {
    white-space: pre-wrap;
  }

  & li {
    position: relative;
  }

  & *::selection {
    background-color: #c5d7fe;
    color: #000;
  }

  :where(&).ProseMirror-hideselection *::selection {
    background: transparent;
  }

  :where(&).ProseMirror-hideselection *::-moz-selection {
    background: transparent;
  }

  :where(&).ProseMirror-hideselection {
    caret-color: transparent;
  }

  :where(&) .ProseMirror-selectednode {
    outline: 2px solid #8cf;
  }

  /* Make sure li selections wrap around markers */
  :where(&) li.ProseMirror-selectednode {
    outline: none;
  }

  :where(&) li.ProseMirror-selectednode::after {
    border: 2px solid #8cf;
    bottom: -2px;
    content: '';
    left: -32px;
    pointer-events: none;
    position: absolute;
    right: -2px;
    top: -2px;
  }

  /* Protect against generic img rules */
  :where(&) img.ProseMirror-separator {
    border: none !important;
    display: inline !important;
    margin: 0 !important;
  }

  :where(&) .ProseMirror-gapcursor {
    display: none;
    pointer-events: none;
    position: relative;
  }

  :where(&) .ProseMirror-gapcursor::after {
    animation: ${cursorBlink} 1.1s steps(2, start) infinite;
    border-top: 1px solid black;
    content: '';
    display: block;
    position: relative;
    width: 20px;
  }

  :where(&).ProseMirror-focused .ProseMirror-gapcursor {
    display: block;
  }

  :where(&) .empty-node::before {
    color: #aaa;
    float: left;
    font-style: italic;
    height: 0;
    pointer-events: none;
  }

  :where(&) p.empty-node:first-child::before {
    content: attr(data-content);
  }
`

type WaxSurfaceProps = {
  className?: string
  spellCheck?: boolean
}

const attributesFor = (
  spellCheck: boolean,
  className?: string,
): Record<string, string> => ({
  spellcheck: spellCheck ? 'true' : 'false',
  ...(className ? { class: className } : {}),
})

const WaxSurface = ({
  className,
  spellCheck = false,
}: WaxSurfaceProps): ReactNode => {
  const engine = useContext(WaxEngineContext)
  if (!engine) throw new Error('WaxSurface must be used inside a WaxProvider')

  const { schema, features, nodeViews, portalStore, store, latest } = engine
  const mount = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const attributes = useRef(attributesFor(spellCheck, className))

  useLayoutEffect(() => {
    attributes.current = attributesFor(spellCheck, className)
  })

  useLayoutEffect(() => {
    const initial = latest.current

    const state = EditorState.create({
      doc: parse(schema, initial.value),
      plugins: [
        ...createPlugins({
          features,
          schema,
          placeholder: initial.placeholder,
        }),
        nodeViewsPlugin(nodeViews, portalStore),
      ],
    })

    const view: EditorView = new EditorView(
      { mount: mount.current },
      {
        state,
        editable: (): boolean => !latest.current.readonly,
        attributes: attributes.current,
        dispatchTransaction(transaction: Transaction): void {
          const current = latest.current
          const external = !!transaction.getMeta('externalUpdate')

          const tr: Transaction = external
            ? transaction
            : features.reduce(
                (next, feature) =>
                  feature.transformTransaction
                    ? feature.transformTransaction(
                        next,
                        view.state,
                        current.transactionContext,
                      )
                    : next,
                transaction,
              )

          const previous = view.state.doc
          const next = view.state.apply(tr)
          view.updateState(next)
          store.setSnapshot({ view, state: next })

          if (
            !external &&
            (!previous.eq(next.doc) || tr.getMeta('forceUpdate'))
          )
            current.onSave(serialize(schema, next.doc.content))
        },
      },
    )

    viewRef.current = view
    store.setSnapshot({ view, state })
    if (initial.focusOnMount) view.focus()

    return (): void => {
      viewRef.current = null
      store.setSnapshot({ view: undefined, state: undefined })
      view.destroy()
    }
  }, [schema, features, nodeViews, portalStore, store, latest])

  useEffect(() => {
    const view = viewRef.current
    if (view && !view.isDestroyed)
      view.setProps({ attributes: attributesFor(spellCheck, className) })
  }, [spellCheck, className])

  return <Mount ref={mount} />
}

export default WaxSurface
