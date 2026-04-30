/* eslint-disable react-hooks/exhaustive-deps, react-hooks/immutability, react-hooks/set-state-in-effect */

import { useEffect, useContext, useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import { Redirect } from 'react-router-dom'

import {
  ASSIGN_USER_AS_AUTHOR,
  ASSIGN_USER_AS_REVIEWER,
} from '../../../../queries/team'
import {
  GET_INVITATION_MANUSCRIPT_ID,
  GET_LOGGED_IN_USER,
  UPDATE_INVITATION_STATUS,
} from '../../../../queries/invitation'
import mutations from '../graphql/mutations'
import { ConfigContext } from '../../../config/src'
import { LinkAction, Spinner } from '../../../shared'
import InvitationError from './InvitationError'

const InvitationAcceptedPage = () => {
  const [errorMessage, setErrorMessage] = useState(null)
  const [redirectLink, setRedirectLink] = useState(null)

  const config = useContext(ConfigContext)
  const { t } = useTranslation()
  const { urlFrag } = config

  const invitationId = window.localStorage.getItem('invitationId')
    ? window.localStorage.getItem('invitationId')
    : ''

  const { data, error } = useQuery(GET_INVITATION_MANUSCRIPT_ID, {
    variables: { id: invitationId },
  })

  const { data: loggedInUserData } = useQuery(GET_LOGGED_IN_USER)
  const loggedInUserId = loggedInUserData?.currentUser?.id

  const [updateInvitationStatus] = useMutation(UPDATE_INVITATION_STATUS, {
    onCompleted: () => {
      localStorage.removeItem('invitationId')
      window.location.href = `${urlFrag}/dashboard`
    },
  })

  const currentDate = new Date()

  const [assignUserAsAuthor] = useMutation(ASSIGN_USER_AS_AUTHOR, {
    onCompleted: () => {
      updateInvitationStatus({
        variables: {
          id: invitationId,
          status: 'ACCEPTED',
          userId: loggedInUserId,
          responseDate: currentDate,
        },
      })
    },
    onError: () => {
      localStorage.removeItem('invitationId')
      setErrorMessage('assignAuthorFailed')
    },
  })

  const [assignUserAsReviewer] = useMutation(ASSIGN_USER_AS_REVIEWER, {
    onCompleted: teamFields => {
      addReviewerResponse({
        variables: {
          currentUserId: loggedInUserId,
          action: 'accepted',
          teamId: teamFields?.addReviewer?.id,
        },
      })
    },
  })

  const [addReviewerResponse] = useMutation(
    mutations.reviewerResponseMutation,
    {
      onCompleted: () => {
        updateInvitationStatus({
          variables: {
            id: invitationId,
            status: 'ACCEPTED',
            userId: loggedInUserId,
            responseDate: currentDate,
          },
        })
      },
      onError: () => {
        localStorage.removeItem('invitationId')
        setErrorMessage('assignReviewerFailed')
      },
    },
  )

  let manuscriptId

  useEffect(() => {
    if (data && loggedInUserId) {
      const {
        invitedPersonType,
        isShared,
        userId: invitedUserId,
        status,
      } = data.invitationManuscriptId

      manuscriptId = data.invitationManuscriptId.manuscriptId

      if (invitedUserId && invitedUserId !== loggedInUserId) {
        setErrorMessage('invalidUser')
        return
      }

      if (status === 'REJECTED') {
        setErrorMessage('invitedAlreadyRejected')
        return
      }

      if (status === 'ACCEPTED') {
        localStorage.removeItem('invitationId')
        setRedirectLink(
          `${urlFrag}/versions/${manuscriptId}/${
            invitedPersonType === 'AUTHOR' ? 'submit' : 'review'
          }`,
        )
      }

      if (invitedPersonType === 'AUTHOR') {
        assignUserAsAuthor({
          variables: { manuscriptId, userId: loggedInUserId, invitationId },
        })
      }

      if (invitedPersonType === 'REVIEWER') {
        assignUserAsReviewer({
          variables: {
            manuscriptId,
            userId: loggedInUserId,
            invitationId,
            isCollaborative: false,
            isShared: !!isShared,
          },
        })
      }

      if (invitedPersonType === 'COLLABORATIVE_REVIEWER') {
        assignUserAsReviewer({
          variables: {
            manuscriptId,
            userId: loggedInUserId,
            invitationId,
            isCollaborative: true,
            isShared: !!isShared,
          },
        })
      }
    }
  }, [data, loggedInUserId])

  if (error) {
    setErrorMessage('invalidInviteId')
  }

  if (redirectLink) {
    return <Redirect to={redirectLink} />
  }

  if (errorMessage) {
    localStorage.removeItem('invitationId')
    return (
      <InvitationError
        errorHeading={t('invitationAcceptedPage.acceptError')}
        errorMessage={t(`invitationAcceptedPage.${errorMessage}`)}
        link={
          <LinkAction to={`${urlFrag}/dashboard`}>
            {t('invitationAcceptedPage.returnToDashboard')}
          </LinkAction>
        }
      />
    )
  }

  return <Spinner />
}

export default InvitationAcceptedPage
