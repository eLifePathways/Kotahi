/* eslint-disable react/prop-types */
/* eslint-disable jsx-a11y/no-autofocus */

import styled from 'styled-components'
import { ChatWaxEditor } from '../../../../ui/wax'
import {
  convertTimestampToDateWithTimeString,
  convertTimestampToTimeString,
} from '../../../../shared/dateUtils'
import { LooseRowSpaced } from '../../../shared'

const MessageGroupContainer = styled.div`
  padding: 4px 30px;

  @media (width >= 1200px) {
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
        <ChatWaxEditor
          autoFocus
          onChange={onChange}
          onEnterPress={onEnterPress}
          readonly={isReadOnly}
          value={message.content}
        />
      </WaxEditorContainer>
    </MessageGroupContainer>
  )
}

export default IsolatedMessageWithDetails
