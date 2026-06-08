import { gql } from '@apollo/client'

export const MESSAGES_SUBSCRIPTION = gql`
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

export const MESSAGE_DELETED_SUBSCRIPTION = gql`
  subscription messageDeleted($channelId: ID!) {
    messageDeleted(channelId: $channelId) {
      id
      content
    }
  }
`

export const MESSAGE_UPDATED_SUBSCRIPTION = gql`
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
  query unreadMessagesCount($channelIds: [ID!]!) {
    unreadMessagesCount(channelIds: $channelIds)
  }
`
