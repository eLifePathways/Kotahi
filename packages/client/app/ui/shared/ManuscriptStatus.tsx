import { type ReactNode } from 'react'

import { useTranslation } from 'react-i18next'
import Badge from './Badge'

const variantMapper = {
  inProgress: 'warning',
  revise: 'warning',
  revising: 'warning',
  submitted: 'warning',
  underEmbargo: 'warning',

  accepted: 'success',
  completed: 'success',
  embargoReleased: 'success',
  published: 'success',

  rejected: 'error',
  unpublished: 'error',
}

type ManuscriptStatusProps = {
  status:
    | 'accepted'
    | 'assigned'
    | 'completed'
    | 'embargoReleased'
    | 'evaluated'
    | 'inProgress'
    | 'new'
    | 'published'
    | 'rejected'
    | 'revise'
    | 'revising'
    | 'submitted'
    | 'underEmbargo'
    | 'unpublished'

  small?: boolean
}

const ManuscriptStatus = ({
  status,
  small,
}: ManuscriptStatusProps): ReactNode => {
  const { t } = useTranslation()

  return (
    <Badge small={small} variant={variantMapper[status]}>
      {t(`msStatus.${status}`)}
    </Badge>
  )
}

export default ManuscriptStatus
