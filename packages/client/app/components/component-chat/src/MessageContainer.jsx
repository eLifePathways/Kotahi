/* eslint-disable react-hooks/rules-of-hooks */

/* eslint-disable react/prop-types */

import React from 'react'
import { useLocation } from 'react-router-dom'
import ChatPanel from '../../../ui/shared/ChatPanel'
import Chat from './Chat'
import { getActiveTab } from '../../../shared/manuscriptUtils'

const chatComponent = (channelId, currentUser, chatProps, isOpen) => {
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
      isOpen={isOpen}
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
  currentUser,
  chatProps,
  isOpen,
  onToggle,
}) => {
  const channelId = optionalChannelId ?? channels?.[0]?.id
  if (!channelId) return null

  const items = (channels || []).map(channel => ({
    key: channel.type,
    label: channel.name,
    children: chatComponent(channel.id, currentUser, chatProps, isOpen),
  }))

  const location = useLocation()

  const activeTab = React.useMemo(
    () => getActiveTab(location, 'discussion'),
    [location],
  )

  let activeDiscussionKey = items.length && items[items.length - 1].key
  if (activeTab) activeDiscussionKey = activeTab

  return (
    <ChatPanel
      defaultActiveKey={activeDiscussionKey}
      isOpen={isOpen}
      items={items}
      onToggle={onToggle}
    />
  )
}

export default Container
