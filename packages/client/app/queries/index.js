import { gql } from '@apollo/client'

export const CREATE_MESSAGE = gql`
  mutation createMessage($content: String, $channelId: String) {
    createMessage(content: $content, channelId: $channelId) {
      content
      user {
        username
      }
    }
  }
`
export const DELETE_MESSAGE = gql`
  mutation deleteMessage($messageId: ID!) {
    deleteMessage(messageId: $messageId) {
      id
      content
    }
  }
`

export const UPDATE_MESSAGE = gql`
  mutation updateMessage($messageId: ID!, $content: String!) {
    updateMessage(messageId: $messageId, content: $content) {
      content
    }
  }
`
export const GET_BLACKLIST_INFORMATION = gql`
  query getBlacklistInformation($email: String!, $groupId: ID!) {
    getBlacklistInformation(email: $email, groupId: $groupId) {
      id
    }
  }
`

export const GET_COAR_NOTIFICATIONS_FOR_MANUSCRIPT = gql`
  query getCoarNotificationsForManuscript($manuscriptId: ID!) {
    coarNotificationsForManuscript(manuscriptId: $manuscriptId) {
      id
      manuscriptId
      payload
      created
    }
  }
`

export const GET_EMAIL_INVITED_REVIEWERS = gql`
  query getEmailInvitedReviewers($manuscriptId: ID!) {
    getEmailInvitedReviewers(manuscriptId: $manuscriptId) {
      id
      invitedPersonName
      isShared
      status
    }
  }
`

export const UPDATE_SHARED_STATUS_FOR_INVITED_REVIEWER_MUTATION = gql`
  mutation ($invitationId: ID!, $isShared: Boolean!) {
    updateSharedStatusForInvitedReviewer(
      invitationId: $invitationId
      isShared: $isShared
    ) {
      id
      isShared
    }
  }
`
export const ADD_EMAIL_TO_BLACKLIST = gql`
  mutation ($email: String!, $groupId: ID!) {
    addEmailToBlacklist(email: $email, groupId: $groupId) {
      email
    }
  }
`

export const REFRESH_ADA_STATUS = gql`
  mutation ($id: ID!) {
    refreshAdaStatus(id: $id) {
      id
      submission
    }
  }
`

export const GET_MESSAGE_BY_ID = gql`
  query messageById($messageId: ID) {
    message(messageId: $messageId) {
      id
      content
      user {
        username
        profilePicture
      }
    }
  }
`

export const SEARCH_USERS = gql`
  query searchUsers($teamId: ID, $query: String) {
    searchUsers(teamId: $teamId, query: $query) {
      id
      username
      profilePicture
      isOnline
    }
  }
`

export const ARCHIVE_MANUSCRIPTS = gql`
  mutation ($ids: [ID!]!) {
    archiveManuscripts(ids: $ids)
  }
`

export const UNARCHIVE_MANUSCRIPTS = gql`
  mutation ($ids: [ID!]!) {
    unarchiveManuscripts(ids: $ids)
  }
`

export const DELETE_MANUSCRIPT = gql`
  mutation ($id: ID!) {
    deleteManuscript(id: $id)
  }
`

export const DELETE_MANUSCRIPTS = gql`
  mutation ($ids: [ID]!) {
    deleteManuscripts(ids: $ids)
  }
`

export const GET_MANUSCRIPTS_AND_FORM = gql`
  query Manuscripts(
    $sort: ManuscriptsSort
    $filters: [ManuscriptsFilter!]!
    $offset: Int
    $limit: Int
    $timezoneOffsetMinutes: Int
    $archived: Boolean!
    $groupId: ID!
  ) {
    paginatedManuscripts(
      sort: $sort
      filters: $filters
      offset: $offset
      limit: $limit
      timezoneOffsetMinutes: $timezoneOffsetMinutes
      archived: $archived
      groupId: $groupId
    ) {
      totalCount
      manuscripts {
        id
        shortId
        meta {
          manuscriptId
        }
        submission
        created
        updated
        firstVersionCreated
        status
        published
        teams {
          id
          role
          members {
            id
            user {
              id
              username
            }
          }
        }
        importSourceServer
        manuscriptVersions {
          id
          shortId
          meta {
            manuscriptId
          }
          submission
          created
          updated
          status
          published
          teams {
            id
            role
            members {
              id
              user {
                defaultIdentity {
                  identifier
                }
                id
                username
              }
            }
          }
          submitter {
            username
            isOnline
            defaultIdentity {
              id
              identifier
              name
            }
            id
            profilePicture
          }
          importSourceServer
        }
        submitter {
          username
          isOnline
          defaultIdentity {
            id
            identifier
            name
          }
          id
          profilePicture
        }
        searchSnippet
      }
    }

    formForPurposeAndCategory(
      purpose: "submit"
      category: "submission"
      groupId: $groupId
    ) {
      structure {
        children {
          id
          component
          name
          title
          shortDescription
          isReadOnly
          validate {
            id
            label
            value
            labelColor
            defaultValue
          }
          validateValue {
            minChars
            maxChars
            minSize
          }
          doiValidation
          doiUniqueSuffixValidation
          options {
            id
            label
            labelColor
            defaultValue
            value
          }
        }
      }
    }
  }
`

export const IMPORT_MANUSCRIPTS = gql`
  mutation ($groupId: ID!) {
    importManuscripts(groupId: $groupId)
  }
`

