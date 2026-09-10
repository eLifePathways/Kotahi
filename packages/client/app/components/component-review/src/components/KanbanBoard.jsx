/* eslint-disable react/prop-types */
/* eslint-disable no-constant-binary-expression */

/* stylelint-disable alpha-value-notation, color-function-notation */

import styled from 'styled-components'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { AdminSection } from './style'
import {
  SectionContent,
  SectionHeader,
  SectionRow,
  Title,
} from '../../../shared'
import ReviewersDeclined from './ReviewersDeclined'
import { getMembersOfTeam } from '../../../../shared/manuscriptUtils'
import KanbanCard from './reviewers/KanbanCard'
import { findReviewFromReviewer } from './reviewers/util'
import ReviewerStatus from '../../../../ui/shared/ReviewerStatus'
import { reviewerStatusValues } from '../../../../ui/shared/_constants'

const Kanban = styled.div.attrs({
  'data-testid': 'kanban',
})`
  align-items: stretch;
  display: flex;
  margin: 15px 7.5px;
  min-height: 300px;
`

const Column = styled.div(({ $columns }) => ({
  alignItems: 'flex-start',
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  marginInline: '7.5px',
  /* stylelint-disable-next-line scss/operator-no-unspaced */
  width: `calc(${100 / $columns ?? 4}% - 15px)`,
}))

const CardsWrapper = styled.div.attrs({
  'data-testid': 'kanban-cards-wrapper',
})`
  background-color: #f8f8f9;
  border-radius: 8px;
  height: 100%;
  margin-top: 8px;
  width: 100%;
`

const BoardStatusHeader = styled.div`
  display: flex;
  justify-content: space-between;
`

const VersionNumber = styled.div`
  color: rgb(0 0 0 / 50%);
`

// TODO standardise all statuses to camelCase and 'invited' instead
// of 'unanswered' so we don't have to do this!
const normalizeStatus = statusString =>
  statusString
    .toLowerCase()
    .replaceAll('_', '')
    .replace('unanswered', 'invited')

