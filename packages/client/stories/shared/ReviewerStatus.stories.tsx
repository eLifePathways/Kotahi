import preview from '../../.storybook/preview'
import ReviewerStatus from '../../app/ui/shared/ReviewerStatus'

const meta = preview.meta({
  component: ReviewerStatus,
})

export const Invited = meta.story({
  args: {
    status: 'invited',
  },
})

export const Accepted = meta.story({
  args: {
    status: 'accepted',
  },
})

export const InProgress = meta.story({
  args: {
    status: 'inProgress',
  },
})

export const Completed = meta.story({
  args: {
    status: 'completed',
  },
})

export const Closed = meta.story({
  args: {
    status: 'closed',
  },
})

export const Rejected = meta.story({
  args: {
    status: 'rejected',
  },
})