export const IMPORTED_MANUSCRIPTS_SUBSCRIPTION = gql`
  subscription manuscriptsImportStatus {
    manuscriptsImportStatus
  }
`

export const GET_SYSTEM_WIDE_DISCUSSION_CHANNEL = gql`
  query systemWideDiscussionChannel($groupId: ID!) {
    systemWideDiscussionChannel(groupId: $groupId) {
      id
      type
    }
  }
`

const exportFields = `
  versionIdentifier
  created
  updated
  status
  decision
  submission
  importSourceServer
  shortId
  reviews {
    created
    updated
    username
    isDecision
    isHiddenReviewerName
    isHiddenFromAuthor
    isCollaborative
    jsonData
  }
  decisions {
    created
    updated
    username
    isDecision
    isHiddenReviewerName
    isHiddenFromAuthor
    isCollaborative
    isLock
    jsonData
  }
  teams {
    # created
    # updated
    role
    displayName
    members {
      user {
        username
      }
    }
  }
`

export const GET_MANUSCRIPTS_DATA = gql`
  query getManuscriptsData($selectedManuscripts: [ID!]!) {
    getManuscriptsData(selectedManuscripts: $selectedManuscripts) {
      ${exportFields}
      manuscriptVersions {
        ${exportFields}
      }
    }
  }
`

const fileFields = `
    id
    name
    tags
    storedObjects {
      mimetype
      key
      url
      type
    }
`

const taskFields = `
id
created
updated
manuscriptId
groupId
description
title
assigneeUserId
assignee {
  id
  username
  email
  profilePicture
}
defaultDurationDays
dueDate
reminderPeriodDays
sequenceIndex
status
emailNotifications {
  id
  taskId
  recipientUserId
  recipientType
  notificationElapsedDays
  emailTemplateId
  recipientName
  recipientEmail
  recipientUser {
    id
    username
    email
  }
  sentAt
}
notificationLogs {
  id
  taskId
  senderEmail
  recipientEmail
  emailTemplateId
  content
  updated
  created
}
assigneeType
assigneeName
assigneeEmail

`

export const UPDATE_TASKS = gql`
  mutation($manuscriptId: ID, $groupId: ID!, $tasks: [TaskInput!]!) {
    updateTasks(manuscriptId: $manuscriptId, groupId: $groupId, tasks: $tasks) {
      ${taskFields}
    }
  }
`

export const UPDATE_TASK = gql`
  mutation($task: TaskInput!) {
    updateTask(task: $task) {
      ${taskFields}
    }
  }
`

export const UPDATE_TASK_NOTIFICATION = gql`
  mutation ($taskNotification: TaskEmailNotificationInput!) {
    updateTaskNotification(taskNotification: $taskNotification) {
      ${taskFields}
    }
  }
`
export const DELETE_TASK_NOTIFICATION = gql`
  mutation($id: ID!) {
    deleteTaskNotification(id: $id)
    {
      ${taskFields}
    }
  }
`
export const UPDATE_TASK_STATUS = gql`
  mutation($task: UpdateTaskStatusInput!) {
    updateTaskStatus(task: $task) {
      ${taskFields}
    }
  }
`

export const CREATE_TASK_EMAIL_NOTIFICATION_LOGS = gql`
mutation($taskEmailNotificationLog: TaskEmailNotificationLogInput!) {
  createTaskEmailNotificationLog(taskEmailNotificationLog: $taskEmailNotificationLog) {
    ${taskFields}
  }
}
`

export const GET_CONFIG = gql`
  query config($id: ID!) {
    oldConfig
    config(id: $id) {
      id
      formData
      active
      groupId
      logo {
        ${fileFields}
      }
      icon {
        ${fileFields}
      }

      logoId
    }
  }
`

export const UPDATE_CONFIG = gql`
  mutation ($id: ID!, $input: ConfigInput) {
    updateConfig(id: $id, input: $input) {
      id
      formData
      active
    }
  }
`

export const GET_EMAIL_TEMPLATES = gql`
  query {
    emailTemplates {
      id
      created
      updated
      emailTemplateType
      emailContent {
        cc
        subject
        body
        description
        ccEditors
      }
      groupId
    }
  }
`

export const GET_GROUP_BY_NAME = gql`
  query groupByName($name: String!) {
    groupByName(name: $name) {
      id
      name
      isArchived
      oldConfig
      configs {
        id
        formData
        active
      }
    }
  }
`

export const GET_GROUPS = gql`
  query groups {
    groups {
      id
      name
      isArchived
      oldConfig
      configs {
        id
        formData
        active
        logo {
          ${fileFields}
        }
        icon {
          ${fileFields}
        }
        flaxSiteUrl
    		translationOverrides
      }
    }
  }
`

export const ASSIGN_AUTHOR_FOR_PROOFING = gql`
  mutation ($id: ID!) {
    assignAuthorForProofingManuscript(id: $id) {
      id
      status
    }
  }
`

export const CREATE_FILE_MUTATION = gql`
  mutation ($file: Upload!, $meta: FileMetaInput!) {
    createFile(file: $file, meta: $meta) {
      id
      created
      name
      updated
      name
      tags
      objectId
      storedObjects {
        key
        mimetype
        url
      }
    }
  }
`

export const DELETE_FILE_MUTATION = gql`
  mutation ($id: ID!) {
    deleteFile(id: $id)
  }
`
