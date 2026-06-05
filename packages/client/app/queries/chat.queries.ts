import { gql } from '@apollo/client'

export const CREATE_MESSAGE = gql`
  mutation CreateMessage($content: String, $channelId: String) {
    createMessage(content: $content, channelId: $channelId) {
      content
      user {
        username
      }
    }
  }
`
export const DELETE_MESSAGE = gql`
  mutation DeleteMessage($messageId: ID!) {
    deleteMessage(messageId: $messageId) {
      id
      content
    }
  }
`

export const UPDATE_MESSAGE = gql`
  mutation UpdateMessage($messageId: ID!, $content: String!) {
    updateMessage(messageId: $messageId, content: $content) {
      content
    }
  }
`

export const GET_SYSTEM_WIDE_DISCUSSION_CHANNEL = gql`
  query SystemWideDiscussionChannel($groupId: ID!) {
    systemWideDiscussionChannel(groupId: $groupId) {
      id
      type
    }
  }
`

export const MESSAGES = gql`
  subscription messageCreated($channelId: ID!) {
    messageCreated(channelId: $channelId) {
      id
      created
      updated
      content
      user {
        id
        username
        profilePicture
        isOnline
        defaultIdentity {
          identifier
          email
          type
          aff
          id
          name
        }
      }
    }
  }
`

export const MESSAGE_DELETED = gql`
  subscription messageDeleted($channelId: ID!) {
    messageDeleted(channelId: $channelId) {
      id
      content
    }
  }
`

export const MESSAGE_UPDATED = gql`
  subscription messageUpdated($channelId: ID!) {
    messageUpdated(channelId: $channelId) {
      id
      created
      updated
      content
      user {
        id
        username
        profilePicture
        isOnline
        defaultIdentity {
          identifier
          email
          type
          aff
          id
          name
        }
      }
    }
  }
`

export const CHANNEL_VIEWED = gql`
  mutation channelViewed($channelId: ID!) {
    channelViewed(channelId: $channelId) {
      channelId
      userId
      lastViewed
    }
  }
`

export const GET_CHANNEL_NOTIFICATION_OPTION = gql`
  query notificationOption($path: [String!]!) {
    notificationOption(path: $path) {
      userId
      objectId
      path
      groupId
      option
      objectId
    }
  }
`

export const UPDATE_CHANNEL_NOTIFICATION_OPTION = gql`
  mutation updateNotificationOption($path: [String!]!, $option: String!) {
    updateNotificationOption(path: $path, option: $option) {
      id
      created
      updated
      userId
      path
      option
      groupId
    }
  }
`

export const REPORT_USER_IS_ACTIVE = gql`
  mutation reportUserIsActive($path: [String!]!) {
    reportUserIsActive(path: $path)
  }
`

export const CHANNEL_USERS_FOR_MENTION = gql`
  query channelUsersForMention($channelId: ID!) {
    channelUsersForMention(channelId: $channelId) {
      id
      username
    }
  }
`

export const GET_MESSAGES = gql`
  query messages($channelId: ID, $before: String) {
    messages(channelId: $channelId, before: $before) {
      edges {
        id
        content
        created
        updated
        user {
          id
          username
          profilePicture
          isOnline
        }
      }
      pageInfo {
        startCursor
        hasPreviousPage
      }
      unreadMessagesCount
      firstUnreadMessageId
    }
  }
`

export const GET_UNREAD_MESSAGES_COUNT = gql`
  query UnreadMessagesCount($channelIds: [ID!]!) {
    unreadMessagesCount(channelIds: $channelIds)
  }
`

export const EXPAND_CHAT = gql`
  mutation ExpandChat($state: Boolean!) {
    expandChat(state: $state) {
      id
      chatExpanded
    }
  }
`
