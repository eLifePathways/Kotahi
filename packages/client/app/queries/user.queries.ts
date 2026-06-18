import { gql } from '@apollo/client'

export const SEARCH_USERS = gql`
  query SearchUsers($teamId: ID, $query: String) {
    searchUsers(teamId: $teamId, query: $query) {
      id
      username
      profilePicture
      isOnline
    }
  }
`

export const CURRENT_USER = gql`
  query CurrentUser {
    currentUser {
      id
      profilePicture
      username
      globalRoles
      groupRoles
      email
      recentTab
      menuPinned
      preferredLanguage
      chatExpanded
      defaultIdentity {
        identifier
        email
        type
        aff
        id
      }
      isOnline
    }
    builtCss {
      css
    }
    userHasTaskAlerts
  }
`

export const GET_USER = gql`
  query User($id: ID) {
    user(id: $id) {
      id
      username
      profilePicture
      isOnline
      email
      globalRoles
      groupRoles
      defaultIdentity {
        identifier
        email
        type
        aff
        id
      }
    }
  }
`

export const GET_USERS = gql`
  query Users($sort: UsersSort, $offset: Int, $limit: Int) {
    paginatedUsers(sort: $sort, offset: $offset, limit: $limit) {
      totalCount
      users {
        id
        username
        globalRoles
        groupRoles
        email
        profilePicture
        defaultIdentity {
          id
          identifier
        }
        created
        isOnline
        lastOnline
      }
    }
  }
`

export const GET_ALL_USERS = gql`
  query AllUsers {
    users {
      id
      username
      email
      defaultIdentity {
        id
        name
      }
    }
  }
`

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID) {
    deleteUser(id: $id) {
      id
    }
  }
`

export const UPDATE_EMAIL = gql`
  mutation UpdateEmail($id: ID!, $email: String!) {
    updateEmail(id: $id, email: $email) {
      success
      error
      user {
        id
        email
      }
    }
  }
`

export const UPDATE_USERNAME = gql`
  mutation UpdateUsername($id: ID!, $username: String!) {
    updateUsername(id: $id, username: $username) {
      id
      username
    }
  }
`

export const UPDATE_LANGUAGE = gql`
  mutation UpdateLanguage($id: ID!, $preferredLanguage: String!) {
    updateLanguage(id: $id, preferredLanguage: $preferredLanguage) {
      id
      preferredLanguage
    }
  }
`

export const GET_GLOBAL_CHAT_NOTIFICATION_OPTION = gql`
  query NotificationOption {
    notificationOption(path: ["chat"]) {
      userId
      path
      groupId
      option
    }
  }
`

export const UPDATE_GLOBAL_CHAT_NOTIFICATION_OPTION = gql`
  mutation UpdateNotificationOption($option: String!) {
    updateNotificationOption(path: ["chat"], option: $option) {
      id
      created
      updated
      userId
      path
      option
      objectId
    }
  }
`
