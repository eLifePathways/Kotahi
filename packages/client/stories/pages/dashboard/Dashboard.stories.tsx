import { faker } from '@faker-js/faker'

import preview from '../../../.storybook/preview'
import Dashboard from '../../../app/ui/pages/dashboard/Dashboard'

const meta = preview.meta({
  component: Dashboard,
})

export const Base = meta.story({
  args: {
    userName: 'Priya',
    actionCardData: [
      {
        id: 'action-1',
        type: 'authorSubmit',
        shortId: '1001',
        title: faker.lorem.sentence(),
        href: '/',
      },
      {
        id: 'action-2',
        type: 'authorRevise',
        shortId: '1002',
        title: faker.lorem.sentence(),
        href: '/',
      },
      {
        id: 'action-3',
        type: 'reviewerRespond',
        shortId: '1003',
        title: faker.lorem.sentence(),
        href: '/',
      },
      {
        id: 'action-4',
        type: 'reviewerSubmit',
        shortId: '1004',
        title: faker.lorem.sentence(),
        href: '/',
      },
      {
        id: 'action-5',
        type: 'editorDecide',
        shortId: '1005',
        title: faker.lorem.sentence(),
        href: '/',
      },
      {
        id: 'action-6',
        type: 'taskAlmostOverdue',
        shortId: '1006',
        title: faker.lorem.sentence(),
        href: '/',
      },
      {
        id: 'action-7',
        type: 'taskOverdue',
        shortId: '1007',
        title: faker.lorem.sentence(),
        href: '/',
      },
    ],
    submissionsData: {
      totalCount: 14,
      attentionCount: 1,
      href: '/',
    },
    reviewData: {
      totalCount: 12,
      attentionCount: 2,
      href: '/',
    },
    editingQueueData: {
      totalCount: 8,
      attentionCount: 4,
      href: '/',
    },
  },
})

export const AllCaughtUp = meta.story({
  args: {
    userName: 'Priya',
    actionCardData: [],
    submissionsData: {
      totalCount: 14,
      attentionCount: 0,
      href: '/',
    },
    reviewData: {
      totalCount: 12,
      attentionCount: 0,
      href: '/',
    },
    editingQueueData: {
      totalCount: 8,
      attentionCount: 0,
      href: '/',
    },
  },
})
