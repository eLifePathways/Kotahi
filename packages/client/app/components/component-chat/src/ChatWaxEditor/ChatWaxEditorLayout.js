/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/display-name */

/* eslint-disable new-cap */

import React, { useContext } from 'react'
import {
  ComponentPlugin,
  WaxView,
  WaxContext,
  Commands,
} from 'wax-prosemirror-core'
import styled from 'styled-components'
import { Send } from 'react-feather'
import { useTranslation } from 'react-i18next'

import {
  SimpleGrid,
  SimpleEditorDiv,
  ReadOnlySimpleEditorDiv,
  SimpleInfoContainer,
  SimpleMenu,
} from './EditorStyles'
import 'wax-prosemirror-core/dist/index.css'
import 'wax-prosemirror-services/dist/index.css'

import { Button } from '../../../pubsweet'
import ToolbarButton from '../SuperChatInput/ToolbarButton'

const SendButton = styled(Button)`
  align-items: center;
  display: flex;
  font-size: 90%;
  justify-content: center;
  margin-left: 10px;
  min-height: 42px;
  min-width: unset;
  /* stylelint-disable-next-line declaration-no-important */
  padding: 0 !important;
  width: 50px;
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
      <SimpleGrid readonly={readonly}>
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
                onClick={onClickSend}
                primary
                title={sendTooltip}
              >
                <Send color="white" size={18} />
              </SendButton>
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
