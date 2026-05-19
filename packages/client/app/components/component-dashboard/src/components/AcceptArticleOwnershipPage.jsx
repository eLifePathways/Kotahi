/* eslint-disable react/prop-types */

import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { useQuery } from '@apollo/client/react'
import { useTranslation } from 'react-i18next'
import { Container } from '../../../shared'
import { GET_INVITATION_STATUS } from '../../../../queries/invitation'
import { ConfigContext } from '../../../config/src'
import InvitationError from './InvitationError'

const AcceptArticleOwnershipPage = ({ match }) => {
  const config = useContext(ConfigContext)
  const { t } = useTranslation()
  const { invitationId } = match.params
  const { urlFrag } = config

  const { loading, data, error } = useQuery(GET_INVITATION_STATUS, {
    variables: { id: invitationId },
  })

  if (loading) {
    return null
  }

  if (error) {
    return (
      <InvitationError
        errorHeading={t('invitationAcceptedPage.acceptError')}
        errorMessage={t(`invitationAcceptedPage.invalidInviteId`)}
      />
    )
  }

  const { status, manuscriptId, invitedPersonType } = data.invitationStatus

  if (status === 'UNANSWERED') {
    window.localStorage.setItem('invitationId', invitationId)
    return (
      <Container>
        ACCEPTING ownership of article using invitation: {invitationId}
        <br />
        <br />I will autoredirect in a few moments...
        <Navigate replace to={`${config?.urlFrag}/login`} />
      </Container>
    )
  }

  if (status === 'ACCEPTED') {
    return (
      <Navigate
        replace
        to={`${urlFrag}/versions/${manuscriptId}/${
          invitedPersonType === 'AUTHOR' ? 'submit' : 'review'
        }`}
      />
    )
  }

  if (status === 'REJECTED') {
    return (
      <InvitationError
        errorHeading={t('invitationAcceptedPage.acceptError')}
        errorMessage={t(`invitationAcceptedPage.invitedAlreadyRejected`)}
      />
    )
  }

  return <InvitationError errorHeading={t('linkExpiredPage')} />
}

export default AcceptArticleOwnershipPage
