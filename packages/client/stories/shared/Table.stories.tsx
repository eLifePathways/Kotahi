/* eslint-disable react-hooks/rules-of-hooks */

import { useState } from 'react'
import preview from '../../.storybook/preview'
import Table from '../../app/ui/shared/Table'

type Row = {
  key: string
  name: string
  role: string
  status: string
}

const meta = preview.meta({
  component: Table,
})

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    sorter: (a: Row, b: Row): number => a.name.localeCompare(b.name),
  },
  {
    title: 'Role',
    dataIndex: 'role',
    key: 'role',
    sorter: (a: Row, b: Row): number => a.role.localeCompare(b.role),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    sorter: (a: Row, b: Row): number => a.status.localeCompare(b.status),
  },
]

const dataSource: Row[] = [
  { key: '1', name: 'Ada Lovelace', role: 'Author', status: 'Submitted' },
  { key: '2', name: 'Alan Turing', role: 'Reviewer', status: 'In progress' },
  { key: '3', name: 'Grace Hopper', role: 'Editor', status: 'Completed' },
  { key: '4', name: 'Charles Babbage', role: 'Author', status: 'Revising' },
  {
    key: '5',
    name: 'Katherine Johnson',
    role: 'Reviewer',
    status: 'Completed',
  },
  { key: '6', name: 'Tim Berners-Lee', role: 'Editor', status: 'In progress' },
  { key: '7', name: 'Margaret Hamilton', role: 'Author', status: 'Accepted' },
  { key: '8', name: 'John von Neumann', role: 'Reviewer', status: 'Submitted' },
  { key: '9', name: 'Radia Perlman', role: 'Editor', status: 'Rejected' },
  { key: '10', name: 'Donald Knuth', role: 'Author', status: 'In progress' },
  { key: '11', name: 'Barbara Liskov', role: 'Author', status: 'Submitted' },
  { key: '12', name: 'Vint Cerf', role: 'Reviewer', status: 'Accepted' },
  { key: '13', name: 'Hedy Lamarr', role: 'Editor', status: 'Completed' },
  {
    key: '14',
    name: 'Claude Shannon',
    role: 'Author',
    status: 'In progress',
  },
  { key: '15', name: 'Frances Allen', role: 'Reviewer', status: 'Rejected' },
]

const PAGE_SIZE = 10

/**
 * This is here mainly for theming purposes. Refer to coko client's storybook
 * and ant's documentation for a full refernnce of valid props.
 */

export const Base = meta.story({
  args: {
    columns,
    dataSource,
    rowSelection: {},
  },
  render: args => {
    const [page, setPage] = useState(1)

    const pageData = args.dataSource.slice(
      (page - 1) * PAGE_SIZE,
      page * PAGE_SIZE,
    )

    return (
      <Table
        {...args}
        dataSource={pageData}
        pagination={{
          current: page,
          pageSize: PAGE_SIZE,
          total: args.dataSource.length,
          onChange: setPage,
        }}
      />
    )
  },
})
