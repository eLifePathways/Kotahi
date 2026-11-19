import dayjs from 'dayjs'

import preview from '../../.storybook/preview'
import DateParser from '../../app/ui/shared/DateParser'

const meta = preview.meta({
  component: DateParser,
})

const timestamp = dayjs().subtract(3, 'hour').toDate()

export const Base = meta.story({
  args: {
    timestamp,
  },
})

export const Formatted = meta.story({
  args: {
    timestamp,
    dateFormat: 'MMMM DD, YYYY',
  },
})

export const Humanized = meta.story({
  args: {
    timestamp,
    humanizeThreshold: 1,
  },
})
