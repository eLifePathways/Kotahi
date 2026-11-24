import { useMemo, useState, type ReactNode, type Ref } from 'react'
import type { Options } from 'prosemirror-autocomplete'
import { Send } from 'react-feather'
import { useTranslation } from 'react-i18next'
import styled, { css, type RuleSet } from 'styled-components'
import { th } from '@coko/client'

import Button from '../../shared/Button'
import { WaxProvider, WaxSurface, useWax } from '../editor'
import { simulateKey } from '../features/helpers'
import { WordCount } from '../ui'
import featureStyles from '../ui/featureStyles'
import { chatFeatures } from './featureSets'
import ToolbarButton from './shared/ChatToolbarButton'
import EditorHandle, { type EditorHandleRef } from './shared/EditorHandle'
import { SimpleToolbar } from './shared/toolbars'
import useLatest from './shared/useLatest'

/* stylelint-disable string-quotes, declaration-block-no-redundant-longhand-properties */

/* All styles regarding ProseMirror surface and elements */

const chatElements = css`
  /* stylelint-disable selector-class-pattern */
  ${featureStyles}

  h1 {
    font-size: 1.75em;
    font-weight: 500;
    margin: 1em 0;
  }

  h2 {
    font-size: 1.625em;
    font-weight: 500;
    margin: 1em 0;
  }

  h3 {
    font-size: 1.5em;
    font-weight: 500;
    margin: 1em 0;
  }

  h4 {
    font-size: 1.375em;
    font-weight: 500;
    margin: 1em 0;
  }

  h5 {
    font-size: 1.25em;
    font-weight: 500;
    margin: 1em 0;
  }

  h6 {
    font-size: 1.125em;
    font-weight: 500;
    margin: 1em 0;
  }

  /* JATS */

  section.frontmatter {
    background-color: rgb(255 0 0 / 25%);
    border: 1px solid red;
    margin-bottom: 8px;
    padding: 8px 16px;
    position: relative;

    &::before {
      color: white;
      content: 'FRONT MATTER';
      font-weight: bold;
      left: 2px;
      letter-spacing: 1px;
      position: absolute;
      top: -4px;
    }
  }

  section.abstractSection {
    background-color: rgb(255 0 0 / 25%);
    border: 1px solid red;
    margin-bottom: 8px;
    padding: 8px 16px;
    position: relative;

    &::before {
      color: white;
      content: 'ABSTRACT';
      font-weight: bold;
      left: 2px;
      letter-spacing: 1px;
      position: absolute;
      top: -4px;
    }
  }

  section.reflist {
    background-color: rgb(25 25 112 / 25%);
    border: 1px solid midnightblue;
    margin-bottom: 8px;
    padding: 8px 16px;
    position: relative;

    &::before {
      color: white;
      content: 'REFERENCE LIST';
      font-weight: bold;
      left: 2px;
      letter-spacing: 1px;
      position: absolute;
      top: -4px;
    }

    & p:not(.ref),
    & li {
      &::before {
        content: '§ ';
      }
    }
  }

  section.acknowledgementsSection {
    background-color: rgb(255 255 0 / 25%);
    border: 1px solid red;
    margin-bottom: 8px;
    padding: 8px 16px;
    position: relative;

    &::before {
      color: black;
      content: 'ACKNOWLEDGEMENTS';
      font-weight: bold;
      left: 2px;
      letter-spacing: 1px;
      position: absolute;
      top: -4px;
    }
  }

  section.appendix {
    background-color: rgb(0 128 128 / 25%);
    border: 1px solid teal;
    margin-bottom: 8px;
    padding: 8px 16px;
    position: relative;

    &::before {
      color: white;
      content: 'APPENDIX';
      font-weight: bold;
      left: 2px;
      letter-spacing: 1px;
      position: absolute;
      top: -4px;
    }
  }

  /* added for figure weirdness */

  figure {
    border: 1px solid ${th('color.brand1.base')};
    margin-bottom: 1rem;
    margin-top: 1.5rem;
    padding: 1rem;
    position: relative;
  }

  figure::before {
    color: ${th('color.brand1.base')};
    content: 'Figure:';
    font-size: 75%;
    left: 0;
    letter-spacing: 0.5px;
    position: absolute;
    text-transform: uppercase;
    top: -1.25rem;
  }

  figure:hover::before {
    content: 'Click to add a caption';
  }

  figcaption {
    border: 1px solid ${th('color.brand1.base')};
    margin-top: 1rem;
    padding: 1rem;
    position: relative;
  }

  figcaption::before {
    color: ${th('color.brand1.base')};
    content: 'Caption:';
    font-size: 75%;
    left: 0;
    letter-spacing: 0.5px;
    position: absolute;
    text-transform: uppercase;
    top: -1.25rem;
  }

  .ProseMirror p:first-child,
  .ProseMirror h1:first-child,
  .ProseMirror h2:first-child,
  .ProseMirror h3:first-child,
  .ProseMirror h4:first-child,
  .ProseMirror h5:first-child,
  .ProseMirror h6:first-child {
    margin-top: 0;
  }

  /* stylelint-disable-next-line selector-type-no-unknown */
  .ProseMirror fakecursor {
    /* stylelint-disable-next-line declaration-no-important */
    visibility: hidden !important;
  }
`

// these are for the simple editor

const SimpleGrid = styled.div<{ $readonly?: boolean }>`
  display: grid;
  grid-template-areas: 'menu' 'editor';

  ${(props): RuleSet =>
    props.$readonly
      ? css`
          grid-template-rows: 0 1fr;
        `
      : css`
          grid-template-rows: minmax(40px, auto) 1fr;
        `}
`

