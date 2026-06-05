import { gql } from '@apollo/client'

const discussionFields = `
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
`

export const GET_THREADED_DISCUSSIONS = gql`
  query GetThreadedDiscussions($manuscriptId: ID!) {
    threadedDiscussions(manuscriptId: $manuscriptId) {
      ${discussionFields}
    }
  }
`

export const UPDATE_PENDING_COMMENT = gql`
  mutation(
    $manuscriptId: ID!
    $threadedDiscussionId: ID!
    $threadId: ID!
    $commentId: ID!
    $comment: String
    $manuscriptVersionId: ID
  ) {
    updatePendingComment(
      manuscriptId: $manuscriptId
      threadedDiscussionId: $threadedDiscussionId
      threadId: $threadId
      commentId: $commentId
      comment: $comment
      manuscriptVersionId: $manuscriptVersionId
    ) {
      ${discussionFields}
    }
  }
`

export const COMPLETE_COMMENTS = gql`
  mutation($threadedDiscussionId: ID!) {
    completeComments(
      threadedDiscussionId: $threadedDiscussionId
    ) {
      ${discussionFields}
    }
  }
`

export const COMPLETE_COMMENT = gql`
  mutation($threadedDiscussionId: ID!, $threadId: ID!, $commentId: ID!) {
    completeComment(
      threadedDiscussionId: $threadedDiscussionId,
      threadId: $threadId,
      commentId: $commentId
    ) {
      ${discussionFields}
    }
  }
`

export const DELETE_PENDING_COMMENT = gql`
  mutation($threadedDiscussionId: ID!, $threadId: ID!, $commentId: ID!) {
    deletePendingComment(
      threadedDiscussionId: $threadedDiscussionId,
      threadId: $threadId,
      commentId: $commentId
    ) {
      ${discussionFields}
    }
  }
`

export const CREATE_THREAD = gql`
  mutation CreateThread($id: ID!, $decision: String) {
    createThread(id: $id, decision: $decision) {
      id
    }
  }
`
