/* eslint-disable react/prop-types */

import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import Review from './Review'
import { Title, SectionHeader, SectionRow, Info } from '../style'
import { SectionContent } from '../../../../shared'

/** Some reviewers may be marked as 'shared', meaning they can see each other's reviews. Non-'shared' reviewers cannot see or be seen by this group.
 * This displays completed reviews by other shared reviewers IF the current user is in the shared group.
 */
const SharedReviewerGroupReviews = ({
  manuscript,
  reviewerId,
  reviewForm,
  threadedDiscussionProps,
}) => {
  const { t } = useTranslation()

  const thisReviewIsShared = manuscript.reviews?.find(
    r => r.user?.id === reviewerId && !r.isDecision,
  )?.isSharedWithCurrentUser

  if (!thisReviewIsShared)
    return <Info>{t('otherReviewsSection.noSharedReviews')}</Info>

  const sharedReviews = manuscript.reviews.filter(
    r =>
      r.isSharedWithCurrentUser && r.user?.id !== reviewerId && !r.isDecision,
  )

  if (!sharedReviews.length) return null
  return (
    <SectionContent>
      <SectionHeader>
        <Title>{t('sharedReviews.Other Reviews')}</Title>
      </SectionHeader>
      {sharedReviews.map(r => (
        <SectionRow key={r.id}>
          <Review
            review={r}
            reviewForm={reviewForm}
            threadedDiscussionProps={threadedDiscussionProps}
          />
        </SectionRow>
      ))}
    </SectionContent>
  )
}

SharedReviewerGroupReviews.propTypes = {
  manuscript: PropTypes.shape({
    teams: PropTypes.arrayOf(
      PropTypes.shape({
        role: PropTypes.string.isRequired,
        members: PropTypes.arrayOf(
          PropTypes.shape({
            isShared: PropTypes.bool,
            status: PropTypes.string,
            user: PropTypes.shape({ id: PropTypes.string.isRequired })
              .isRequired,
          }).isRequired,
        ).isRequired,
      }).isRequired,
    ).isRequired,
    reviews: PropTypes.arrayOf(
      PropTypes.shape({
        isDecision: PropTypes.bool.isRequired,
        user: PropTypes.shape({ id: PropTypes.string.isRequired }),
      }).isRequired,
    ).isRequired,
  }).isRequired,
  reviewerId: PropTypes.string.isRequired,
}

export default SharedReviewerGroupReviews
