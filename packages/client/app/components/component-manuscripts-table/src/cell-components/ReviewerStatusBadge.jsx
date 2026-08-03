/* eslint-disable react/prop-types */

import ReviewerStatus from '../../../../ui/shared/ReviewerStatus'
import { findReviewerStatus } from './reviewStatusUtils'

const ReviewerStatusBadge = ({ manuscript, currentUser }) => {
  const status = findReviewerStatus(manuscript, currentUser.id)

  return <ReviewerStatus small status={status} />
}

export default ReviewerStatusBadge
