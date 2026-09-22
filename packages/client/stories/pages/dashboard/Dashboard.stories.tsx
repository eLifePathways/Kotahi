import { useState, type ComponentProps, type ReactNode } from 'react'
import { faker } from '@faker-js/faker'

import preview from '../../../.storybook/preview'
import Dashboard from '../../../app/ui/pages/dashboard/Dashboard'

type DashboardProps = ComponentProps<typeof Dashboard>

type DemoProps = Omit<
  DashboardProps,
  'notifications' | 'onDismissNotification'
> & {
  initialNotifications: DashboardProps['notifications']
}

const Demo = (props: DemoProps): ReactNode => {
  const { initialNotifications, ...rest } = props
  const [notifications, setNotifications] = useState(initialNotifications)

  const handleDismiss = (id: string): void => {
    setNotifications(current => current.filter(item => item.id !== id))
  }

  return (
    <Dashboard
      {...rest}
      notifications={notifications}
      onDismissNotification={handleDismiss}
    />
  )
}

const actionCardData: DashboardProps['actionCardData'] = [
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
]

const initialNotifications: DashboardProps['notifications'] = [
  {
    id: 'notification-1',
    shortId: '1001',
    href: '/',
    eventType: 'reviewerAcceptedInvitation',
  },
  {
    id: 'notification-2',
    shortId: '1002',
    href: '/',
    eventType: 'reviewerRejectedInvitation',
  },
  {
    id: 'notification-3',
    shortId: '1003',
    href: '/',
    eventType: 'decisionMade',
  },
]

const meta = preview.meta({
  component: Dashboard,
})

export const Base = meta.story({
  render: () => (
    <Demo
      actionCardData={actionCardData}
      editingQueueData={{ totalCount: 8, attentionCount: 4, href: '/' }}
      initialNotifications={initialNotifications}
      reviewData={{ totalCount: 12, attentionCount: 2, href: '/' }}
      submissionsData={{ totalCount: 14, attentionCount: 1, href: '/' }}
      userName="Priya"
    />
  ),
})

export const AllCaughtUp = meta.story({
  render: () => (
    <Demo
      actionCardData={[]}
      editingQueueData={{ totalCount: 8, attentionCount: 0, href: '/' }}
      initialNotifications={[]}
      reviewData={{ totalCount: 12, attentionCount: 0, href: '/' }}
      submissionsData={{ totalCount: 14, attentionCount: 0, href: '/' }}
      userName="Priya"
    />
  ),
})
