import { type ReactNode } from 'react'

import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import Badge from './Badge'
import { type BadgeVariant } from './_constants'

const variantMapper: Record<string, BadgeVariant> = {
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

export const MANUSCRIPT_STATUSES = [
  'accepted',
  'assigned',
  'completed',
  'embargoReleased',
  'evaluated',
  'inProgress',
  'new',
  'published',
  'rejected',
  'revise',
  'revising',
  'submitted',
  'underEmbargo',
  'unpublished',
] as const

const STATUSES_FORCED_TO_PUBLISHED = ['evaluated']

type ManuscriptStatusProps = {
  status: (typeof MANUSCRIPT_STATUSES)[number]
  /**  Timestamp the manuscript was published, if any. */
  published?: string | null
  small?: boolean
}

const TwoToneWrapper = styled.span`
  display: inline-flex;

  > span:first-child {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  > span:last-child {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
`

const ManuscriptStatus = ({
  status,
  published,
  small,
}: ManuscriptStatusProps): ReactNode => {
  const { t } = useTranslation()

  const forceToPublished = STATUSES_FORCED_TO_PUBLISHED.includes(status)
  const showPublishedHalf =
    (!!published && status !== 'published') || forceToPublished

  if (!showPublishedHalf) {
    return (
      <Badge
        data-testid="badge-status"
        small={small}
        variant={variantMapper[status]}
      >
        {t(`msStatus.${status}`)}
      </Badge>
    )
  }

  return (
    <TwoToneWrapper>
      <Badge
        data-testid="badge-status"
        small={small}
        variant={variantMapper.published}
      >
        {t('msStatus.published')}
      </Badge>
      <Badge
        data-testid="badge-status"
        small={small}
        variant={variantMapper[status]}
      >
        {t(`msStatus.${status}`)}
      </Badge>
    </TwoToneWrapper>
  )
}

export default ManuscriptStatus
