/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/display-name */

/* eslint-disable new-cap */

import React, { useContext } from 'react'
import styled from 'styled-components'
import { Send } from 'react-feather'
import { useTranslation } from 'react-i18next'
import {
  ComponentPlugin,
  WaxView,
  WaxContext,
  Commands,
} from '../wax-prosemirror-core'

import {
  SimpleGrid,
  SimpleEditorDiv,
  ReadOnlySimpleEditorDiv,
  SimpleInfoContainer,
  SimpleMenu,
} from './EditorStyles'

import Button from '../../shared/Button'
import ToolbarButton from './ToolbarButton'

const SendButton = styled(Button)`
  margin-left: 10px;
`

const TopBar = ComponentPlugin('topBar')
const CounterInfo = ComponentPlugin('bottomRightInfo')

const ChatWaxEditorLayout = readonly => props => {
  const {
    pmViews: { main },
  } = useContext(WaxContext)

  const [isTopBarOpen, setIsTopBarOpen] = React.useState(false)
  const { t } = useTranslation()
  const sendTooltip = t('chat.Send') // For accessibility

  const onClickSend = () => {
    Commands.simulateKey(main, 13, 'Enter')
    main.focus()
  }

  return (
    <div>
      <SimpleGrid $readonly={readonly}>
        {readonly ? (
          <ReadOnlySimpleEditorDiv className="wax-surface-scroll">
            <WaxView {...props} />
          </ReadOnlySimpleEditorDiv>
        ) : (
          <>
            {isTopBarOpen && (
              <SimpleMenu>
                <TopBar />
              </SimpleMenu>
            )}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
              }}
            >
              <ToolbarButton
                isTopBarOpen={isTopBarOpen}
                onClick={() => setIsTopBarOpen(!isTopBarOpen)}
              />
              <SimpleEditorDiv className="wax-surface-scroll">
                <WaxView {...props} />
              </SimpleEditorDiv>
              <SendButton
                aria-label={sendTooltip}
                data-cy="chat-input-send-button"
                icon={<Send size={18} />}
                onClick={onClickSend}
                title={sendTooltip}
                type="primary"
              />
            </div>
          </>
        )}
      </SimpleGrid>
      {!readonly && (
        <SimpleInfoContainer>
          <CounterInfo />
        </SimpleInfoContainer>
      )}
    </div>
  )
}

export default ChatWaxEditorLayout
