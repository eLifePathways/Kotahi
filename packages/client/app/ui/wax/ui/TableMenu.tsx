import { useState, type ReactNode } from 'react'
import { Dropdown, InputNumber, Popover } from 'antd'
import type { Command } from 'prosemirror-state'
import { DownOutlined, TableOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import { grid } from '@coko/client'

import Button from '../../shared/Button'
import { useWax } from '../editor'
import {
  addCaption,
  addColumnAfter,
  addColumnBefore,
  addRowAfter,
  addRowBefore,
  canInsertTable,
  deleteCaption,
  deleteColumn,
  deleteRow,
  deleteTable,
  insertTable,
  isInTable,
  mergeCells,
  splitCell,
  toggleHeaderCell,
  toggleHeaderColumn,
  toggleHeaderRow,
} from '../features/tables'

const Form = styled.form`
  align-items: center;
  display: flex;
  gap: ${grid(1)};
`

export const InsertTableButton = (): ReactNode => {
  const { view, state } = useWax()
  const enabled = canInsertTable(state)
  const [open, setOpen] = useState(false)
  const [rows, setRows] = useState(2)
  const [cols, setCols] = useState(2)

  const insert = (): void => {
    if (view) insertTable(rows, cols)(view.state, view.dispatch)
    setOpen(false)
    view?.focus()
  }

  const content = (
    <Form
      onSubmit={(event): void => {
        event.preventDefault()
        insert()
      }}
    >
      <InputNumber
        aria-label="Rows"
        max={50}
        min={1}
        onChange={(value): void => setRows(value ?? 1)}
        value={rows}
      />
      ×
      <InputNumber
        aria-label="Columns"
        max={20}
        min={1}
        onChange={(value): void => setCols(value ?? 1)}
        value={cols}
      />
      <Button htmlType="submit" size="small" type="primary">
        Insert
      </Button>
    </Form>
  )

  return (
    <Popover
      content={content}
      onOpenChange={setOpen}
      open={open}
      trigger="click"
    >
      <Button
        aria-label="Insert table"
        disabled={!enabled}
        icon={<TableOutlined />}
        size="small"
        title="Insert table"
        type="text"
      />
    </Popover>
  )
}

const actions: { key: string; label: string; command: Command }[] = [
  {
    key: 'addColumnBefore',
    label: 'Add column before',
    command: addColumnBefore,
  },
  { key: 'addColumnAfter', label: 'Add column after', command: addColumnAfter },
  { key: 'addRowBefore', label: 'Add row before', command: addRowBefore },
  { key: 'addRowAfter', label: 'Add row after', command: addRowAfter },
  { key: 'deleteColumn', label: 'Delete column', command: deleteColumn },
  { key: 'deleteRow', label: 'Delete row', command: deleteRow },
  { key: 'mergeCells', label: 'Merge cells', command: mergeCells },
  { key: 'splitCell', label: 'Split cell', command: splitCell },
  {
    key: 'toggleHeaderRow',
    label: 'Toggle header row',
    command: toggleHeaderRow,
  },
  {
    key: 'toggleHeaderColumn',
    label: 'Toggle header column',
    command: toggleHeaderColumn,
  },
  {
    key: 'toggleHeaderCell',
    label: 'Toggle header cell',
    command: toggleHeaderCell,
  },
  { key: 'addCaption', label: 'Add caption', command: addCaption },
  { key: 'deleteCaption', label: 'Delete caption', command: deleteCaption },
  { key: 'deleteTable', label: 'Delete table', command: deleteTable },
]

export const TableActions = (): ReactNode => {
  const { view, state } = useWax()

  const available = isInTable(state)
    ? actions.filter(a => a.command(state)).map(a => a.key)
    : []

  const items = actions.map(action => ({
    key: action.key,
    label: action.label,
    disabled: !available.includes(action.key),
  }))

  const handleClick = ({ key }: { key: string }): void => {
    const action = actions.find(a => a.key === key)
    if (view && action) action.command(view.state, view.dispatch, view)
    view?.focus()
  }

  return (
    <Dropdown
      disabled={!available.length}
      menu={{ items, onClick: handleClick }}
      trigger={['click']}
    >
      <Button
        aria-label="Table options"
        size="small"
        title="Table options"
        type="text"
      >
        Table <DownOutlined />
      </Button>
    </Dropdown>
  )
}
