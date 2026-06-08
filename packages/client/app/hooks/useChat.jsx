/* eslint-disable react-hooks/exhaustive-deps, react-hooks/rules-of-hooks, react-hooks/immutability */

import { useEffect } from 'react'
import { useApolloClient, useQuery, useMutation } from '@apollo/client/react'
import { CREATE_MESSAGE, SEARCH_USERS } from '../queries'
import {
  MESSAGES_SUBSCRIPTION,
  MESSAGE_DELETED_SUBSCRIPTION,
  MESSAGE_UPDATED_SUBSCRIPTION,
  CHANNEL_VIEWED,
  GET_CHANNEL_NOTIFICATION_OPTION,
  UPDATE_CHANNEL_NOTIFICATION_OPTION,
  REPORT_USER_IS_ACTIVE,
  CHANNEL_USERS_FOR_MENTION,
  GET_UNREAD_MESSAGES_COUNT,
  GET_MESSAGES,
} from '../components/component-chat/src/Messages/queries'

const cleanSuggestionUserObject = user => {
  if (!user) return null
  return {
    ...user,
    id: user.username,
    display: user.username,
    filterName:
      (user.name && user.name.toLowerCase()) || user.username.toLowerCase(),
  }
}

const sortSuggestions = (a, b, queryString) => {
  const aUsernameIndex = a.username.indexOf(queryString || '')
  const bUsernameIndex = b.username.indexOf(queryString || '')
  const aNameIndex = a.filterName.indexOf(queryString || '')
  const bNameIndex = b.filterName.indexOf(queryString || '')
  if (aNameIndex === 0) return -1
  if (aUsernameIndex === 0) return -1
  if (aNameIndex === 0) return -1
  if (aUsernameIndex === 0) return -1
  return aNameIndex - bNameIndex || aUsernameIndex - bUsernameIndex
}

const handleMessageSubscriptionUpdate = (prev, subscriptionData, idKey) => {
  if (!subscriptionData.data) return prev

  const newData = subscriptionData.data[idKey]

  const exists = prev.messages.edges.find(({ id }) => id === newData.id)

  if (exists) return prev

  return {
    ...prev,
    messages: {
      ...prev.messages,
      edges: [...prev.messages.edges, newData],
    },
  }
}

const subscribeToNewMessages = (subscribeToMore, channelId) =>
  subscribeToMore({
    document: MESSAGES_SUBSCRIPTION,
    variables: { channelId },
    updateQuery: (prev, { subscriptionData }) =>
      handleMessageSubscriptionUpdate(prev, subscriptionData, 'messageCreated'),
  })

const subscribeToUpdatedMessage = (subscribeToMore, channelId) =>
  subscribeToMore({
    document: MESSAGE_UPDATED_SUBSCRIPTION,
    variables: { channelId },
    updateQuery: (prev, { subscriptionData }) =>
      handleMessageSubscriptionUpdate(prev, subscriptionData, 'messageUpdated'),
  })

const subscribeToDeletedMessage = (subscribeToMore, channelId) =>
  subscribeToMore({
    document: MESSAGE_DELETED_SUBSCRIPTION,
    variables: { channelId },
    updateQuery: (prev, { subscriptionData }) => {
      if (!subscriptionData.data) return prev

      const deletedId = subscriptionData.data.messageDeleted.id

      const updatedEdges = prev.messages.edges.filter(
        ({ id }) => id !== deletedId,
      )

      return {
        ...prev,
        messages: {
          ...prev.messages,
          edges: updatedEdges,
        },
      }
    },
  })

