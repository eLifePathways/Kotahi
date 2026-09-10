export type BadgeVariant =
  | 'primary'
  | 'success'
  | 'error'
  | 'warning'
  | 'disabled'

export const badgeDefaultColorToken = 'colorSecondary'

export const badgeVariantColorTokens: Record<BadgeVariant, string> = {
  primary: 'colorPrimary',
  success: 'colorSuccess',
  error: 'colorError',
  warning: 'colorWarning',
  disabled: 'colorDisabled',
}

export const reviewerStatusTranslationKeys = {
  invited: 'Invited',
  accepted: 'Accepted',
  inProgress: 'In Progress',
  completed: 'Completed',
  closed: 'Closed',
  rejected: 'Declined',
}

export type ReviewerStatusValue =
  | 'invited'
  | 'accepted'
  | 'inProgress'
  | 'completed'
  | 'closed'
  | 'rejected'

export const reviewerStatusValues = Object.keys(
  reviewerStatusTranslationKeys,
) as ReviewerStatusValue[]

export const reviewerStatusVariants: Partial<
  Record<ReviewerStatusValue, BadgeVariant>
> = {
  // invited: '',
  accepted: 'primary',
  inProgress: 'warning',
  completed: 'success',
  closed: 'disabled',
  rejected: 'error',
}
