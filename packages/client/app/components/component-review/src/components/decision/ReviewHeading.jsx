/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/rules-of-hooks */

import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { Checkbox, Button } from '../../../../pubsweet'

import Reviewer from './Reviewer'

const StyledCheckbox = styled(Checkbox)`
  margin-left: 10px;
`

const UsersList = styled.div`
  display: flex;
  flex-basis: 100%;
  flex-wrap: wrap;
  height: 100%;
  margin-bottom: 10px;
  margin-top: 10px;
`

const ReviewHeadingRoot = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
`

const Controls = styled.span`
  flex-grow: 1;
  text-align: right;
`

const Bullet = styled.span`
  background-color: ${props =>
    props.recommendation
      ? props.journal?.recommendations?.find(
          item => item.value === props.recommendation,
        )?.color
      : 'black'};
  border-radius: 100%;
  display: inline-block;
  height: 10px;
  margin-right: 10px;
  width: 10px;
`

const Ordinal = styled.span``

const ReviewHeading = ({
  id,
  journal,
  open,
  ordinal,
  recommendation,
  users,
  isCollaborative = false,
  isHiddenFromAuthor,
  isHiddenReviewerName,
  toggleOpen,
  manuscriptId,
  lockUnlockReview,
  teams,
  currentUser,
  canBePublishedPublicly,
  isControlPage = false,
  isLock,
  updateReview,
  canHideReviews,
}) => {
  if (!currentUser) return null
  const { t } = useTranslation()

  const editorTeam = teams.filter(team => {
    return team.role.toLowerCase().includes('editor')
  })

  const currentUserIsEditor = editorTeam.length
    ? !!editorTeam
        .map(team => team.members)
        .flat()
        .filter(member => member.user.id === currentUser.id).length
    : false

  const toggleIsHiddenFromAuthor = (reviewId, reviewHiddenFromAuthor) => {
    updateReview(reviewId, {
      isHiddenFromAuthor: reviewHiddenFromAuthor,
      manuscriptId,
    })
  }

  const toggleIsHiddenReviewerNameFromPublishedAndAuthor = (
    reviewId,
    reviewerNameHiddenFromPublishedAndAuthor,
  ) => {
    updateReview(reviewId, {
      isHiddenReviewerName: reviewerNameHiddenFromPublishedAndAuthor,
      manuscriptId,
    })
  }

  // eslint-disable-next-line no-shadow
  const lockUnlockReviewFn = async id => {
    await lockUnlockReview({ variables: { id } })
  }

  return (
    <ReviewHeadingRoot>
      <Bullet journal={journal} recommendation={recommendation} />
      <Ordinal>
        {t('decisionPage.decisionTab.reviewNum', { num: ordinal })}
      </Ordinal>
      &nbsp;
      {users.length === 1 && (
        <Reviewer
          canBePublishedPublicly={canBePublishedPublicly}
          currentUser={currentUser}
          currentUserIsEditor={currentUserIsEditor}
          isControlPage={isControlPage}
          isHiddenReviewerName={isHiddenReviewerName}
          user={users[0]}
        />
      )}
      {canHideReviews &&
        (currentUserIsEditor ||
          currentUser.groupRoles.some(role =>
            ['groupManager', 'groupAdmin'].includes(role),
          )) && (
          <>
            <StyledCheckbox
              checked={isHiddenFromAuthor || isHiddenFromAuthor == null}
              label={t('decisionPage.decisionTab.Hide review')}
              onChange={() => toggleIsHiddenFromAuthor(id, !isHiddenFromAuthor)}
            />
            <StyledCheckbox
              checked={isHiddenReviewerName || isHiddenReviewerName == null}
              label={t('decisionPage.decisionTab.Hide reviewer name')}
              onChange={() =>
                toggleIsHiddenReviewerNameFromPublishedAndAuthor(
                  id,
                  !isHiddenReviewerName,
                )
              }
            />
            {isCollaborative && (
              <StyledCheckbox
                checked={isLock}
                label={t('decisionPage.decisionTab.lockReview')}
                onChange={() => {
                  lockUnlockReviewFn(id)
                }}
              />
            )}
          </>
        )}
      <Controls>
        <Button onClick={toggleOpen} plain>
          {open
            ? t('decisionPage.decisionTab.reviewModalHide')
            : t('decisionPage.decisionTab.reviewModalShow')}
        </Button>
      </Controls>
      {users.length > 1 && (
        <UsersList>
          {users.map(user => (
            <Reviewer
              canBePublishedPublicly={canBePublishedPublicly}
              currentUser={currentUser}
              currentUserIsEditor={currentUserIsEditor}
              isControlPage={isControlPage}
              isHiddenReviewerName={isHiddenReviewerName}
              key={user.id}
              user={user}
            />
          ))}
        </UsersList>
      )}
    </ReviewHeadingRoot>
  )
}

ReviewHeading.propTypes = {
  journal: PropTypes.object,
  open: PropTypes.bool.isRequired,
  ordinal: PropTypes.number.isRequired,
  recommendation: PropTypes.string,
  toggleOpen: PropTypes.func.isRequired,
  isCollaborative: PropTypes.bool.isRequired,
  isLock: PropTypes.bool.isRequired,

  users: PropTypes.array.isRequired,
}
ReviewHeading.defaultProps = { recommendation: null }

Bullet.propTypes = {
  journal: PropTypes.object,
  recommendation: PropTypes.string.isRequired,
}

export default ReviewHeading