const useChat = (channels = null) => {
  const client = useApolloClient()
  const [sendChannelMessage] = useMutation(CREATE_MESSAGE)
  const [updateChannelViewed] = useMutation(CHANNEL_VIEWED)
  const [reportUserIsActiveMutation] = useMutation(REPORT_USER_IS_ACTIVE)

  const [updateNotificationOptionData] = useMutation(
    UPDATE_CHANNEL_NOTIFICATION_OPTION,
  )

  const staticSuggestion = []

  const searchUsers = async (queryString, callback) => {
    const staticSuggestions = staticSuggestion
      ? []
      : staticSuggestion
          .map(cleanSuggestionUserObject)
          .filter(Boolean)
          .filter(
            user =>
              user.username &&
              (user.username.indexOf(queryString || '') > -1 ||
                user.filterName.indexOf(queryString || '') > -1),
          )
          .sort((a, b) => sortSuggestions(a, b, queryString))
          .slice(0, 8)

    callback(staticSuggestions)

    if (!queryString || queryString.length === 0)
      return callback(staticSuggestions)

    const {
      data: { searchUsers: rawSearchUsers },
    } = await client.query({
      query: SEARCH_USERS,
      variables: {
        query: queryString,
      },
    })

    if (!rawSearchUsers || rawSearchUsers.length === 0) {
      if (staticSuggestions && staticSuggestions.length > 0)
        return staticSuggestions
      // eslint-disable-next-line consistent-return
      return
    }

    const cleanSearchUsers = rawSearchUsers.map(user =>
      cleanSuggestionUserObject(user),
    )

    // Prepend the filtered participants in case a user is tabbing down right now
    const fullResults = [...staticSuggestions, ...cleanSearchUsers]
    const uniqueResults = []
    const done = []

    fullResults.forEach(item => {
      if (done.indexOf(item.username) === -1) {
        uniqueResults.push(item)
        done.push(item.username)
      }
    })

    return callback(uniqueResults.slice(0, 8))
  }

  const sendChannelMessages = e => {
    sendChannelMessage({
      variables: e,
    })
  }

  const channelsData = channels.map(channel => {
    const channelId = channel?.id

    const {
      data: notificationOptionData,
      refetch: refetchNotificationOptionData,
    } = useQuery(GET_CHANNEL_NOTIFICATION_OPTION, {
      variables: {
        path: ['chat', channelId],
      },
      fetchPolicy: 'network-only',
      nextFetchPolicy: 'cache-first',
      skip: !channelId,
    })

    // eslint-disable-next-line consistent-return
    useEffect(() => {
      if (channelId) {
        const unsubscribeToNewMessages = subscribeToNewMessages(
          subscribeToMore,
          channelId,
        )

        const unsubscribeToUpdatedMessages = subscribeToUpdatedMessage(
          subscribeToMore,
          channelId,
        )

        const unsubscribeToDeletedMessages = subscribeToDeletedMessage(
          subscribeToMore,
          channelId,
        )

        return () => {
          unsubscribeToNewMessages()
          unsubscribeToUpdatedMessages()
          unsubscribeToDeletedMessages()
        }
      }
    }, [channelId])

    const { data: usersData } = useQuery(CHANNEL_USERS_FOR_MENTION, {
      variables: {
        channelId,
      },
      skip: !channelId,
    })

    const queryResult = useQuery(GET_MESSAGES, {
      variables: { channelId },
      fetchPolicy: 'network-only',
      nextFetchPolicy: 'cache-first',
      skip: !channelId,
    })

    const {
      data,
      subscribeToMore,
      fetchMore,
      refetch: refetchUnreadMessagesCount,
    } = queryResult

    const firstMessage = data?.messages.edges[0]
    const unreadMessagesCount = data?.messages.unreadMessagesCount

    const firstUnreadMessageId = data?.messages.firstUnreadMessageId

    const fetchMoreOptions = {
      variables: { channelId, before: firstMessage && firstMessage.id },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev
        return {
          ...prev,
          messages: {
            ...prev.messages,
            edges: [...fetchMoreResult.messages.edges, ...prev.messages.edges],
            pageInfo: fetchMoreResult.messages.pageInfo,
          },
        }
      },
    }

    const fetchMoreData = () => fetchMore(fetchMoreOptions)

    return {
      channelId,
      notificationOptionData,
      usersData,
      refetchUnreadMessagesCount,
      refetchNotificationOptionData,
      unreadMessagesCount,
      firstUnreadMessageId,
      fetchMoreOptions,
      fetchMoreData,
      queryResult,
    }
  })

  // Get the total number of unread messages from multiple channels
  const unreadMessagesQueryResult = useQuery(GET_UNREAD_MESSAGES_COUNT, {
    variables: {
      channelIds: channels.map(channel => channel?.id).filter(Boolean),
    },
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
  })

  const { refetch: reloadUnreadMessageCounts } = unreadMessagesQueryResult

  return {
    subscribeToNewMessages,
    subscribeToUpdatedMessage,
    subscribeToDeletedMessage,
    sendChannelMessage,
    updateChannelViewed,
    reportUserIsActiveMutation,
    updateNotificationOptionData,
    sendChannelMessages,
    searchUsers,
    channelsData,
    unreadMessagesQueryResult,
    reloadUnreadMessageCounts,
  }
}

export default useChat
