import { gql } from '@apollo/client'

export const reviewFields = `
  id
  created
  updated
  jsonData
  isDecision
  isHiddenFromAuthor
  isHiddenReviewerName
  isCollaborative
  isLock
  canBePublishedPublicly
  isSharedWithCurrentUser
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

export const UPDATE_REVIEW = gql`
  mutation UpdateReview($id: ID, $input: ReviewInput) {
    updateReview(id: $id, input: $input) {
      ${reviewFields}
    }
  }
`

export const LOCK_UNLOCK_COLLABORATIVE_REVIEW = gql`
  mutation LockUnlockCollaborativeReview($id: ID!) {
    lockUnlockCollaborativeReview(id: $id) {
      ${reviewFields}
    }
  }
`

export const REVIEWER_RESPONSE = gql`
  mutation ReviewerResponse(
    $currentUserId: ID!
    $action: String
    $teamId: ID!
  ) {
    reviewerResponse(
      currentUserId: $currentUserId
      action: $action
      teamId: $teamId
    ) {
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
        }
        status
      }
    }
  }
`

export const REVIEW_FORM_UPDATED = gql`
  subscription ReviewFormUpdated($formId: ID!) {
    reviewFormUpdated(formId: $formId) {
      ${reviewFields}
    }
  }
`

export const NEW_REVIEW_FRAGMENT = gql`
  fragment NewReview on Review {
    id
  }
`
