/* eslint-disable react-hooks/immutability */

/* eslint-disable promise/catch-or-return, promise/always-return */

import { useEffect, useState, useContext } from 'react'
import { useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import {
  useApolloClient,
  useMutation,
  useQuery,
  useSubscription,
} from '@apollo/client/react'
import { set, debounce } from 'lodash'
import { useTranslation } from 'react-i18next'
import { ConfigContext } from '../../../config/src'
import { AccessErrorPage, CommsErrorBanner, Spinner } from '../../../shared'
import DecisionVersions from './DecisionVersions'
import { roles } from '../../../../globals'
import { waxAiToolSystem } from '../../../component-production/helpers'
import { useCurrentUser } from '../../../../pages/hooks/useCurrentUser'

import {
  ADD_REVIEWER,
  MAKE_DECISION,
  PUBLISH_MANUSCRIPT,
  MANUSCRIPT_FOR_REVIEW,
  REMOVE_AUTHOR,
  REMOVE_REVIEWER,
  REMOVE_INVITATION,
  SEND_EMAIL,
  SET_SHOULD_PUBLISH_FIELD,
  UPDATE_REVIEW,
  LOCK_UNLOCK_COLLABORATIVE_REVIEW,
  ASSIGN_AUTHOR_FOR_PROOFING,
  CREATE_MESSAGE,
  CREATE_TASK_EMAIL_NOTIFICATION_LOGS,
  DELETE_TASK_NOTIFICATION,
  GET_BLACKLIST_INFORMATION,
  GET_COAR_NOTIFICATIONS_FOR_MANUSCRIPT,
  REFRESH_ADA_STATUS,
  UPDATE_SHARED_STATUS_FOR_INVITED_REVIEWER,
  UPDATE_TASK,
  UPDATE_TASKS,
  UPDATE_TASK_NOTIFICATION,
  COMPLETE_COMMENT,
  COMPLETE_COMMENTS,
  DELETE_PENDING_COMMENT,
  UPDATE_PENDING_COMMENT,
  UPDATE_MANUSCRIPT,
  CREATE_TEAM,
  UPDATE_TEAM_MEMBER,
  UPDATE_COLLABORATIVE_TEAM_MEMBER,
  UPDATE_TEAM,
  CREATE_FILE,
  DELETE_FILE,
  CHAT_GPT,
  REVIEW_FORM_UPDATED,
  NEW_REVIEW_FRAGMENT,
  NEW_TEAM_FRAGMENT,
  CREATED_TEAM_FRAGMENT,
  UPDATE_ADA,
} from '../../../../queries'

import { validateDoi, validateSuffix } from '../../../../shared/commsUtils'

import useChat from '../../../../hooks/useChat'

import { getCurrentUserReview } from './review/util'
import { getRoles } from '../../../../shared/manuscriptUtils'

let debouncers = {}

const DecisionPage = () => {
  const params = useParams()
  const manuscriptId = params.version

  const { t } = useTranslation()
  // start of code from submit page to handle possible form changes
  const client = useApolloClient()
  const config = useContext(ConfigContext)
  const { urlFrag } = config

  const { refetch } = useQuery(CHAT_GPT, {
    fetchPolicy: 'network-only',
    skip: true,
  })

  const currentUser = useCurrentUser()

  useEffect(() => {
    return () => {
      Object.values(debouncers).forEach(d => d.flush())
      debouncers = {}
    }
  }, [])

  const handleChange = (value, path, versionId) => {
    const manuscriptDelta = {} // Only the changed fields
    set(manuscriptDelta, path, value)
    debouncers[path] = debouncers[path] || debounce(updateManuscript, 3000)
    return debouncers[path](versionId, manuscriptDelta)
  }

  // end of code from submit page to handle possible form changes

  const {
    loading,
    data: currentData,
    error,
    refetch: refetchManuscript,
  } = useQuery(MANUSCRIPT_FOR_REVIEW, {
    variables: {
      id: manuscriptId,
      groupId: config.groupId,
    },
  })

  const data = currentData

  let editorialChannel, allChannel

  // Protect if channels don't exist for whatever reason
  if (
    Array.isArray(data?.manuscript.channels) &&
    data?.manuscript.channels.length
  ) {
    editorialChannel = data?.manuscript.channels.find(
      c => c.type === 'editorial',
    )
    allChannel = data?.manuscript.channels.find(c => c.type === 'all')
  }

  const {
    hideDiscussionFromAuthors,
    hideDiscussionFromEditorsReviewersAuthors,
  } = config?.discussionChannel || {}

  const hideAuthorChat =
    hideDiscussionFromAuthors || hideDiscussionFromEditorsReviewersAuthors

  const channels = [
    ...(hideAuthorChat
      ? []
      : [
          {
            id: allChannel?.id,
            name: t('chat.Discussion with author'),
            type: allChannel?.type,
          },
        ]),
    ...(hideDiscussionFromEditorsReviewersAuthors
      ? []
      : [
          {
            id: editorialChannel?.id,
            name: t('chat.Editorial discussion'),
            type: editorialChannel?.type,
          },
        ]),
  ]

  const chatProps = useChat(channels)

  const [selectedEmail, setSelectedEmail] = useState('')
  const [externalEmail, setExternalEmail] = useState('')

  const inputEmail = externalEmail || selectedEmail || ''

  const blacklistInfoQuery = useQuery(GET_BLACKLIST_INFORMATION, {
    variables: {
      email: inputEmail,
      groupId: config.groupId,
    },
  })

  const selectedEmailIsBlacklisted =
    !!blacklistInfoQuery.data?.getBlacklistInformation?.length

  const {
    data: coarData,
    loading: coarLoading,
    refetch: refetchCoar,
  } = useQuery(GET_COAR_NOTIFICATIONS_FOR_MANUSCRIPT, {
    variables: { manuscriptId },
  })

  const [sendEmailMutation] = useMutation(SEND_EMAIL)

  const [doUpdateManuscript] = useMutation(UPDATE_MANUSCRIPT)
  const [doSendChannelMessage] = useMutation(CREATE_MESSAGE)
  const [makeDecision] = useMutation(MAKE_DECISION)
  const [publishManuscript] = useMutation(PUBLISH_MANUSCRIPT)
  const [updateTeam] = useMutation(UPDATE_TEAM)
  const [createTeam] = useMutation(CREATE_TEAM, {
    update(cache, { data: { createTeam: newTeam } }) {
      cache.modify({
        id: cache.identify({ __typename: 'Manuscript', id: newTeam.objectId }),
        fields: {
          teams: existingRefs => {
            const ref = cache.writeFragment({
              data: newTeam,
              fragment: CREATED_TEAM_FRAGMENT,
            })
            return [...existingRefs, ref]
          },
        },
      })
    },
  })
  const [updateTeamMember] = useMutation(UPDATE_TEAM_MEMBER)

  const [updateCollaborativeTeamMember] = useMutation(
    UPDATE_COLLABORATIVE_TEAM_MEMBER,
  )

  const [doUpdateReview] = useMutation(UPDATE_REVIEW)
  const [createFile] = useMutation(CREATE_FILE)
  const [updatePendingComment] = useMutation(UPDATE_PENDING_COMMENT)
  const [completeComments] = useMutation(COMPLETE_COMMENTS)
  const [completeComment] = useMutation(COMPLETE_COMMENT)
  const [deletePendingComment] = useMutation(DELETE_PENDING_COMMENT)
  const [setShouldPublishField] = useMutation(SET_SHOULD_PUBLISH_FIELD)
  const [updateAda] = useMutation(UPDATE_ADA)

  const [lockUnlockReview] = useMutation(LOCK_UNLOCK_COLLABORATIVE_REVIEW, {
    update: async (cache, { data: { lockUnlockCollaborativeReview } }) => {
      cache.modify({
        id: cache.identify({
          __typename: 'Review',
          id: lockUnlockCollaborativeReview.id,
        }),
        fields: {
          isLock() {
            return lockUnlockCollaborativeReview.isLock
          },
        },
      })

      const team =
        data.manuscript.teams.find(
          tm =>
            tm.objectId === data.manuscript.id &&
            tm.objectType === 'manuscript' &&
            tm.role === 'collaborativeReviewer',
        ) || {}

      if (team.members) {
        team.members.forEach(member => {
          cache.modify({
            id: cache.identify({
              __typename: 'TeamMember',
              id: member.id,
            }),
            fields: {
              status() {
                return lockUnlockCollaborativeReview.isLock
                  ? 'closed'
                  : 'inProgress'
              },
            },
          })
        })
      }
    },
  })

  const [assignAuthorForProofing] = useMutation(ASSIGN_AUTHOR_FOR_PROOFING, {
    update: (cache, { data: { assignAuthorForProofingManuscript } }) => {
      cache.modify({
        id: cache.identify({
          __typename: 'Manuscript',
          id: assignAuthorForProofingManuscript.id,
        }),
        fields: {
          status: () => assignAuthorForProofingManuscript.status,
          authorFeedback: () =>
            assignAuthorForProofingManuscript.authorFeedback,
        },
      })
    },
  })

  const [updateSharedStatusForInvitedReviewer] = useMutation(
    UPDATE_SHARED_STATUS_FOR_INVITED_REVIEWER,
  )

  const [addReviewer] = useMutation(ADD_REVIEWER, {
    update: (cache, { data: { addReviewer: revisedReviewersObject } }) => {
      cache.modify({
        id: cache.identify({
          __typename: 'Manuscript',
          id: revisedReviewersObject.objectId,
        }),
        fields: {
          teams(existingTeamRefs = []) {
            const newTeamRef = cache.writeFragment({
              data: revisedReviewersObject,
              fragment: NEW_TEAM_FRAGMENT,
            })

            return [...existingTeamRefs, newTeamRef]
          },
        },
      })
    },
  })

  const [removeAuthor] = useMutation(REMOVE_AUTHOR)
  const [removeReviewer] = useMutation(REMOVE_REVIEWER)

  const [removeInvitation] = useMutation(REMOVE_INVITATION, {
    update: (cache, { data: { removeInvitation: removeRevisedObject } }) => {
      cache.modify({
        id: cache.identify({
          __typename: 'Manuscript',
          id: removeRevisedObject.manuscriptId,
        }),
        fields: {
          invitations(existingInvitationRefs, { readField }) {
            return existingInvitationRefs.filter(
              ref => readField('id', ref) !== removeRevisedObject.id,
            )
          },
        },
      })
    },
  })

  const [createTaskEmailNotificationLog] = useMutation(
    CREATE_TASK_EMAIL_NOTIFICATION_LOGS,
  )

  const [updateTask] = useMutation(UPDATE_TASK)

  const [updateTaskNotification] = useMutation(UPDATE_TASK_NOTIFICATION)

  const [deleteTaskNotification] = useMutation(DELETE_TASK_NOTIFICATION)

  const [updateTasks] = useMutation(UPDATE_TASKS, {
    update(cache, { data: { updateTasks: updatedTasks } }) {
      if (updatedTasks.length) {
        cache.modify({
          id: cache.identify({
            __typename: 'Manuscript',
            id: updatedTasks[0].manuscriptId,
          }),
          fields: {
            tasks() {
              return updatedTasks
            },
          },
        })
      }
    },
  })

  const [deleteFile] = useMutation(DELETE_FILE, {
    update(cache, { data: { deleteFile: fileToDelete } }) {
      const id = cache.identify({
        __typename: 'File',
        id: fileToDelete,
      })

      cache.evict({ id })
    },
  })

  const [refreshAdaStatus] = useMutation(REFRESH_ADA_STATUS)

  // Count In the Collaborative Reviews and choose the correct one.
  const currentUserReview = currentUser
    ? getCurrentUserReview(data?.manuscript, currentUser)
    : {}

  useSubscription(REVIEW_FORM_UPDATED, {
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
    }) => {
      const {
        data: {
          manuscript: { reviews },
        },
      } = await client.query({
        query: MANUSCRIPT_FOR_REVIEW,
        variables: {
          id: manuscriptId,
          groupId: config.groupId,
        },
        partialRefetch: true,
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

  const queryAI = input => {
    const [userInput, highlightedText] = input.text

    const formattedInput = {
      text: [`${userInput}.\nHighlighted text: ${highlightedText}`],
    }

    return new Promise(resolve => {
      refetch({
        system: waxAiToolSystem,
        input: formattedInput,
        groupId: config.groupId,
      }).then(({ data: { openAi } }) => {
        const {
          message: { content },
        } = JSON.parse(openAi)

        resolve(content)
      })
    })
  }

  if ((loading && !data) || !currentUser) return <Spinner />

  if (error) {
    if (error.graphQLErrors?.find(e => e.message === 'Not Authorised!')) {
      return <AccessErrorPage message={t('decisionPage.unauthorized')} />
    }

    return <CommsErrorBanner error={error} />
  }

  const refetchData = async () => {
    await refetchManuscript()
    await refetchCoar()
  }

  const updateManuscript = (versionId, manuscriptDelta) =>
    doUpdateManuscript({
      variables: {
        id: versionId,
        input: JSON.stringify(manuscriptDelta),
      },
    })

  const unpublish = (versionId, manuscriptDelta) =>
    doUpdateManuscript({
      variables: {
        id: versionId,
        input: JSON.stringify({
          ...manuscriptDelta,
          status: 'unpublished',
          published: null,
        }),
      },
    })

  const updateReview = async (reviewId, reviewData, id) => {
    doUpdateReview({
      variables: {
        id: reviewId || undefined,
        input: reviewData,
      },
      update: (cache, { data: { updateReview: updatedReview } }) => {
        cache.modify({
          id: cache.identify({
            __typename: 'Manuscript',
            id,
          }),
          fields: {
            /* eslint-disable-next-line default-param-last */
            reviews(existingReviewRefs = [], { readField }) {
              const newReviewRef = cache.writeFragment({
                data: updatedReview,
                fragment: NEW_REVIEW_FRAGMENT,
              })

              if (
                existingReviewRefs.some(
                  ref => readField('id', ref) === updatedReview.id,
                )
              ) {
                return existingReviewRefs
              }

              return [...existingReviewRefs, newReviewRef]
            },
          },
        })
      },
    })
  }

  const {
    manuscript,
    submissionForm,
    decisionForm: decisionFormOuter,
    reviewForm: reviewFormOuter,
    users,
    threadedDiscussions,
    doisToRegister,
    emailTemplates,
  } = data

  const { coarNotificationsForManuscript } = coarData ?? {}

  const currentUserRoles = getRoles(manuscript, currentUser.id)

  if (
    !(
      currentUser.groupRoles.includes('groupManager') ||
      currentUser.groupRoles.includes('groupAdmin') ||
      ['seniorEditor', 'handlingEditor', 'editor'].some(editorRole =>
        currentUserRoles.includes(editorRole),
      )
    )
  ) {
    return <AccessErrorPage message={t('decisionPage.unauthorized')} />
  }

  const form = submissionForm?.structure ?? {
    name: '',
    children: [],
    description: '',
    haspopup: 'false',
  }

  const decisionForm = decisionFormOuter?.structure ?? {
    name: '',
    children: [],
    description: '',
    haspopup: 'false',
  }

  const reviewForm = reviewFormOuter?.structure ?? {
    name: '',
    children: [],
    description: '',
    haspopup: 'false',
  }

  const sendNotifyEmail = async emailData => {
    const response = await sendEmailMutation({
      variables: {
        input: JSON.stringify(emailData),
      },
    })

    await refetchData()

    return response
  }

  const handleCreateTeam = async createTeamVariables => {
    return await createTeam(createTeamVariables)
  }

  const sendChannelMessage = async messageData => {
    const response = await doSendChannelMessage({
      variables: messageData,
    })

    return response
  }

  /** This will only send the modified field, not the entire review object */
  const updateReviewJsonData = (
    reviewId,
    value,
    path,
    isDecision,
    manuscriptVersionId,
  ) => {
    const reviewDelta = {} // Only the changed fields
    // E.g. if path is 'submission.$title' and value is 'Foo' this gives { submission: { $title: 'Foo' } }
    set(reviewDelta, path, value)

    const reviewPayload = {
      isDecision,
      jsonData: JSON.stringify(reviewDelta),
      manuscriptId: manuscriptVersionId,
      userId: currentUser.id,
    }

    updateReview(reviewId, reviewPayload, manuscriptVersionId)
  }

  const handleCompleteComment = async options => {
    await completeComment(options)
    await refetchData()
  }

  const handlePublishManuscript = async options => {
    const res = await publishManuscript(options)
    await refetchData()
    return res
  }

  const threadedDiscussionProps = {
    threadedDiscussions,
    updatePendingComment,
    completeComment: handleCompleteComment,
    completeComments,
    deletePendingComment,
    currentUser,
    firstVersionManuscriptId: manuscript.parentId || manuscript.id,
  }

  return (
    <DecisionVersions
      addReviewer={addReviewer}
      allUsers={users}
      assignAuthorForProofing={assignAuthorForProofing}
      canHideReviews={config?.controlPanel?.hideReview}
      channels={channels}
      chatProps={chatProps}
      coarMessages={coarNotificationsForManuscript}
      createFile={createFile}
      createTaskEmailNotificationLog={createTaskEmailNotificationLog}
      createTeam={handleCreateTeam}
      currentUser={currentUser}
      decisionForm={decisionForm}
      deleteFile={deleteFile}
      deleteTaskNotification={deleteTaskNotification}
      displayShortIdAsIdentifier={
        config?.controlPanel?.displayManuscriptShortId
      }
      dois={doisToRegister}
      emailTemplates={emailTemplates}
      externalEmail={externalEmail}
      form={form}
      handleChange={handleChange}
      hideChat={hideAuthorChat && hideDiscussionFromEditorsReviewersAuthors}
      isCoarLoading={coarLoading}
      lockUnlockReview={lockUnlockReview}
      makeDecision={makeDecision}
      manuscript={manuscript}
      onRefreshAdaStatus={refreshAdaStatus}
      publishManuscript={handlePublishManuscript}
      queryAI={queryAI}
      refetch={() => {
        refetchData()
      }}
      removeAuthor={removeAuthor}
      removeInvitation={removeInvitation}
      removeReviewer={removeReviewer}
      reviewers={data?.manuscript?.reviews}
      reviewForm={reviewForm}
      roles={roles}
      selectedEmail={selectedEmail}
      selectedEmailIsBlacklisted={selectedEmailIsBlacklisted}
      sendChannelMessage={sendChannelMessage}
      sendNotifyEmail={sendNotifyEmail}
      setExternalEmail={setExternalEmail}
      setSelectedEmail={setSelectedEmail}
      setShouldPublishField={setShouldPublishField}
      teamLabels={config.teams}
      teams={data?.manuscript?.teams}
      threadedDiscussionProps={threadedDiscussionProps}
      unpublish={unpublish}
      updateAda={updateAda}
      updateCollaborativeTeamMember={updateCollaborativeTeamMember}
      updateManuscript={updateManuscript}
      updateReview={updateReview}
      updateReviewJsonData={updateReviewJsonData}
      updateSharedStatusForInvitedReviewer={
        updateSharedStatusForInvitedReviewer
      }
      updateTask={updateTask}
      updateTaskNotification={updateTaskNotification}
      updateTasks={updateTasks}
      updateTeam={updateTeam}
      updateTeamMember={updateTeamMember}
      urlFrag={urlFrag}
      validateDoi={validateDoi(client)}
      validateSuffix={validateSuffix(client, config.groupId)}
    />
  )
}

DecisionPage.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      version: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
}

export default DecisionPage