const SimpleMenu = styled.div`
  border-top: 1px solid ${th('color.gray90')};
  display: flex;
  flex-wrap: wrap;
  left: -12px;
  user-select: none;
  /* _______________________                                              */
  /* |__100%_MENU__|_______|                                              */
  /* |             | SEND  | <- Send Button                               */
  /* |             | 50px  |                                              */
  /* |---------------------|                                              */
  /* |_____________________|                                              */
  /*     ^-- Adding 50px to 100% Menu Makes it occupy the whole container */
  width: calc(100% + 50px);
  z-index: 1;

  /* TODO: this no longer works! */
  button[title='Special Characters'] + div {
    bottom: 34px;
    left: -372px;
    top: initial;
  }

  /* stylelint-disable-next-line selector-class-pattern */
  .Dropdown-menu {
    bottom: 38px;
    top: initial;
  }

  :focus-within {
    z-index: 1000;
  }
`

const SimpleEditorDiv = styled.div`
  border: 1px solid ${th('color.gray60')};
  border-radius: ${th('borderRadius')};
  grid-area: editor;
  margin-top: 8px;
  max-height: 60vh;
  overflow: auto;
  padding: 9px;
  width: 100%;

  /* SimpleEditorDiv contains - TWO <divs />   */
  /* 1. Div for Input                          */
  /* 2. Div for Wax Overlay                    */
  /* We select the 2nd div                     */
  /* Place the WaxOverlay above the link icon  */
  /* stylelint-disable-next-line no-descending-specificity */
  & > div:nth-child(2) {
    left: 0;
    top: -60px;
  }

  p {
    /* stylelint-disable-next-line declaration-no-important */
    margin-bottom: 0 !important;
  }

  &:focus-within {
    border: 1px solid ${th('color.brand1.base')};
  }

  .error & {
    border: 1px solid ${th('colorError')};
  }

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${chatElements}
`

const ReadOnlySimpleEditorDiv = styled.div`
  grid-area: editor;
  position: relative;

  /* stylelint-disable-next-line no-descending-specificity */
  & > div {
    height: unset; /* overrides the height: 100% set by Wax, which can be insufficient for content */
  }

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${chatElements}
`

const SimpleInfoContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-end;
  width: 100%;

  div:focus-within > & {
    z-index: 1000;
  }
`

const SendButton = styled(Button)`
  margin-left: 10px;
`

const Row = styled.div`
  align-items: flex-end;
  display: flex;
`

const SendMessage = (): ReactNode => {
  const { t } = useTranslation()
  const view = useWax(s => s.view)
  const label = t('chat.Send')

  return (
    <SendButton
      aria-label={label}
      data-cy="chat-input-send-button"
      icon={<Send size={18} />}
      onClick={(): void => {
        if (!view) return
        simulateKey(view, 13, 'Enter')
        view.focus()
      }}
      title={label}
      type="primary"
    />
  )
}

export type ChatWaxEditorProps = {
  value?: string
  validationStatus?: string
  readonly?: boolean
  autoFocus?: boolean
  onChange?: (html: string) => void
  placeholder?: string
  spellCheck?: boolean
  onEnterPress?: (html: string) => void
  editorRef?: Ref<EditorHandleRef>
  autoCompleteReducer?: Options['reducer']
  editorType?: string
}

const ChatWaxEditor = ({
  value = '',
  validationStatus,
  readonly = false,
  autoFocus = false,
  onChange,
  placeholder = '',
  spellCheck = false,
  onEnterPress,
  editorRef,
  autoCompleteReducer,
  editorType,
}: ChatWaxEditorProps): ReactNode => {
  const [isTopBarOpen, setIsTopBarOpen] = useState(false)
  const latest = useLatest({ onEnterPress, autoCompleteReducer })

  const features = useMemo(
    () =>
      chatFeatures({
        onEnterPress: (html): void => latest.current?.onEnterPress?.(html),
        autoCompleteReducer: (action): boolean =>
          Boolean(latest.current?.autoCompleteReducer?.(action)),
      }),
    [latest],
  )

  return (
    <div className={validationStatus}>
      <WaxProvider
        features={features}
        focusOnMount={autoFocus}
        onChange={onChange}
        placeholder={placeholder}
        readonly={readonly}
        value={value}
      >
        <EditorHandle editorRef={editorRef} />
        <SimpleGrid $readonly={readonly}>
          {readonly ? (
            <ReadOnlySimpleEditorDiv className="wax-surface-scroll">
              <WaxSurface className={editorType} spellCheck={spellCheck} />
            </ReadOnlySimpleEditorDiv>
          ) : (
            <>
              {isTopBarOpen ? (
                <SimpleMenu>
                  <SimpleToolbar />
                </SimpleMenu>
              ) : null}
              <Row>
                <ToolbarButton
                  isTopBarOpen={isTopBarOpen}
                  onClick={(): void => setIsTopBarOpen(!isTopBarOpen)}
                />
                <SimpleEditorDiv className="wax-surface-scroll">
                  <WaxSurface className={editorType} spellCheck={spellCheck} />
                </SimpleEditorDiv>
                <SendMessage />
              </Row>
            </>
          )}
        </SimpleGrid>
        {!readonly ? (
          <SimpleInfoContainer>
            <WordCount />
          </SimpleInfoContainer>
        ) : null}
      </WaxProvider>
    </div>
  )
}

export default ChatWaxEditor
