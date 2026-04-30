/* eslint-disable react/prop-types */

import styled from 'styled-components'
import Popup from 'reactjs-popup'
import { Calendar as FeatherCalendar } from 'react-feather'
import { grid } from '@coko/client'
import { useTranslation } from 'react-i18next'
import { Cell, HeadingCell } from './style'
import { Select, DateRangeCalendar, SortUp, SortDown } from '../../shared'
import {
  dateToCompactStringLocal,
  compactStringToDateLocal,
} from '../../../shared/dateUtils'
import { color } from '../../../theme'

/* eslint-disable-next-line no-unused-vars */
const CalendarIcon = styled(({ isActive, ...props }) => (
  <FeatherCalendar {...props} />
))`
  height: ${grid(2)};
  stroke: ${props => (props.isActive ? color.brand1.base : color.gray60)};
  width: ${grid(2)};

  &:hover {
    stroke: ${color.brand1.base};
  }
`

const IconButton = styled.button`
  background: none;
  border: none;
  display: flex;
  padding: 0 2px;
`

const getDateRangeFromFilterString = filterString => {
  if (!filterString) return []
  const parts = filterString.split('-')
  if (parts.length !== 2) return []

  try {
    const startDate = compactStringToDateLocal(parts[0])
    const endDate = compactStringToDateLocal(parts[1])
    return [startDate, endDate]
    /* eslint-disable-next-line no-unused-vars */
  } catch (e) {
    console.error(`Could not parse date range '${filterString}'`)
    return []
  }
}

const FilterSortHeader = ({
  columnInfo,
  sortName,
  sortDirection,
  setSort,
  setFilter,
}) => {
  const { t } = useTranslation()

  if (columnInfo.canFilterByDateRange) {
    const changeSort = () => {
      const priorSortName = sortName
      let newSortDirection

      if (priorSortName !== columnInfo.name) {
        newSortDirection = columnInfo.defaultSortDirection
      } else if (sortDirection === 'ASC') {
        newSortDirection = 'DESC'
      } else if (sortDirection === 'DESC') {
        newSortDirection = 'ASC'
      }

      setSort(columnInfo.name, newSortDirection)
    }

    const filterByDateRange = range => {
      if (range?.length === 2) {
        setFilter(
          columnInfo.name,
          `${dateToCompactStringLocal(range[0])}-${dateToCompactStringLocal(
            range[1],
          )}`,
        )
      } else setFilter(columnInfo.name, null)
    }

    return (
      <HeadingCell onClick={changeSort} {...columnInfo}>
        {
          '\u200B' /* zero-width space so the layout engine understands where the baseline is */
        }
        <Popup
          arrow={false}
          closeOnDocumentClick
          closeOnEscape
          on="click"
          position="bottom center"
          trigger={() => (
            <IconButton type="button">
              <CalendarIcon isActive={!!columnInfo.filterValue} />
            </IconButton>
          )}
        >
          {close => (
            <DateRangeCalendar
              onChange={range => {
                filterByDateRange(range)
                close()
              }}
              value={getDateRangeFromFilterString(columnInfo.filterValue)}
            />
          )}
        </Popup>

        {columnInfo.title}
        {columnInfo.sortDirection === 'ASC' && <SortDown />}
        {columnInfo.sortDirection === 'DESC' && <SortUp />}
      </HeadingCell>
    )
  }

  if (columnInfo.filterOptions && columnInfo.filterOptions.length > 1) {
    const options = [
      {
        label: <i>{t('manuscriptsTable.all')}</i>,
        value: '',
      },
    ].concat(columnInfo.filterOptions)

    return (
      <Cell {...columnInfo}>
        <Select
          aria-label={columnInfo.title}
          customStyles={{
            container: provided => ({
              ...provided,
              width: 'min(100%, 10em)',
              overflow: 'visible',
            }),
            control: provided => ({
              ...provided,
              minHeight: 'unset',
            }),
            dropdownIndicator: provided => ({
              ...provided,
              padding: '0 2px 0 0',
            }),
            indicatorSeparator: provided => ({
              ...provided,
              display: 'none',
            }),
            placeholder: provided => ({
              ...provided,
              margin: 0,
            }),
            valueContainer: provided => ({
              ...provided,
              padding: '0 6px',
            }),
          }}
          data-testid={columnInfo.name}
          label={columnInfo.title}
          onChange={selected => setFilter(columnInfo.name, selected.value)}
          options={options}
          placeholder={columnInfo.title}
          value={columnInfo.filterValue}
        />
      </Cell>
    )
  }

  if (columnInfo.canSort) {
    const changeSort = () => {
      const priorSortName = sortName
      let newSortDirection

      if (priorSortName !== columnInfo.name) {
        newSortDirection = columnInfo.defaultSortDirection
      } else if (sortDirection === 'ASC') {
        newSortDirection = 'DESC'
      } else if (sortDirection === 'DESC') {
        newSortDirection = 'ASC'
      }

      setSort(columnInfo.name, newSortDirection)
    }

    return (
      <Cell onClick={changeSort} {...columnInfo}>
        {columnInfo.title}
        {columnInfo.sortDirection === 'ASC' && <SortDown />}
        {columnInfo.sortDirection === 'DESC' && <SortUp />}
      </Cell>
    )
  }

  return <Cell {...columnInfo}>{columnInfo.title}</Cell>
}

export default FilterSortHeader
