import { gql } from '@apollo/client'

export const UPDATE_INVITATION_RESPONSE = gql`
  mutation (
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
  query invitationManuscriptId($id: ID) {
    invitationManuscriptId(id: $id) {
      manuscriptId
      invitedPersonType
      userId
      status
    }
  }
`

export const GET_INVITATION_STATUS = gql`
  query invitationStatus($id: ID) {
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

export const GET_INVITATIONS_FOR_MANUSCRIPT = gql`
  query getInvitationsForManuscript($id: ID) {
    getInvitationsForManuscript(id: $id) {
      id
      declinedReason
      responseComment
      responseDate
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
  }
`

export const UPDATE_INVITATION_STATUS = gql`
  mutation ($id: ID!, $status: String, $userId: ID, $responseDate: DateTime) {
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
  query currentUser {
    currentUser {
      id
    }
  }
`
