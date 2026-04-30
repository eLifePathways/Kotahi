/* eslint-disable react/prop-types */

import styled from 'styled-components'
import { th } from '@coko/client'
import { indexOf } from 'lodash'

import { dateTimeFormatter, fileSizeFormatter } from './helpers'
import IconButton from './IconButton'
import { Loading } from './Modal'
import { color } from '../../../../theme'

const TableWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: flex-start;
  overflow-y: auto;
  width: ${({ selected }) => (selected ? `${65}%` : '100%')};
`

const TableHead = styled.div`
  display: flex;
  position: sticky;
  top: 0;
  width: 100%;
`

const TableHeadCell = styled.div`
  align-items: center;
  background: ${color.gray90};
  display: flex;
  flex-basis: ${({ width }) => (width ? `${width}%` : '33.33%')};
  padding: 8px;
`

const HeaderLabel = styled.div`
  font-family: ${th('fontHeading')};
  font-size: ${th('fontSizeBase')};
  line-height: ${th('lineHeightBase')};
  padding-left: 5px;
`

const TableBody = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`

const TableBodyEmpty = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  font-family: ${th('fontHeading')};
  font-size: ${th('fontSizeBase')};
  justify-content: center;
  line-height: ${th('lineHeightBase')};
  margin-top: calc(2 * ${th('gridUnit')});
  width: 100%;
`

const TableRow = styled.div`
  align-items: center;
  background: ${({ selected }) => (selected ? color.brand1.base : 'inherit')};
  color: ${({ selected }) => (selected ? color.textReverse : 'inherit')};
  display: flex;
  user-select: none;
  width: 100%;

  &:nth-child(even) {
    background: ${({ selected }) =>
      selected ? color.brand1.base : color.backgroundC};
  }

  &:hover {
    background: ${color.brand1.base};
    color: white;
  }
`

const RowRest = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  flex-basis: ${({ width }) => (width ? `${width}%` : '33.33%')};
`

const TableCell = styled.div`
  flex-basis: ${({ width }) => (width ? `${width}%` : '33.33%')};
  font-family: ${th('fontHeading')};
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};
  padding: 8px;
  text-align: left;
`

const ascIcon = (
  <svg fill={color.text} viewBox="0 0 24 24">
    <path d="M19 17H22L18 21L14 17H17V3H19M2 17H12V19H2M6 5V7H2V5M2 11H9V13H2V11Z" />
  </svg>
)

const descIcon = (
  <svg fill={color.text} viewBox="0 0 24 24">
    <path d="M19 7H22L18 3L14 7H17V21H19M2 17H12V19H2M6 5V7H2V5M2 11H9V13H2V11Z" />
  </svg>
)

const FilesTable = ({
  checkboxColumn,
  columns,
  sortingHandler,
  sortingState,
  loading,
  files,
  selected,
  checkboxSelected,
  selectHandler,
  checkboxHandler,
}) => {
  const renderTableBody = () => {
    if (loading || !files) return <Loading />

    return files.length > 0 ? (
      <TableBody>
        {files.map(item => {
          const { id } = item
          const foundInList = indexOf(checkboxSelected, id)
          return (
            <TableRow key={id} selected={selected && selected === id}>
              {checkboxColumn && (
                <TableCell width={2}>
                  <input
                    checked={foundInList !== -1}
                    onChange={() => {
                      checkboxHandler(id)
                    }}
                    type="checkbox"
                  />
                </TableCell>
              )}
              <RowRest
                onClick={() => {
                  selectHandler(id)
                }}
                width={checkboxColumn ? 98 : 100}
              >
                {columns.map(column => {
                  const { label, width } = column

                  if (label === 'created' || label === 'updated') {
                    return (
                      <TableCell key={label} width={width}>
                        {dateTimeFormatter(item[label])}
                      </TableCell>
                    )
                  }

                  if (label === 'size') {
                    return (
                      <TableCell key={label} width={width}>
                        {fileSizeFormatter(item.storedObjects[0][label])}
                      </TableCell>
                    )
                  }

                  if (label === 'mimetype') {
                    return (
                      <TableCell key={label} width={width}>
                        {item.storedObjects[0][label]}
                      </TableCell>
                    )
                  }

                  if (label === 'inUse') {
                    return (
                      <TableCell key={label} width={width}>
                        {item[label] ? 'Yes' : 'No'}
                      </TableCell>
                    )
                  }

                  return (
                    <TableCell key={label} width={width}>
                      {item[label]}
                    </TableCell>
                  )
                })}
              </RowRest>
            </TableRow>
          )
        })}
      </TableBody>
    ) : (
      <TableBodyEmpty>
        You don&apos;t have any uploaded files for this manuscript yet
      </TableBodyEmpty>
    )
  }

  return (
    <TableWrapper selected={selected}>
      <TableHead>
        {checkboxColumn && (
          <TableHeadCell width={2}>
            <input
              checked={
                files &&
                files.length > 0 &&
                files.length === checkboxSelected.length
              }
              onChange={() => {
                checkboxHandler(undefined, true)
              }}
              type="checkbox"
            />
          </TableHeadCell>
        )}
        {columns &&
          columns.map(column => {
            const { label, width, sortable, columnName } = column

            return (
              <TableHeadCell key={label} width={width}>
                {sortable && (
                  <IconButton
                    icon={sortingState[label] ? ascIcon : descIcon}
                    onClick={() => {
                      sortingHandler(label)
                    }}
                  />
                )}
                <HeaderLabel>{columnName}</HeaderLabel>
              </TableHeadCell>
            )
          })}
      </TableHead>
      {renderTableBody()}
    </TableWrapper>
  )
}

export default FilesTable
