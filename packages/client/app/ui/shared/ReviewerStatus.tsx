import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import Badge from './Badge'
import {
  ReviewerStatusValue,
  reviewerStatusTranslationKeys,
  reviewerStatusVariants,
} from './_constants'

type ReviewerStatusProps = {
  status: ReviewerStatusValue

  small?: boolean
  label?: string
}

/**
 * TO DO
 * - drop the label prop when the kanban goes away
 */

const ReviewerStatus = ({
  status,
  small,
  label,
}: ReviewerStatusProps): ReactNode => {
  const { t } = useTranslation()

  return (
    <Badge small={small} variant={reviewerStatusVariants[status]}>
      {label ?? t(reviewerStatusTranslationKeys[status])}
    </Badge>
  )
}

export default ReviewerStatus
