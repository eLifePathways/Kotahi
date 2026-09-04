/* eslint-disable react-hooks/rules-of-hooks */

/* eslint-disable react/prop-types */

/* stylelint-disable alpha-value-notation, color-function-notation */

import React from 'react'
import styled, { css } from 'styled-components'
import { grid } from '@coko/client'
import { useLocation } from 'react-router-dom'
import { HiddenTabs } from '../../shared'
import Chat from './Chat'
import { getActiveTab } from '../../../shared/manuscriptUtils'

const MessageContainer = styled.section`
  background: rgb(255 255 255);
  display: flex;
  flex-direction: column;
  height: 100%;

  ${props =>
    props.$channels
      ? css`
          grid-template-rows: ${grid(10)} 1fr ${grid(16)};
        `
      : css`
          grid-template-rows: 1fr ${grid(16)};
        `}

  ${props =>
    props.$channels
      ? css`
          grid-template-areas:
            'channels'
            'read'
            'write';
        `
      : css`
          grid-template-areas:
            'read'
            'write';
        `}

  position: relative;
  width: 100%;
`

const chatComponent = (channelId, currentUser, chatProps) => {
  const {
    updateChannelViewed,
    reportUserIsActiveMutation,
    sendChannelMessages,
    updateNotificationOptionData,
    searchUsers,
    channelsData,
  } = chatProps

  const channelData = channelsData?.find(
    channel => channel?.channelId === channelId,
  )

  return (
    <Chat
      channelId={channelId}
      currentUser={currentUser}
      fetchMoreData={channelData?.fetchMoreData}
      firstUnreadMessageId={channelData?.firstUnreadMessageId}
      notificationOptionData={channelData?.notificationOptionData}
      queryData={channelData?.queryResult}
      reportUserIsActiveMutation={reportUserIsActiveMutation}
      searchUsers={searchUsers}
      sendChannelMessages={sendChannelMessages}
      unreadMessagesCount={channelData?.unreadMessagesCount}
      updateChannelViewed={updateChannelViewed}
      updateNotificationOptionData={updateNotificationOptionData}
      usersData={channelData?.usersData}
    />
  )
}

const Container = ({
  channelId: optionalChannelId,
  channels,
  hideChat,
  currentUser,
  chatProps,
}) => {
  const channelId = optionalChannelId ?? channels?.[0]?.id
  if (!channelId) return null

  const {
    updateChannelViewed,
    reportUserIsActiveMutation,
    fetchMoreData,
    sendChannelMessages,
    updateNotificationOptionData,
    searchUsers,
    channelsData,
  } = chatProps

  const channelData = channelsData?.find(
    channel => channel?.channelId === channelId,
  )

  const tabs =
    channels &&
    channels.map(channel => ({
      label: channel.name,
      key: channel.type,
      active: channel.active,
      content: chatComponent(channel.id, currentUser, chatProps),
    }))

  const location = useLocation()

  const activeTab = React.useMemo(
    () => getActiveTab(location, 'discussion'),
    [location],
  )

  let activeDiscussionKey = tabs && tabs.length && tabs[tabs.length - 1].key
  if (activeTab) activeDiscussionKey = activeTab

  return (
    <MessageContainer $channels={channels}>
      {tabs ? (
        <HiddenTabs
          background="colorBackgroundHue"
          defaultActiveKey={activeDiscussionKey}
          hideChat={hideChat}
          sections={tabs}
        />
      ) : (
        <Chat
          channelId={channelId}
          currentUser={currentUser}
          fetchMoreData={fetchMoreData}
          firstUnreadMessageId={channelData?.firstUnreadMessageId}
          notificationOptionData={channelData?.notificationOptionData}
          queryData={channelData?.queryResult}
          reportUserIsActiveMutation={reportUserIsActiveMutation}
          searchUsers={searchUsers}
          sendChannelMessages={sendChannelMessages}
          unreadMessagesCount={channelData?.unreadMessagesCount}
          updateChannelViewed={updateChannelViewed}
          updateNotificationOptionData={updateNotificationOptionData}
          usersData={channelData?.usersData}
        />
      )}
    </MessageContainer>
  )
}

export default Container
