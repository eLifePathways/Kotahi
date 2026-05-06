/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */

import { useEffect, useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { sanitize } from 'isomorphic-dompurify'
import { UserAvatar } from '../../../component-avatar/src'
import { sortAndGroupMessages } from '../../../../sortAndGroup'
import NextPageButton from '../../../NextPageButton'
import {
  convertTimestampToDateWithoutTimeString,
  convertTimestampToTimeString,
  convertTimestampToDateWithTimeString,
} from '../../../../shared/dateUtils'
import { CommsErrorBanner } from '../../../shared'
import VideoChat from '../VideoChat'
import EllipsisDropdown from '../EllipsisDropdown'

import ChatPostDropdown from './ChatPostDropdown'
import Tooltip from '../../../component-reporting/src/Tooltip'

import {
  Time,
  Message,
  MessageGroupContainer,
  MessagesGroup,
  GutterContainer,
  Bubble,
  InnerMessageContainer,
  Byline,
  Placeholder,
  Spinner,
  InlineTime,
  UnreadLabelContainer,
  UnreadLabel,
  DateLabelContainer,
  DateLabel,
  Ellipsis,
  EditedTimeContainer,
  EditedTime,
} from './style'

const Messages = ({
  chatRoomId,
  channelId,
  fetchMoreData,
  queryData,
  firstUnreadMessageId,
  unreadMessagesCount,
  updateChannelViewed,
  channelNotificationOption,
  toggleChannelMuteStatus,
  manuscriptId = null,
  currentUser,
}) => {
  const { loading, error, data } = queryData

  const [openDropdown, setOpenDropdown] = useState(false)
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true)

  const toggleDropdown = () => {
    setOpenDropdown(!openDropdown)
  }

  useEffect(() => {
    // when there are new messages while the user is on the page
    // update the last view timestamp for the user
    if (data?.messages) {
      updateChannelViewed({
        variables: { channelId },
      })
    }
  }, [data])
  const [activeMessageDropdownId, setActiveMessageDropdownId] = useState(null)

  const showOrToggleDropdown = messageId => {
    setShouldScrollToBottom(false)
    setActiveMessageDropdownId(prevId =>
      prevId === messageId ? null : messageId,
    )
  }

  const mainRef = useRef(null)

  const scrollToBottom = () => {
    const main = document.getElementById('messages')

    if (!main || !data || !data.messages || data.messages.length === 0) {
      return
    }

    const { scrollHeight, clientHeight } = main
    main.scrollTop = scrollHeight - clientHeight
  }

  useEffect(() => {
    // TODO: we should scroll to bottom when a new message arrives ONLY if the last message
    // was previously in view. If the user has scrolled up and a new message arrives, don't
    // scroll to bottom.
    if (shouldScrollToBottom) {
      scrollToBottom()
    }

    return () => {}
  })

  const { t } = useTranslation()

  if (loading) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />

  const messages = sortAndGroupMessages(
    data.messages.edges,
    firstUnreadMessageId,
  )

  const { hasPreviousPage } = data.messages.pageInfo

  const DateWithUnreadLabelElement = ({ message }) => (
    <UnreadLabelContainer>
      <UnreadLabel>
        {t('chat.Unread messages')}:{' '}
        {convertTimestampToDateWithoutTimeString(new Date(message.created))}
      </UnreadLabel>
    </UnreadLabelContainer>
  )

  const DateLabelElement = ({ message }) => (
    <DateLabelContainer>
      <DateLabel>
        {convertTimestampToDateWithoutTimeString(new Date(message.created))}
      </DateLabel>
    </DateLabelContainer>
  )

  const UnreadLabelElement = () => (
    <UnreadLabelContainer>
      <UnreadLabel>{t('chat.Unread messages')}</UnreadLabel>
    </UnreadLabelContainer>
  )

  const { globalRoles = [] } = currentUser
  const isAdmin = globalRoles.includes('admin')
  const isGroupAdmin = currentUser.groupRoles.includes('groupAdmin')

  // eslint-disable-next-line no-shadow
  const renderDropdownAndEllipsis = (isAdmin, message) => {
    // System-generated logs in the chat don't have <p> tags. Until we move logs out of the chat we have this hack.
    const containsParagraphTag = /<p[^>]*>.*?<\/p>/.test(message.content)

    // Too many users are currently assigned as Group Managers, and we don't want them
    // all to be able to modify other users messages; but Admin users may not have
    // access to this page; so we require that they be Admin AND Group Manager.
    if (
      ((isAdmin && isGroupAdmin) || currentUser.id === message.user.id) &&
      containsParagraphTag
    ) {
      return (
        <>
          <Ellipsis
            className="message-ellipsis"
            onClick={() => showOrToggleDropdown(message.id)}
          />
          <ChatPostDropdown
            currentUser={currentUser}
            message={message}
            onDropdownHide={() => setActiveMessageDropdownId(null)}
            show={activeMessageDropdownId === message.id}
          />
        </>
      )
    }

    return null
  }

  const MessageRenderer = ({ message }) => {
    return (
      <div dangerouslySetInnerHTML={{ __html: sanitize(message.content) }} />
    )
  }

  return (
    <MessagesGroup
      id="messages"
      ref={mainRef}
      style={{ paddingBottom: unreadMessagesCount !== 0 ? '20px' : '8px' }}
      tabIndex={-1}
    >
      {manuscriptId ? <VideoChat manuscriptId={manuscriptId} /> : ''}
      {chatRoomId ? <VideoChat manuscriptId={chatRoomId} /> : ''}
      <Ellipsis className="toggle-ellipsis-menu" onClick={toggleDropdown} />
      {openDropdown && (
        <EllipsisDropdown
          isMuted={channelNotificationOption === 'off'}
          show
          toggleChannelMuteStatus={toggleChannelMuteStatus}
          toggleDropdown={toggleDropdown}
        />
      )}

      {hasPreviousPage && (
        <NextPageButton
          fetchMore={() => fetchMoreData()}
          isFetchingMore={false}
        >
          Show previous messages
        </NextPageButton>
      )}
      {messages && !messages.length && (
        <Placeholder>{t('chat.noDiscussion')}</Placeholder>
      )}
      {messages.map(group => {
        const initialMessage = group[0]

        if (initialMessage.type === 'dateWithUnreadLabel') {
          return (
            <DateWithUnreadLabelElement
              key={initialMessage.id}
              message={initialMessage}
            />
          )
        }

        if (initialMessage.type === 'unreadLabel') {
          return <UnreadLabelElement key={initialMessage.id} />
        }

        if (initialMessage.type === 'dateLabel') {
          return (
            <DateLabelElement
              key={initialMessage.id}
              message={initialMessage}
            />
          )
        }

        return (
          <MessageGroupContainer key={initialMessage.id}>
            {group.map((message, index) => (
              <Message key={message.id}>
                <GutterContainer>
                  {index === 0 && <UserAvatar user={message.user} />}
                </GutterContainer>
                <InnerMessageContainer>
                  {index === 0 && (
                    <Byline>
                      {message.user.username}
                      <div className="message-time">
                        <Time>
                          {convertTimestampToTimeString(message.created)}
                        </Time>
                        {renderDropdownAndEllipsis(isAdmin, message)}
                      </div>
                    </Byline>
                  )}

                  <Bubble>
                    <MessageRenderer message={message} />
                    {index !== 0 && (
                      <div className="message-time">
                        <InlineTime className="message-timestamp">
                          {convertTimestampToTimeString(message.created)}
                        </InlineTime>
                        <div>{renderDropdownAndEllipsis(isAdmin, message)}</div>
                      </div>
                    )}
                  </Bubble>
                  {message.created !== message.updated && (
                    <EditedTimeContainer>
                      <EditedTime>{t('chat.Edited')}</EditedTime>
                      <Tooltip
                        className="tooltip-message"
                        content={convertTimestampToDateWithTimeString(
                          message.updated,
                        )}
                      />
                    </EditedTimeContainer>
                  )}
                </InnerMessageContainer>
              </Message>
            ))}
          </MessageGroupContainer>
        )
      })}
    </MessagesGroup>
  )
}

Messages.propTypes = {
  channelId: PropTypes.string.isRequired,
}

export default Messages
