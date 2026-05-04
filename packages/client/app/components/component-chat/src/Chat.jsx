/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react/prop-types */

import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { th } from '@coko/client'
import ChatInput from './SuperChatInput/SuperChatInput'
import Messages from './Messages/Messages'
import UserActivityTracker from '../../shared/UserActivityTracker'
import color from '../../../theme/color'

const ChatInputContainer = styled.div`
  position: relative;

  span.mention-tag {
    background-color: ${th('colorPrimary')};
    border-radius: 4px;
    color: ${color.white};
    padding: 2px 4px;
  }
`

export const FloatingUnreadLabelContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  position: absolute;
  top: -26px;
  width: 100%;
`
export const FloatingUnreadLabel = styled.div`
  background-color: ${th('color.brand1.tint25')};
  border-radius: 4px;
  color: #fff;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: 18px;
  padding: 2px 30px;
  position: relative;
`
export const FloatingUnreadLabelClose = styled.span`
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  padding: 2px 8px;
  position: absolute;
  right: 0;
  top: 0;
`

const Chat = ({
  channelId,
  chatRoomId,
  currentUser,
  searchUsers,
  sendChannelMessages,
  fetchMoreData,
  queryData,
  unreadMessagesCount,
  firstUnreadMessageId,
  updateChannelViewed,
  manuscriptId = null,
  reportUserIsActiveMutation,
  notificationOptionData,
  updateNotificationOptionData,
  usersData,
}) => {
  // Filter out the current user's data from all users for @-MENTION feature
  const usersForMention = (usersData?.channelUsersForMention || []).filter(
    user => user.id !== currentUser.id,
  )

  const [showFloatingUnreadLabel, setShowFloatingUnreadLabel] = useState(false)

  useEffect(() => {
    setShowFloatingUnreadLabel(!!unreadMessagesCount)
  }, [unreadMessagesCount])

  const handleFloatingUnreadLabelClose = () => {
    setShowFloatingUnreadLabel(false)
  }

  const [channelNotificationOption, setChannelNotificationOption] = useState(
    notificationOptionData?.notificationOption?.option,
  )

  useEffect(() => {
    setChannelNotificationOption(
      notificationOptionData?.notificationOption?.option,
    )
  }, [notificationOptionData])

  const toggleChannelMuteStatus = async () => {
    const newOption = channelNotificationOption === 'off' ? 'inherit' : 'off'
    setChannelNotificationOption(newOption)

    try {
      await updateNotificationOptionData({
        variables: {
          path: ['chat', channelId],
          option: newOption,
        },
      })
    } catch (error) {
      console.error('Error updating notification digest:', error)
    }
  }

  const handleReportUserIsActive = async () => {
    try {
      await reportUserIsActiveMutation({
        variables: {
          path: ['chat', channelId],
        },
      })
    } catch (error) {
      console.error('Error updating notification digest:', error)
    }
  }

  return (
    <UserActivityTracker reportUserIsActive={handleReportUserIsActive}>
      <Messages
        channelId={channelId}
        channelNotificationOption={channelNotificationOption}
        chatRoomId={chatRoomId}
        currentUser={currentUser}
        fetchMoreData={fetchMoreData}
        firstUnreadMessageId={firstUnreadMessageId}
        manuscriptId={manuscriptId}
        queryData={queryData}
        toggleChannelMuteStatus={toggleChannelMuteStatus}
        unreadMessagesCount={unreadMessagesCount}
        updateChannelViewed={updateChannelViewed}
      />
      <ChatInputContainer>
        {showFloatingUnreadLabel && (
          <FloatingUnreadLabelContainer>
            <FloatingUnreadLabel>
              <span>You have {unreadMessagesCount} unread messages</span>
              <FloatingUnreadLabelClose
                onClick={handleFloatingUnreadLabelClose}
              >
                &#215;
              </FloatingUnreadLabelClose>
            </FloatingUnreadLabel>
          </FloatingUnreadLabelContainer>
        )}
        <ChatInput
          channelId={channelId}
          currentUser={currentUser}
          mentionsList={usersForMention}
          searchUsers={searchUsers}
          sendChannelMessages={sendChannelMessages}
        />
      </ChatInputContainer>
    </UserActivityTracker>
  )
}

export default Chat
