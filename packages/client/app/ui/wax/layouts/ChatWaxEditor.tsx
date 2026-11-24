import { useMemo, useState, type ReactNode, type Ref } from 'react'
import type { Options } from 'prosemirror-autocomplete'
import { Send } from 'react-feather'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from '../../shared/Button'
import { WaxProvider, WaxSurface, useWax } from '../editor'
import { simulateKey } from '../features/helpers'
import { WordCount } from '../ui'
import { chatFeatures } from './featureSets'
import ToolbarButton from './shared/ChatToolbarButton'
import EditorHandle, { type EditorHandleRef } from './shared/EditorHandle'
import { SimpleToolbar } from './shared/toolbars'
import useLatest from './shared/useLatest'
import {
  ReadOnlySimpleEditorDiv,
  SimpleEditorDiv,
  SimpleGrid,
  SimpleInfoContainer,
  SimpleMenu,
} from './styles/chatStyles'

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
