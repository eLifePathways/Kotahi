/* eslint-disable react/prop-types */

import { useContext } from 'react'
import PropTypes from 'prop-types'
import { useMutation, useQuery, useSubscription, gql } from '@apollo/client'
import { Redirect } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ConfigContext } from '../../../config/src'
import ReviewLayout from './review/ReviewLayout'
import { AccessErrorPage, Heading, Page, Spinner } from '../../../shared'
import manuscriptVersions from '../../../../shared/manuscript_versions'
import {
  UPDATE_PENDING_COMMENT,
  COMPLETE_COMMENTS,
  COMPLETE_COMMENT,
  DELETE_PENDING_COMMENT,
} from '../../../component-formbuilder/src/components/builderComponents/ThreadedDiscussion/queries'
import { UPDATE_REVIEWER_STATUS_MUTATION } from '../../../../queries/team'
import useChat from '../../../../hooks/useChat'
import mutations from '../../../component-dashboard/src/graphql/mutations'
import { reviewFormUpdatedSubscription } from './reviewSubscriptions'

import { getCurrentUserReview } from './review/util'

const createFileMutation = gql`
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

const deleteFileMutation = gql`
  mutation ($id: ID!) {
    deleteFile(id: $id)
  }
`

const reviewFields = `
  id
  created
  updated
  jsonData
  isDecision
  isHiddenReviewerName
  isCollaborative
  isLock
  canBePublishedPublicly
  isSharedWithCurrentUser
  user {
    id
    username
    defaultIdentity {
      id
      identifier
    }
  }
`

const fragmentFields = `
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
      }
      status
      isShared
    }
  }
  status
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
`

const formStructure = `
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
      hideFromReviewers
    }
  }
`

const query = gql`
  query($id: ID!, $groupId: ID) {
    manuscript(id: $id) {
      parentId
      ${fragmentFields}
      manuscriptVersions {
        ${fragmentFields}
      }
      channels {
        id
        type
        topic
      }
    }

    versionsOfManuscriptCurrentUserIsReviewerOf(manuscriptId: $id)

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
      ${formStructure}
    }

    reviewForm: formForPurposeAndCategory(purpose: "review", category: "review", groupId: $groupId) {
      ${formStructure}
    }

    decisionForm: formForPurposeAndCategory(purpose: "decision", category: "decision", groupId: $groupId) {
      ${formStructure}
    }
  }
`

const updateReviewMutationQuery = gql`
  mutation($id: ID, $input: ReviewInput) {
    updateReview(id: $id, input: $input) {
      ${reviewFields}
    }
  }
