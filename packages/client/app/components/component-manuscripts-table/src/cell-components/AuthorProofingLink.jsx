/* eslint-disable react/prop-types */

import { useContext } from 'react'
import PropTypes from 'prop-types'
import { useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { Action } from '../../../shared'
import { ConfigContext } from '../../../config/src'

const Container = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`

const AuthorProofingLink = props => {
  const { manuscript, urlFrag, currentUser } = props
  const history = useHistory()
  const { t } = useTranslation()
  const config = useContext(ConfigContext)

  const statusMapper = {
    new: {
      text: t('manuscriptsTable.actions.continueSubmission'),
    },
    submitted: {
      text: t('manuscriptsTable.actions.View'),
    },
    revise: {
      text: t('manuscriptsTable.actions.revise'),
    },
    revising: {
      text: t('manuscriptsTable.actions.continueRevision'),
    },
    accepted: {
      text: t('manuscriptsTable.actions.View'),
    },
    rejected: {
      text: t('manuscriptsTable.actions.View'),
    },
    published: {
      text: t('manuscriptsTable.actions.View'),
    },
    assigned: {
      text: t('manuscriptsTable.actions.View'),
    },
    inProgress: {
      text: t('manuscriptsTable.actions.View'),
    },
    completed: {
      text: t('manuscriptsTable.actions.View'),
    },
    underEmbargo: {
      text: t('manuscriptsTable.actions.View'),
    },
    embargoReleased: {
      text: t('manuscriptsTable.actions.View'),
    },
  }

  // #region action
  const actionText = statusMapper[manuscript.status]?.text

  const handleClickAction = e => {
    e.stopPropagation()
    history.push(`${urlFrag}/versions/${manuscript.id}/submit`)
  }
  // #endregion action

  // #region author-proofing
  const authorProofingEnabled = config.controlPanel?.authorProofingEnabled // let's set this based on the config
  const authorTeam = manuscript.teams.find(team => team.role === 'author')

  const sortedAuthors = authorTeam?.members
    .slice()
    .sort(
      (a, b) =>
        Date.parse(new Date(b.created)) - Date.parse(new Date(a.created)),
    )

  const show =
    authorProofingEnabled &&
    manuscript.authorFeedback.assignedAuthors?.length > 0 &&
    sortedAuthors[0]?.user?.id === currentUser.id

  let authorProofingAction = null

  if (show) {
    const handleClickAuthorProofingAction = e => {
      e.stopPropagation()
      history.push(`${urlFrag}/versions/${manuscript.id}/production`)
    }

    let authorProofingLinkText = null

    if (['assigned', 'inProgress'].includes(manuscript.status)) {
      authorProofingLinkText = t(
        'dashboardPage.mySubmissions.Provide production feedback',
      )
    }

    if (manuscript.status === 'completed') {
      authorProofingLinkText = t(
        'dashboardPage.mySubmissions.View production feedback',
      )
    }

    authorProofingAction = (
      <Action
        data-testid="author-proofing-editor"
        onClick={handleClickAuthorProofingAction}
      >
        {authorProofingLinkText}
      </Action>
    )
  }
  // #endregion author-proofing

  return (
    <Container>
      <Action onClick={handleClickAction}>{actionText}</Action>
      {authorProofingAction}
    </Container>
  )
}

AuthorProofingLink.propTypes = {
  manuscript: PropTypes.shape({
    id: PropTypes.string.isRequired,
    parentId: PropTypes.string,
  }).isRequired,
}

export default AuthorProofingLink
