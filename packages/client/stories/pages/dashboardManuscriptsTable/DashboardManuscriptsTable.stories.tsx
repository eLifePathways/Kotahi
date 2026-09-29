import { type ComponentProps } from 'react'

import preview from '../../../.storybook/preview'
import DashboardManuscriptsTable from '../../../app/ui/pages/dashboardManuscriptsTable/DashboardManuscriptsTable'
import { type ManuscriptsTableColumn } from '../../../app/ui/shared/ManuscriptsTable'

type DashboardManuscriptsTableProps = ComponentProps<
  typeof DashboardManuscriptsTable
>

const columns: ManuscriptsTableColumn[] = [
  {
    title: 'No.',
    dataIndex: 'manuscriptNumber',
    key: 'manuscriptNumber',
    align: 'center',
  },
  { title: 'Title', dataIndex: 'title', key: 'title' },
  { title: 'Status', dataIndex: 'status', key: 'status', dataType: 'status' },
  { title: 'Created', dataIndex: 'created', key: 'created', dataType: 'date' },
]

const dataSource = [
  {
    key: '1',
    manuscriptNumber: 101,
    title: 'Honey bee colonies benefit from grassland',
    status: 'submitted',
    created: '2026-07-01',
  },
  {
    key: '2',
    manuscriptNumber: 102,
    title: 'A dataset of pollinator visitation rates',
    status: 'accepted',
    created: '2026-06-15',
  },
]

const meta = preview.meta({
  component: DashboardManuscriptsTable,
  parameters: {
    router: {
      initialEntries: ['/kotahi/dashboard/submissions'],
      path: '/:groupName/*',
    },
  },
})

export const Base = meta.story({
  args: {
    title: 'My Submissions',
    loading: false,
    columns,
    dataSource,
    page: 1,
    pageSize: 10,
    totalCount: dataSource.length,
    onPageChange: (): void => {},
    onSearch: (): void => {},
  } satisfies DashboardManuscriptsTableProps,
})

export const Loading = meta.story({
  args: {
    title: 'My Submissions',
    loading: true,
    columns,
    dataSource: [],
    page: 1,
    pageSize: 10,
    totalCount: 0,
    onPageChange: (): void => {},
    onSearch: (): void => {},
  } satisfies DashboardManuscriptsTableProps,
})

export const WithError = meta.story({
  args: {
    title: 'My Submissions',
    loading: false,
    error: new Error('Network error'),
    columns,
    dataSource: [],
    page: 1,
    pageSize: 10,
    totalCount: 0,
    onPageChange: (): void => {},
    onSearch: (): void => {},
  } satisfies DashboardManuscriptsTableProps,
})