`

const ReviewPage = ({ currentUser, history, match }) => {
  const { t } = useTranslation()
  const config = useContext(ConfigContext)

  const { urlFrag } = config
  const [updateReviewMutation] = useMutation(updateReviewMutationQuery)
  const [updateReviewerStatus] = useMutation(UPDATE_REVIEWER_STATUS_MUTATION)
  const [createFile] = useMutation(createFileMutation)
  const [updatePendingComment] = useMutation(UPDATE_PENDING_COMMENT)
  const [completeComments] = useMutation(COMPLETE_COMMENTS)
  const [completeComment] = useMutation(COMPLETE_COMMENT)
  const [deletePendingComment] = useMutation(DELETE_PENDING_COMMENT)
  const [chatExpand] = useMutation(mutations.updateChatUI)

  const [deleteFile] = useMutation(deleteFileMutation, {
    update(cache, { data: { deleteFile: fileToDelete } }) {
      const id = cache.identify({
        __typename: 'File',
        id: fileToDelete,
      })

      cache.evict({ id })
    },
  })

  const { loading, error, data } = useQuery(query, {
    variables: {
      id: match.params.version,
      groupId: config.groupId,
    },
    partialRefetch: true,
  })

  // Count In the Collaborative Reviews and choose the correct one.
  const currentUserReview = getCurrentUserReview(data?.manuscript, currentUser)

  useSubscription(reviewFormUpdatedSubscription, {
    variables: {
      formId: currentUserReview.id,
    },
    skip: loading || !currentUserReview.isCollaborative,
    onSubscriptionData: async ({
      subscriptionData: {
        data: {
          reviewFormUpdated: { id },
        },
      },
      client,
    }) => {
      const {
        data: {
          manuscript: { reviews },
        },
      } = await client.query({
        query,
        variables: {
          id: match.params.version,
          groupId: config.groupId,
        },
        fetchPolicy: 'network-only',
      })

      const objectId = client.cache.identify({
        __typename: 'Review',
        id,
      })

      const reviewFormUpdated = reviews.find(rv => rv.id === id)

      client.cache.modify({
        id: objectId,
        fields: {
          jsonData() {
            return reviewFormUpdated.jsonData
          },
        },
      })
    },
  })

  let editorialChannelId

  if (
    Array.isArray(data?.manuscript.channels) &&
    data?.manuscript.channels.length
  ) {
    const editorialChannel = data?.manuscript.channels.find(
      c => c.type === 'editorial',
    )

    editorialChannelId = editorialChannel?.id
  }

  const {
    hideDiscussionFromReviewers,
    hideDiscussionFromEditorsReviewersAuthors,
  } = config?.discussionChannel || {}

  const hideReviewerChat =
    hideDiscussionFromReviewers || hideDiscussionFromEditorsReviewersAuthors

  const channels = [
    ...(hideReviewerChat
      ? []
      : [
          {
            id: editorialChannelId,
            name: t('chat.Discussion with editorial team'),
            type: 'editorial',
          },
        ]),
  ]

  const chatProps = useChat(channels)

  if (loading || currentUser === null) return <Spinner />

  if (error) {
    console.warn(error.message)
    return (
      <Page>
        <Heading>This review is no longer accessible.</Heading>
      </Page>
    )
  }

  const { manuscript, threadedDiscussions } = data
  // We shouldn't arrive at this page with a subsequent/child manuscript ID. If we do, redirect to the parent/original ID
  if (manuscript.parentId)
    return <Redirect to={`${urlFrag}/versions/${manuscript.parentId}/review`} />

  if (!data.versionsOfManuscriptCurrentUserIsReviewerOf.length)
    return <AccessErrorPage message={t('reviewPage.unauthorized')} />

  const versions = manuscriptVersions(manuscript)

  const submissionForm = data.submissionForm?.structure ?? {
    name: '',
    children: [],
    description: '',
    haspopup: 'false',
  }

  const reviewForm = data.reviewForm?.structure ?? {
    name: '',
    children: [],
    description: '',
    haspopup: 'false',
  }

  const decisionForm = data.decisionForm?.structure ?? {
    name: '',
    children: [],
    description: '',
    haspopup: 'false',
  }

  const channelId = manuscript.channels.find(c => c.type === 'editorial')?.id
  if (!channelId)
    console.error(
      `Malformed channels in manuscript ${manuscript.id}:`,
      manuscript.channels,
    )

  const threadedDiscussionProps = {
    threadedDiscussions,
    updatePendingComment,
    completeComment,
    completeComments,
    deletePendingComment,
    currentUser,
    firstVersionManuscriptId: manuscript.parentId || manuscript.id,
  }

  return (
    <ReviewLayout
      channelId={channelId}
      channels={channels}
      chatExpand={chatExpand}
      chatProps={chatProps}
      createFile={createFile}
      currentUser={currentUser}
      currentUserReview={currentUserReview}
      decisionForm={decisionForm}
      deleteFile={deleteFile}
      hideChat={hideReviewerChat}
      history={history}
      reviewForm={reviewForm}
      submissionForm={submissionForm}
      threadedDiscussionProps={threadedDiscussionProps}
      updateReviewerStatus={updateReviewerStatus}
      updateReviewMutation={updateReviewMutation}
      versions={versions}
      versionsOfManuscriptCurrentUserIsReviewerOf={
        data.versionsOfManuscriptCurrentUserIsReviewerOf
      }
    />
  )
}

ReviewPage.propTypes = {
  currentUser: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
  // match: ReactRouterPropTypes.match.isRequired,
  // history: ReactRouterPropTypes.history.isRequired,
}

export default ReviewPage
