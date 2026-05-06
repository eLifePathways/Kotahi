import { gql } from '@apollo/client'

const reviewFields = `
  id
  created
  updated
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

export const reviewFormUpdatedSubscription = gql`
  subscription ReviewFormUpdated($formId: ID!) {
    reviewFormUpdated(formId: $formId) {
      ${reviewFields}
    }
  }
`
