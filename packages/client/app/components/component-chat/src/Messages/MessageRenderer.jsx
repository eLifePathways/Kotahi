/* eslint-disable react/display-name */

/* eslint-disable react/prop-types */

import React from 'react'
import ChatWaxEditor from '../ChatWaxEditor'

const MessageRenderer = React.memo(({ message }) => (
  <ChatWaxEditor readonly value={message.content} />
))

export default MessageRenderer