const KanbanBoard = ({
  createFile,
  currentUser,
  deleteFile,
  invitations,
  isAuthorBoard = false,
  version,
  versionNumber,
  removeAuthor = () => {},
  removeInvitation,
  removeReviewer = () => {},
  reviews,
  reviewForm,
  isCurrentVersion,
  manuscript,
  title,
  updateSharedStatusForInvitedReviewer,
  updateTeamMember,
  updateCollaborativeTeamMember,
  updateReview,
  updateReviewJsonData,
}) => {
  const reviewers = getMembersOfTeam(version, 'reviewer')

  const collaborativeReviewers = getMembersOfTeam(
    version,
    'collaborativeReviewer',
  ).map(reviewer => ({ ...reviewer, isCollaborative: true }))

  const authors = getMembersOfTeam(version, 'author').map(author => ({
    ...author,
    status: normalizeStatus(author.status ?? ''),
  }))

  const { t } = useTranslation()

  const emailAndWebReviewers = []

  reviewers.concat(collaborativeReviewers).forEach(reviewer => {
    emailAndWebReviewers.push({
      ...reviewer,
      status: normalizeStatus(reviewer.status),
      isCollaborative: !!reviewer.isCollaborative,
      isEmail: false, // This will be revised to true if we find a matching invitation below
      suggestedReviewers: invitations.find(
        invitation =>
          invitation.invitedPersonType === 'REVIEWER' &&
          invitation.user?.id === reviewer.user.id,
      )?.suggestedReviewers,
    })
  })

  invitations
    .filter(
      i =>
        (!isAuthorBoard &&
          (i.invitedPersonType === 'REVIEWER' ||
            i.invitedPersonType === 'COLLABORATIVE_REVIEWER')) ||
        (isAuthorBoard && i.invitedPersonType === 'AUTHOR'),
    )
    .map(i => ({ ...i, status: normalizeStatus(i.status) }))
    .forEach(invitation => {
      const findExistingUser = r =>
        r.user &&
        (r.user.id === invitation.user?.id ||
          r.user.email === invitation.toEmail)

      const existingReviewer = emailAndWebReviewers.find(findExistingUser)

      const existingAuthor = authors.find(findExistingUser)
      // TODO Currently, you can't reinvite someone who's already declined.
      // If we do allow this, we'll need to make sure we only merge one invite with the teamMember record, and only if the dates are correct.

      if (existingReviewer && !isAuthorBoard) {
        existingReviewer.isEmail = true

        const {
          /* eslint-disable-next-line no-unused-vars */
          isShared,
          /* eslint-disable-next-line no-unused-vars */
          user,
          /* eslint-disable-next-line no-unused-vars */
          userId,
          /* eslint-disable-next-line no-unused-vars */
          status,
          /* eslint-disable-next-line no-unused-vars */
          updated,
          ...invitationChosenFields
        } = invitation

        Object.assign(existingReviewer, invitationChosenFields)
      } else if (!isAuthorBoard) {
        emailAndWebReviewers.push({ ...invitation, isEmail: true })
      }

      if (isAuthorBoard && existingAuthor) {
        existingAuthor.isEmail = true

        /* eslint-disable-next-line no-unused-vars */
        const { isShared, user, userId, updated, ...invitationChosenFields } =
          invitation

        Object.assign(existingAuthor, invitationChosenFields)
      } else if (isAuthorBoard) {
        authors.push({ ...invitation, isEmail: true })
      }
    })

  const filterOptions = isAuthorBoard
    ? ['rejected', 'closed', 'inprogress', 'completed']
    : ['rejected', 'closed']

  emailAndWebReviewers.sort((a, b) => {
    const aDate = a.responseComment ? a.responseDate : a.updated
    const bDate = b.responseComment ? b.responseDate : b.updated
    return new Date(bDate) - new Date(aDate)
  })

  authors.sort((a, b) => {
    const aDate = a.responseComment ? a.responseDate : a.updated
    const bDate = b.responseComment ? b.responseDate : b.updated
    return new Date(bDate) - new Date(aDate)
  })

  const allReviews = isCurrentVersion
    ? reviews
    : (Array.isArray(manuscript.reviews) &&
        manuscript.reviews.filter(review => !review.isDecision)) ||
      []

  const getReviewersWithoutDuplicates = (statusValue, someReviewers) =>
    someReviewers
      .sort(
        (a, b) => (a.isEmail ? 0 : 1) - (b.isEmail ? 0 : 1), // to prioritize those with email sent
      )
      .filter((reviewer, index) => {
        const hasTheRightStatus =
          reviewer.status === normalizeStatus(statusValue) ||
          (reviewer.status === 'closed' && statusValue === 'completed')

        const isDuplicate =
          !!reviewer.user &&
          someReviewers.findIndex(r => r.user?.id === reviewer.user.id) !==
            index

        return hasTheRightStatus && !isDuplicate
      })

  const members = isAuthorBoard ? authors : emailAndWebReviewers

  return (
    <AdminSection>
      <SectionContent>
        <SectionHeader>
          <BoardStatusHeader>
            <Title>{title}</Title>
            <Title>
              <VersionNumber>
                {t('decisionPage.Version')} {versionNumber}
              </VersionNumber>
            </Title>
          </BoardStatusHeader>
        </SectionHeader>
        <SectionRow style={{ padding: 0 }}>
          <Kanban>
            {reviewerStatusValues
              .filter(
                statusValue =>
                  !filterOptions.includes(statusValue.toLowerCase()),
              )
              .map(statusValue => (
                <Column $columns={isAuthorBoard ? 2 : 4} key={statusValue}>
                  <ReviewerStatus
                    label={
                      statusValue === 'completed'
                        ? t('reviewerStatus.completedClosed')
                        : undefined
                    }
                    status={statusValue}
                  />
                  <CardsWrapper>
                    {getReviewersWithoutDuplicates(statusValue, members).map(
                      reviewer => (
                        <KanbanCard
                          createFile={createFile}
                          currentUser={currentUser}
                          deleteFile={deleteFile}
                          isAuthorCard={isAuthorBoard}
                          isCurrentVersion={isCurrentVersion}
                          isInvitation={reviewer.isEmail}
                          key={reviewer.id}
                          manuscript={version}
                          removeAuthor={removeAuthor}
                          removeInvitation={removeInvitation}
                          removeReviewer={removeReviewer}
                          review={
                            statusValue === 'completed' ||
                            (statusValue === 'inProgress' &&
                              reviewer.isCollaborative === true)
                              ? findReviewFromReviewer(allReviews, reviewer)
                              : null
                          }
                          reviewer={reviewer}
                          reviewForm={reviewForm}
                          showEmailInvitation={
                            reviewer.isEmail && statusValue === 'invited'
                          }
                          status={
                            statusValue === 'completed' &&
                            reviewer.isCollaborative
                              ? 'closed'
                              : statusValue
                          }
                          updateCollaborativeTeamMember={
                            updateCollaborativeTeamMember
                          }
                          updateReview={updateReview}
                          updateReviewJsonData={updateReviewJsonData}
                          updateSharedStatusForInvitedReviewer={
                            updateSharedStatusForInvitedReviewer
                          }
                          updateTeamMember={updateTeamMember}
                        />
                      ),
                    )}
                  </CardsWrapper>
                </Column>
              ))}
          </Kanban>
          <ReviewersDeclined members={members} />
        </SectionRow>
      </SectionContent>
    </AdminSection>
  )
}

KanbanBoard.propTypes = {
  isAuthorBoard: PropTypes.bool,
  removeAuthor: PropTypes.func,
  removeReviewer: PropTypes.func,
  title: PropTypes.string.isRequired,
  versionNumber: PropTypes.number.isRequired,
}

export default KanbanBoard
