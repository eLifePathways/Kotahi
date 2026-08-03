import preview from '../../.storybook/preview'
import ManuscriptStatus from '../../app/ui/shared/ManuscriptStatus'

const meta = preview.meta({
  component: ManuscriptStatus,
})

export const Base = meta.story({
  args: {
    status: 'evaluated',
  },
})

export const Accepted = meta.story({
  args: {
    status: 'accepted',
  },
})

export const Assigned = meta.story({
  args: {
    status: 'assigned',
  },
})

export const Completed = meta.story({
  args: {
    status: 'completed',
  },
})

export const EmbargoReleased = meta.story({
  args: {
    status: 'embargoReleased',
  },
})

export const Evaluated = meta.story({
  args: {
    status: 'evaluated',
  },
})

export const InProgress = meta.story({
  args: {
    status: 'inProgress',
  },
})

export const New = meta.story({
  args: {
    status: 'new',
  },
})

export const Published = meta.story({
  args: {
    status: 'published',
  },
})

export const Rejected = meta.story({
  args: {
    status: 'rejected',
  },
})

export const Revise = meta.story({
  args: {
    status: 'revise',
  },
})

export const Revising = meta.story({
  args: {
    status: 'revising',
  },
})

export const Submitted = meta.story({
  args: {
    status: 'submitted',
  },
})

export const UnderEmbargo = meta.story({
  args: {
    status: 'underEmbargo',
  },
})

export const Unpublished = meta.story({
  args: {
    status: 'unpublished',
  },
})
