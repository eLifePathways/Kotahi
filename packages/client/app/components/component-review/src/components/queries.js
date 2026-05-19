import { gql } from '@apollo/client'

const reviewFields = `
  id
  created
  updated
  jsonData
  isDecision
  isHiddenFromAuthor
  isCollaborative
  isLock
  isHiddenReviewerName
  canBePublishedPublicly
  user {
    id
    username
    profilePicture
    defaultIdentity {
      id
      identifier
    }
  }
`

const manuscriptFields = `
  id
  shortId
  created
  files {
    id
    created
    updated
    name
    tags
    storedObjects {
      key
      mimetype
      url
    }
  }
  reviews {
    ${reviewFields}
  }
  decision
  invitations {
    id
    declinedReason
    responseComment
    responseDate
    suggestedReviewers {
      firstName
      lastName
      email
      affiliation
    }
    toEmail
    invitedPersonName
    updated
    status
    invitedPersonType
    userId
    isShared
    user {
      id
      username
      profilePicture
      isOnline
      defaultIdentity {
        id
        identifier
      }
    }
  }
  teams {
    id
    displayName
    role
    objectId
    objectType
    members {
      id
      user {
        id
        username
        profilePicture
        isOnline
        email
        defaultIdentity {
          id
          name
          identifier
        }
      }
      updated
      status
      isShared
    }
  }
  status
  authorFeedback {
    text
    fileIds
    edited
    submitted
    submitter {
      username
      defaultIdentity {
        name
      }
      id
    }
    assignedAuthors {
      authorName
      assignedOnDate
    }
  }
  meta {
    manuscriptId
    source
		comments
    history {
      type
      date
    }
  }
  submission
  published
  formFieldsToPublish {
    objectId
    fieldsToPublish
  }
  tasks {
    id
    created
    updated
    manuscriptId
    description
    groupId
    title
    assignee {
      id
      username
      email
      profilePicture
    }
    assigneeUserId
    defaultDurationDays
    dueDate
    reminderPeriodDays
    sequenceIndex
    status
    assigneeType
    assigneeEmail
    assigneeName
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
  }
  
`

const formFields = `
  structure {
    name
    description
    haspopup
    popuptitle
    popupdescription
    children {
      title
      shortDescription
      id
      component
      name
      description
      doiValidation
      doiUniqueSuffixValidation
      allowFutureDatesOnly
      placeholder
      permitPublishing
      parse
      format
      options {
        id
        label
        labelColor
        defaultValue
        value
      }
      validate {
        id
        label
        value
      }
      validateValue {
        minChars
        maxChars
        minSize
      }
      isReadOnly
    }
  }
`

const teamFields = `
  id
  role
  displayName
  objectId
  objectType
  members {
    id
    user {
      id
      username
      profilePicture
      isOnline
      defaultIdentity {
        id
        identifier
      }
    }
    updated
    status
    isShared
  }
`

export const query = gql`
  query Manuscript($id: ID!, $groupId: ID!) {
    manuscript(id: $id) {
      ${manuscriptFields}
      manuscriptVersions {
        ${manuscriptFields}
      }
      channels {
        id
        type
        topic
      }
    }
    threadedDiscussions(manuscriptId: $id) {
      id
      created
      updated
      manuscriptId
      threads {
        id
        comments {
          id
          manuscriptVersionId
		  created
		  updated
		  published
          commentVersions {
            id
            author {
              id
              username
              profilePicture
            }
            comment
            created
          }
          pendingVersion {
            author {
              id
              username
              profilePicture
            }
            comment
          }
        }
      }
      userCanAddComment
      userCanEditOwnComment
      userCanEditAnyComment
    }

    submissionForm: formForPurposeAndCategory(purpose: "submit", category: "submission", groupId: $groupId) {
      ${formFields}
    }

    decisionForm: formForPurposeAndCategory(purpose: "decision", category: "decision", groupId: $groupId) {
      ${formFields}
    }

    reviewForm: formForPurposeAndCategory(purpose: "review", category: "review", groupId: $groupId) {
      ${formFields}
    }

    users {
      id
      username
      profilePicture
      isOnline
      email
      defaultIdentity {
        id
        identifier
      }
    }

    doisToRegister(id: $id)

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
      }
    }
  }
`

export const addReviewerMutation = gql`
mutation AddReviewer($manuscriptId: ID!, $userId: ID!, $isCollaborative: Boolean!) {
  addReviewer(manuscriptId: $manuscriptId, userId: $userId, isCollaborative: $isCollaborative) {
    ${teamFields}
  }
}
`

export const removeAuthorMutation = gql`
mutation RemoveAuthor($manuscriptId: ID!, $userId: ID!) {
  removeAuthor(manuscriptId: $manuscriptId, userId: $userId) {
    ${teamFields}
  }
}
`

export const removeReviewerMutation = gql`
mutation RemoveReviewer($manuscriptId: ID!, $userId: ID!) {
  removeReviewer(manuscriptId: $manuscriptId, userId: $userId) {
    ${teamFields}
  }
}
`

export const removeInvitationMutation = gql`
  mutation RemoveInvitation($id: ID!) {
    removeInvitation(id: $id) {
      id
      manuscriptId
      toEmail
    }
  }
`

export const updateReviewMutation = gql`
  mutation UpdateReview($id: ID, $input: ReviewInput) {
    updateReview(id: $id, input: $input) {
      ${reviewFields}
    }
  }
`

export const makeDecisionMutation = gql`
  mutation MakeDecision($id: ID!, $decision: String) {
    makeDecision(id: $id, decision: $decision) {
      id
      ${manuscriptFields}
    }
  }
`
export const createThreadMutation = gql`
  mutation CreateThread($id: ID!, $decision: String) {
    createThread(id: $id, decision: $decision) {
      id
    }
  }
`

export const publishManuscriptMutation = gql`
  mutation PublishManuscript($id: ID!) {
    publishManuscript(id: $id) {
      manuscript {
        id
        published
        status
      }
      steps {
        stepLabel
        succeeded
        errorMessage
      }
    }
  }
`

export const sendEmail = gql`
  mutation SendEmail($input: String!) {
    sendEmail(input: $input) {
      invitation {
        id
      }
      response {
        success
      }
    }
  }
`

export const setShouldPublishFieldMutation = gql`
  mutation SetShouldPublishField($manuscriptId: ID!, $objectId: ID!, $fieldName: String!, $shouldPublish: Boolean!) {
    setShouldPublishField(
      manuscriptId: $manuscriptId
      objectId: $objectId
      fieldName: $fieldName
      shouldPublish: $shouldPublish
    ) {
      ${manuscriptFields}
    }
  }
`

export const lockUnlockCollaborativeReviewMutation = gql`
  mutation LockUnlockCollaborativeReview($id: ID!) {
    lockUnlockCollaborativeReview(id: $id) {
      ${reviewFields}
    }
  }
`
