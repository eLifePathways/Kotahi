import styled from 'styled-components'
import { Table as OriginalTable, th, grid } from '@coko/client'

const Table = styled(OriginalTable)`
  /* stylelint-disable declaration-no-important */

  .ant-table-wrapper {
    border: 1px solid ${th('colorPrimary')};
    border-radius: ${th('borderRadius')};
    overflow: hidden;
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

  .ant-table-selection-column {
    padding-inline-start: ${grid(4)} !important;
  }

  .ant-table-thead {
    font-size: ${th('fontSizeBaseSmaller')};
    text-transform: uppercase;
  }

  .ant-table-thead th::before {
    height: 3em !important;
  }

  /* necessary because of wax-table-service injecting global css */
  th,
  td {
    border: 0;
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

export default Table
