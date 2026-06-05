import { gql } from '@apollo/client'

export const UPDATE_INVITATION_RESPONSE = gql`
  mutation UpdateInvitationResponse(
    $id: ID!
    $responseComment: String
    $declinedReason: String
    $suggestedReviewers: [SuggestedReviewerInput]
  ) {
    updateInvitationResponse(
      id: $id
      responseComment: $responseComment
      declinedReason: $declinedReason
      suggestedReviewers: $suggestedReviewers
    ) {
      id
      responseComment
      declinedReason
      toEmail
    }
  }
`
export const GET_INVITATION_MANUSCRIPT_ID = gql`
  query InvitationManuscriptId($id: ID) {
    invitationManuscriptId(id: $id) {
      manuscriptId
      invitedPersonType
      userId
      status
    }
  }
`

export const GET_INVITATION_STATUS = gql`
  query InvitationStatus($id: ID) {
    invitationStatus(id: $id) {
      status
      userId
      manuscriptId
      invitedPersonType
      suggestedReviewers {
        firstName
        lastName
        email
        affiliation
      }
    }
  }
`

export const UPDATE_INVITATION_STATUS = gql`
  mutation UpdateInvitationStatus(
    $id: ID!
    $status: String
    $userId: ID
    $responseDate: DateTime
  ) {
    updateInvitationStatus(
      id: $id
      status: $status
      userId: $userId
      responseDate: $responseDate
    ) {
      status
      responseDate
    }
  }
`

export const GET_LOGGED_IN_USER = gql`
  query CurrentUser {
    currentUser {
      id
    }
  }
`

export const REMOVE_INVITATION = gql`
  mutation RemoveInvitation($id: ID!) {
    removeInvitation(id: $id) {
      id
      manuscriptId
      toEmail
    }
  }
`

export const UPDATE_SHARED_STATUS_FOR_INVITED_REVIEWER = gql`
  mutation UpdateSharedStatusForInvitedReviewer(
    $invitationId: ID!
    $isShared: Boolean!
  ) {
    updateSharedStatusForInvitedReviewer(
      invitationId: $invitationId
      isShared: $isShared
    ) {
      id
      isShared
    }
  }
`

export const GET_BLACKLIST_INFORMATION = gql`
  query GetBlacklistInformation($email: String!, $groupId: ID!) {
    getBlacklistInformation(email: $email, groupId: $groupId) {
      id
    }
  }
`

export const ADD_EMAIL_TO_BLACKLIST = gql`
  mutation AddEmailToBlacklist($email: String!, $groupId: ID!) {
    addEmailToBlacklist(email: $email, groupId: $groupId) {
      email
    }
  }
`
