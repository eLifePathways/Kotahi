/* eslint-disable react/prop-types */

import { t } from 'i18next'
import { ConfigurableStatus } from '../../../shared'
import reviewStatuses from '../../../../../config/journal/review-status'
import localizeReviewFilterOptions from '../../../../shared/localizeReviewFilterOptions'
import { findReviewerStatus } from './reviewStatusUtils'

const ReviewerStatusBadge = ({ manuscript, currentUser }) => {
  const status = findReviewerStatus(manuscript, currentUser.id)

  const LocalizedReviewFilterOptions = localizeReviewFilterOptions(
    reviewStatuses,
    t,
  )

  const statusConfig = LocalizedReviewFilterOptions.find(
    item => item.value === status,
  )

  if (status === 'closed') {
    return <ConfigurableStatus color="#eeeeee">Closed</ConfigurableStatus>
  }

  return (
    <ConfigurableStatus
      color={statusConfig.color}
      lightText={statusConfig.lightText}
    >
      {statusConfig.label}
    </ConfigurableStatus>
  )
}

export default ReviewerStatusBadge
