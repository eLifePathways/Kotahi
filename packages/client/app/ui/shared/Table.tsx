import { type ComponentProps, type ReactNode } from 'react'
import styled from 'styled-components'
import { Table as AntTable } from 'antd'
import { th, grid } from '@coko/client'

import Spinner from './Spinner'

type TableProps = Omit<ComponentProps<typeof AntTable>, 'loading'> & {
  loading?: boolean
}

const Wrapper = styled.div`
  /* stylelint-disable declaration-no-important */

  .ant-table {
    border: 1px solid ${th('colorPrimary')};
    border-radius: ${th('borderRadius')};
    overflow: auto hidden;
  }

  .ant-table-content {
    font-size: ${th('fontSizeBaseSmall')};
  }

  .ant-pagination {
    justify-content: flex-end;
  }

  .ant-pagination-total-text {
    margin-right: auto;
  }

  .ant-table-thead {
    font-size: ${th('fontSizeBaseSmaller')};
    text-transform: uppercase;
  }

  th.ant-table-cell {
    padding: ${grid(3)} ${grid(4)} !important;
  }

  .ant-table-thead th::before {
    height: 2.7em !important;
  }

  /* necessary because of wax-table-service injecting global css */
  th,
  td {
    border: 0;
  }

  .ant-table-expanded-row > td {
    padding: 0 !important;
  }

  .ant-table-filter-trigger:hover {
    background-color: ${th('colorTextReverse')} !important;
  }

  .ant-table-filter-trigger.active {
    background-color: ${th('colorTextReverse')} !important;
  }

  /* keep header text legible on keyboard focus */
  /* show the focus ring on the sorter icon instead of antd's default of recoloring the whole label */
  .ant-table-thead th.ant-table-column-has-sorters:focus-visible {
    color: ${th('colorTextReverse')} !important;
  }

  .ant-table-thead
    th.ant-table-column-has-sorters:focus-visible
    .ant-table-column-sorter {
    outline: 2px solid ${th('colorTextReverse')};
    outline-offset: 2px;
  }

  .ant-table-column-sorter-up,
  .ant-table-column-sorter-down {
    opacity: 0.1;
  }

  .ant-table-column-sorter-up.active,
  .ant-table-column-sorter-down.active {
    color: ${th('colorTextReverse')} !important;
    opacity: 0.9;
  }

  tbody tr:last-of-type {
    > td:first-of-type {
      border-bottom-left-radius: ${th('borderRadius')};
    }

    > td:last-of-type {
      border-bottom-right-radius: ${th('borderRadius')};
    }
  }

  .ant-table-cell {
    vertical-align: middle;
  }

  .ant-input-search input {
    box-shadow: none;
    transition: box-shadow 0.2s ease;
  }

  .ant-input-search input:focus {
    box-shadow: 0 0 0 1px ${th('colorPrimary')};
  }
`

const Table = (props: TableProps): ReactNode => {
  const { className, loading = false, ...rest } = props

  return (
    <Wrapper className={className}>
      <Spinner spinning={loading}>
        <AntTable {...rest} />
      </Spinner>
    </Wrapper>
  )
}

export default Table
