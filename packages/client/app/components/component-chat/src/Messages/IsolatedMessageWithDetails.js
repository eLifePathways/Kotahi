/* eslint-disable react/prop-types */

/* eslint-disable new-cap */
/* eslint-disable jsx-a11y/no-autofocus */

import styled from 'styled-components'
import { Wax } from 'wax-prosemirror-core'
import {
  convertTimestampToDateWithTimeString,
  convertTimestampToTimeString,
} from '../../../../shared/dateUtils'
import { LooseRowSpaced } from '../../../shared'
import chatWaxEditorConfig from '../ChatWaxEditor/ChatWaxEditorConfig'
import ChatWaxEditorLayout from '../ChatWaxEditor/ChatWaxEditorLayout'

const MessageGroupContainer = styled.div`
  padding: 4px 30px;

  @media (min-width: 1200px) {
    width: 675px;
  }
`

const WaxEditorContainer = styled.div`
  font-weight: 400;
  line-height: 22px;
  margin-top: 6px;

  & > div {
    margin-right: 50px;
  }
`

const isToday = date => {
  return date.toLocaleDateString() === new Date().toLocaleDateString()
}

const IsolatedMessageWithDetails = ({ message, onChange, onEnterPress }) => {
  const isReadOnly = !onChange

  return (
    <MessageGroupContainer>
      <LooseRowSpaced>
        <b>{message.user.username}</b>
        {isToday(new Date(message.created))
          ? convertTimestampToTimeString(new Date(message.created))
          : convertTimestampToDateWithTimeString(new Date(message.created))}
      </LooseRowSpaced>
      <WaxEditorContainer>
        <Wax
          autoFocus
          config={chatWaxEditorConfig({ onEnterPress })}
          layout={ChatWaxEditorLayout(isReadOnly)}
          onChange={onChange}
          readonly={isReadOnly}
          value={message.content}
        />
      </WaxEditorContainer>
    </MessageGroupContainer>
  )
}

export default IsolatedMessageWithDetails
