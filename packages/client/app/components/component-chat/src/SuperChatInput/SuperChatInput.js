/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */

/* eslint-disable promise/always-return */

/* eslint-disable jsx-a11y/no-autofocus */

/* eslint-disable react/prop-types */

import * as React from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'

import { Icon } from '../../../shared'
import {
  Form,
  ChatInputContainer,
  ChatInputWrapper,
  InputWrapper,
  PreviewWrapper,
  RemovePreviewButton,
} from './style'

import { useAppScroller } from '../../../../hooks/useAppScroller'
import EditorMention from './EditorMention'

const QuotedMessage = styled.div``

export const cleanSuggestionUserObject = user => {
  if (!user) return null
  return {
    ...user,
    id: user.username,
    display: user.username,
    filterName: user.name.toLowerCase(),
  }
}

const SuperChatInput = props => {
  const { sendChannelMessages, searchUsers, mentionsList } = props

  const cacheKey = `last-content-${props.channelId}`
  const [text, changeText] = React.useState('')

  const { scrollToBottom } = useAppScroller()
  const editorRef = React.useRef()

  // On mount, set the text state to the cached value if one exists
  // $FlowFixMe
  React.useEffect(() => {
    changeText(localStorage.getItem(cacheKey) || '')
    // NOTE(@mxstbr): We ONLY want to run this if we switch between threads, never else!
  }, [props.threadId])

  // Cache the latest text everytime it changes
  // $FlowFixMe
  React.useEffect(() => {
    localStorage.setItem(cacheKey, text)
  }, [text])

  const onEnterPress = () => {
    submit()
  }

  const sendMessage = ({ body }) =>
    // user is creating a new directMessageThread, break the chain
    // and initiate a new group creation with the message being sent
    // in views/directMessages/containers/newThread.js
    // if (props.threadId === 'newDirectMessageThread') {
    //   return props.createThread({
    //     messageType: file ? 'media' : 'text',
    //     file,
    //     messageBody: body,
    //   })
    // }

    sendChannelMessages({ content: body, channelId: props.channelId })

  const submit = async e => {
    if (e) e.preventDefault()

    if (!props.networkOnline) {
      console.error('No internet')
      // return props.dispatch(
      //   addToastWithTimeout(
      //     'error',
      //     'Not connected to the internet - check your internet connection or try again',
      //   ),
      // )
    }

    if (
      props.websocketConnection !== 'connected' &&
      props.websocketConnection !== 'reconnected'
    ) {
      console.error('No internet, reconnecting.')
      // return props.dispatch(
      //   addToastWithTimeout(
      //     'error',
      //     'Error connecting to the server - hang tight while we try to reconnect',
      //   ),
      // )
    }

    scrollToBottom()

    if (mediaFile) {
      setIsSendingMediaMessage(true)
      scrollToBottom()
      await sendMessage({
        file: mediaFile,
        body: '{"blocks":[],"entityMap":{}}',
      })
        .then(() => {
          setIsSendingMediaMessage(false)
          setMediaPreview(null)
          setAttachedMediaFile(null)
        })
        .catch(() => {
          setIsSendingMediaMessage(false)
          // props.dispatch(addToastWithTimeout('error', err.message))
        })
    }

    const msg = editorRef.current.getContent()

    if (msg.length === 0) return

    // workaround react-mentions bug by replacing @[username] with @username
    // @see withspectrum/spectrum#4587
    sendMessage({ body: msg.replace(/@\[([a-z0-9_-]+)\]/g, '@$1') })

    // Clear the chat input now that we're sending a message for sure
    removeQuotedMessage()
  }

  // $FlowFixMe
  // eslint-disable-next-line no-unused-vars
  const [isSendingMediaMessage, setIsSendingMediaMessage] =
    React.useState(false)

  // $FlowFixMe
  const [mediaPreview, setMediaPreview] = React.useState(null)
  // $FlowFixMe
  const [mediaFile, setAttachedMediaFile] = React.useState(null)

  const removeQuotedMessage = () => {
    // if (props.quotedMessage)
    //   props.dispatch(
    //     replyToMessage({ threadId: props.threadId, messageId: null }),
    //   )
  }

  const networkDisabled =
    !props.networkOnline ||
    (props.websocketConnection !== 'connected' &&
      props.websocketConnection !== 'reconnected')

  const { t } = useTranslation()

  return (
    <ChatInputContainer>
      <ChatInputWrapper>
        {/* {props.currentUser && (
            <MediaUploader
              currentUser={props.currentUser}
              isSendingMediaMessage={isSendingMediaMessage}
              onError={err => setPhotoSizeError(err)}
              onValidated={previewMedia}
            />
          )} */}
        <Form onSubmit={submit}>
          <InputWrapper
            hasAttachment={!!props.quotedMessage || !!mediaPreview}
            networkDisabled={networkDisabled}
          >
            {mediaPreview && (
              <PreviewWrapper>
                <img alt="" src={mediaPreview} />
                <RemovePreviewButton onClick={() => setMediaPreview(null)}>
                  <Icon glyph="view-close-small" size="16" />
                </RemovePreviewButton>
              </PreviewWrapper>
            )}
            {props.quotedMessage && (
              <PreviewWrapper data-cy="staged-quoted-message">
                <QuotedMessage
                  id={props.quotedMessage}
                  threadId={props.threadId}
                />
                <RemovePreviewButton
                  data-cy="remove-staged-quoted-message"
                  onClick={removeQuotedMessage}
                >
                  <Icon glyph="view-close-small" size="16" />
                </RemovePreviewButton>
              </PreviewWrapper>
            )}
            <EditorMention
              autoFocus
              editorRef={editorRef}
              field={{
                name: 'comment',
              }}
              hasAttachment={!!props.quotedMessage || !!mediaPreview}
              id={`comment-editor-${props.channelId}`}
              mentionsList={mentionsList}
              networkDisabled={networkDisabled}
              onEnterPress={onEnterPress}
              placeholder={t('chat.Your message here...')}
              searchUsersCallBack={searchUsers} // props.participants is currently undefined
              staticSuggestions={props.participants}
            />
          </InputWrapper>
        </Form>
      </ChatInputWrapper>
    </ChatInputContainer>
  )
}

SuperChatInput.defaultProps = {
  networkOnline: true,
  websocketConnection: 'connected',
}

// const map = (state, ownProps) => ({
//   websocketConnection: state.connectionStatus.websocketConnection,
//   networkOnline: state.connectionStatus.networkOnline,
//   quotedMessage: state.message.quotedMessage[ownProps.threadId] || null,
// })

// export default compose(
//   withCurrentUser,
//   sendMessage,
//   sendDirectMessage,
//   // $FlowIssue
//   connect(map)
// )(ChatInput)

export default SuperChatInput
