import {
  useContext,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import styled, { keyframes } from 'styled-components'
import { th } from '@coko/client'

import { WaxContext } from './context'

// #region styled
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
// #endregion styled

type WaxSurfaceProps = {
  className?: string
  focusOnMount?: boolean
  readonly?: boolean
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
  focusOnMount = false,
  readonly = false,
  spellCheck = false,
}: WaxSurfaceProps): ReactNode => {
  const context = useContext(WaxContext)
  if (!context) throw new Error('WaxSurface must be used inside a WaxProvider')

  const { store, setMount } = context
  const [focusOnMountAtStart] = useState(focusOnMount)

  const view = useSyncExternalStore(
    store.subscribe,
    () => store.getSnapshot().view,
  )

  useLayoutEffect(() => {
    view?.setProps({
      attributes: attributesFor(spellCheck, className),
      editable: () => !readonly,
    })
  }, [view, spellCheck, className, readonly])

  useLayoutEffect(() => {
    if (view && focusOnMountAtStart) view.focus()
  }, [view, focusOnMountAtStart])

  return <Mount ref={setMount} />
}

export default WaxSurface
