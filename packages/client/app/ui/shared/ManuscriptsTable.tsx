/**
 * Collapse regions to make this file more managable to read through.
 *
 * A good starting point to find details for a specific column is to go to the
 * column-setup region and see what other region that leads you to.
 */

// #region import
import {
  type ReactNode,
  type MouseEvent,
  Fragment,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useTranslation, Trans } from 'react-i18next'
import styled from 'styled-components'
import {
  th,
  grid,
  Search,
  Select,
  Button,
  ButtonGroup,
  Radio as RadioGroupInput,
  Switch,
} from '@coko/client'
import {
  ConfigProvider,
  DatePicker,
  Radio,
  Tooltip,
  type TableColumnType,
} from 'antd'
import type { FilterDropdownProps, SorterResult } from 'antd/es/table/interface'
import dayjs from 'dayjs'
import DOMPurify from 'isomorphic-dompurify'

import Table from './Table'
import Badge from './Badge'
import Avatar from './Avatar'
import {
  Close,
  Coar,
  Help,
  Info,
  SemanticScholar,
  Table as TableIcon,
  Tasks,
} from '../base/Icons'
import ManuscriptStatus from './ManuscriptStatus'
import ReviewerStatus from './ReviewerStatus'
import {
  type ReviewerStatusValue,
  reviewerStatusTranslationKeys,
  reviewerStatusVariants,
  badgeVariantColorTokens,
  badgeDefaultColorToken,
} from './_constants'
import { convertTimestampToRelativeDateString } from '../../shared/dateUtils'
// #endregion import

// #region helpers
const RICH_TEXT_PREFIX_REGEX = /^\s*<p(?: class="paragraph")?>/

const renderPlainOrRichText = (value: any): ReactNode => {
  if (!value || !RICH_TEXT_PREFIX_REGEX.test(value)) return value || null
  return (
    <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(value) }} />
  )
}
// #endregion helpers

// #region options
type ManuscriptsTableColumnOption = {
  value: string
  label?: string
  labelColor?: string
}

const renderSingleOption = (
  value: string,
  options: ManuscriptsTableColumnOption[],
  testId?: string,
): ReactNode => {
  const option = options.find(o => o.value === value)

  return (
    <Badge
      data-testid={testId}
      small
      style={
        option?.labelColor ? { backgroundColor: option.labelColor } : undefined
      }
    >
      {option?.label ?? value}
    </Badge>
  )
}

const OptionsListWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${grid(1)};
`

const renderOptions = (
  value: any,
  options: ManuscriptsTableColumnOption[] = [],
): ReactNode => {
  if (!value) return null

  if (Array.isArray(value)) {
    if (value.length === 0) return null

    return (
      <OptionsListWrapper>
        {value.map(v => (
          <Fragment key={v}>{renderSingleOption(v, options)}</Fragment>
        ))}
      </OptionsListWrapper>
    )
  }

  return renderSingleOption(value, options)
}

const EditableOptionSelect = styled(Select)`
  .ant-select {
    padding-block: ${grid(1)};
  }
`

/**
 * Single-value only - not meant for the array/multi-select case.
 */
const renderEditableOption = (
  value: any,
  record: Record<string, any>,
  column: ManuscriptsTableColumn,
  onOptionChange:
    | ((columnKey: string, id: string, value: string | null) => void)
    | undefined,
): ReactNode => {
  const options = column.options ?? []
  const id = record.id

  return (
    <EditableOptionSelect
      allowClear
      data-testid="editable-option-select"
      labelRender={({ value: selectedValue }): ReactNode =>
        renderSingleOption(selectedValue as string, options)
      }
      onChange={(newValue: string | undefined): void =>
        onOptionChange?.(column.key, id, newValue ?? null)
      }
      onClick={(event: MouseEvent): void => event.stopPropagation()}
      optionRender={option =>
        renderSingleOption(option.value as string, options, 'editable-option')
      }
      options={options.map(option => ({
        value: option.value,
        label: option.label ?? option.value,
      }))}
      size="small"
      value={value || undefined}
    />
  )
}
// #endregion options

// #region person
const PersonWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${grid(2)};
`

const PersonInfo = styled.div`
  display: flex;
  flex-direction: column;
`

const PersonName = styled.span`
  white-space: nowrap;
`

const PersonIdentifier = styled.span`
  color: ${th('colorTextPlaceholder')};
  font-size: ${th('fontSizeBaseSmaller')};
  white-space: nowrap;
`

const renderPerson = (value: any): ReactNode => {
  if (!value) return null

  return (
    <PersonWrapper>
      <Avatar size={10} src={value.profilePicture} />
      <PersonInfo>
        <PersonName data-testid="person-name">{value.displayName}</PersonName>
        {value.orcid && (
          <PersonIdentifier>{`ORCID: ${value.orcid}`}</PersonIdentifier>
        )}
      </PersonInfo>
    </PersonWrapper>
  )
}
// #endregion person

// #region title
const TitleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${grid(1)};
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${grid(3)};
`

const CoarIcon = styled(Coar)`
  margin-top: -2px;
`

const TitleAbstractButton = styled.button`
  display: inline-flex;
  align-items: center;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  cursor: pointer;
`

const TitleAbstractTooltipContent = styled.div`
  padding: ${grid(4)};
`

const TitleAbstractTooltipHeader = styled.div`
  border-bottom: 1px solid ${th('colorTextReverse')};
  margin-bottom: ${grid(1)};
`

const ABSTRACT_WORD_LIMIT = 60

const truncateAbstract = (abstract: string): string => {
  const words = abstract.trim().split(/\s+/)
  if (words.length <= ABSTRACT_WORD_LIMIT) return abstract
  return `${words.slice(0, ABSTRACT_WORD_LIMIT).join(' ')}...`
}

const stripHtml = (html: string): string =>
  DOMPurify.sanitize(html, { ALLOWED_TAGS: [] })

const TITLE_CHARACTER_LIMIT = 60

const truncateTitle = (title: string): string => {
  const plainTitle = stripHtml(title)
  if (plainTitle.length <= TITLE_CHARACTER_LIMIT) return plainTitle
  return `${plainTitle.slice(0, TITLE_CHARACTER_LIMIT).trimEnd()}...`
}

type TitleCellValue = {
  title: string
  hasOverdueTasks?: boolean
  importSource?: 'coar' | 'semanticScholar'
  abstract?: string
  /** When set, the title text links out to this URL */
  link?: string
}

const TitleCell = ({
  value,
  showAbstract,
}: {
  value: TitleCellValue
  showAbstract?: boolean
}): ReactNode => {
  const { t } = useTranslation()

  if (!value) return null

  return (
    <TitleWrapper>
      <TitleRow>
        {value.importSource === 'coar' && <CoarIcon aria-hidden />}
        {value.importSource === 'semanticScholar' && (
          <SemanticScholar aria-hidden />
        )}

        <span>
          {value.link ? (
            <a href={value.link} rel="noreferrer" target="_blank">
              {renderPlainOrRichText(truncateTitle(value.title))}
            </a>
          ) : (
            renderPlainOrRichText(truncateTitle(value.title))
          )}
        </span>

        {showAbstract && (
          <ConfigProvider
            theme={{ components: { Tooltip: { maxWidth: 600 } } }}
          >
            <Tooltip
              title={
                <TitleAbstractTooltipContent data-testid="abstract-tooltip">
                  <TitleAbstractTooltipHeader>
                    {t('manuscriptsTable.abstractHeader')}
                  </TitleAbstractTooltipHeader>
                  {value.abstract
                    ? truncateAbstract(stripHtml(value.abstract))
                    : t('manuscriptsTable.noAbstract')}
                </TitleAbstractTooltipContent>
              }
              trigger={['click']}
            >
              <TitleAbstractButton
                aria-label={t('manuscriptsTable.showAbstract')}
                data-testid="abstract-tooltip-icon"
                type="button"
              >
                <Info />
              </TitleAbstractButton>
            </Tooltip>
          </ConfigProvider>
        )}
      </TitleRow>

      {value.hasOverdueTasks && (
        <Badge small variant="error">
          {t('manuscriptsTable.overdueTasks')}
        </Badge>
      )}
    </TitleWrapper>
  )
}
// #endregion title

// #region dates
const { RangePicker } = DatePicker

const DateRangeFilterWrapper = styled.div`
  padding: ${grid(2)};
`

const buildDateRangePresets = (): {
  label: string
  value: () => [any, any]
}[] => [
  { label: 'Today', value: () => [dayjs(), dayjs()] },
  {
    label: 'Yesterday',
    value: () => [dayjs().subtract(1, 'day'), dayjs().subtract(1, 'day')],
  },
  { label: 'Past 7 days', value: () => [dayjs().subtract(7, 'day'), dayjs()] },
  {
    label: 'Past 30 days',
    value: () => [dayjs().subtract(30, 'day'), dayjs()],
  },
  {
    label: 'Past 90 days',
    value: () => [dayjs().subtract(90, 'day'), dayjs()],
  },
  { label: 'Past year', value: () => [dayjs().subtract(1, 'year'), dayjs()] },
]

const DateRangeFilterDropdown = ({
  selectedKeys,
  setSelectedKeys,
  confirm,
}: FilterDropdownProps): ReactNode => {
  const [start, end] = selectedKeys as unknown as [string, string] | []

  const handleChange = (
    _dates: unknown,
    // antd passes null here (not ['', '']) when the range is cleared via the "x" button
    dateStrings: [string, string] | null,
  ): void => {
    setSelectedKeys(dateStrings?.[0] && dateStrings?.[1] ? dateStrings : [])
    confirm()
  }

  return (
    <DateRangeFilterWrapper>
      <RangePicker
        onChange={handleChange}
        presets={buildDateRangePresets()}
        value={start && end ? [dayjs(start), dayjs(end)] : null}
      />
    </DateRangeFilterWrapper>
  )
}

const renderDate = (value: any): ReactNode => {
  if (!value) return null
  return convertTimestampToRelativeDateString(value)
}
// #endregion dates

// #region search-snippets
const SnippetsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${grid(2)} ${grid(4)};
  font-size: ${th('fontSizeBaseSmall')};
`

const renderHighlightedSnippet = (html: string): ReactNode => {
  // replace postgres <b> tags with <mark>
  const matchTag = /<b>(.*?)<\/b>/g
  const parts: ReactNode[] = []
  let cursor = 0
  let match = matchTag.exec(html)

  while (match) {
    if (match.index > cursor) parts.push(html.slice(cursor, match.index))
    parts.push(<mark>{match[1]}</mark>)
    cursor = matchTag.lastIndex
    match = matchTag.exec(html)
  }

  if (cursor < html.length) parts.push(html.slice(cursor))

  return parts.map((part, index) => <Fragment key={index}>{part}</Fragment>)
}

type ManuscriptSearchSnippet = {
  field: string
  html: string
}

const SearchSnippets = ({
  snippets,
}: {
  snippets: ManuscriptSearchSnippet[]
}): ReactNode => (
  <SnippetsWrapper>
    {snippets.map(({ field, html }) => (
      <div key={field}>
        <strong>{field}:</strong> {renderHighlightedSnippet(html)}
      </div>
    ))}
  </SnippetsWrapper>
)

const hasSearchSnippets = (row: Record<string, any>): boolean =>
  Array.isArray(row.searchSnippets) && row.searchSnippets.length > 0
// #endregion search-snippets

// #region column-header-help
const ColumnTitleWithTooltipWrapper = styled.span`
  align-items: center;
  display: inline-flex;
  gap: ${grid(2)};
`

const ColumnTitleWithTooltip = ({
  title,
  tooltip,
}: {
  title: ReactNode
  tooltip: string
}): ReactNode => (
  <ColumnTitleWithTooltipWrapper>
    {title}
    <Tooltip title={tooltip} trigger={['click']}>
      <SearchInfoButton aria-label={tooltip} type="button">
        <Help />
      </SearchInfoButton>
    </Tooltip>
  </ColumnTitleWithTooltipWrapper>
)
// #endregion column-header-help

// #region reviewer-grid
const ReviewerStatusColumnHeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${grid(2)};
`

const RadioGroup = styled(RadioGroupInput)`
  display: flex;

  /* stylelint-disable declaration-no-important */
  .ant-radio-button-wrapper {
    background-color: ${th('colorPrimary')} !important;
    color: ${th('colorTextReverse')} !important;
    border: 1px solid transparent;
    transition: border 0.2s ease;

    span[role='img'] {
      margin-top: 3px;
    }

    &:hover {
      border: 1px solid ${th('colorTextReverse')};
    }
  }

  .ant-radio-button-wrapper-checked {
    background-color: ${th('colorTextReverse')} !important;
    color: ${th('colorPrimary')} !important;
    border-color: ${th('colorTextReverse')} !important;
  }
`

const ReviewerStatusColumnHeader = ({
  title,
  isCompact,
  onChange,
}: {
  title: ReactNode
  isCompact: boolean
  onChange: (isCompact: boolean) => void
}): ReactNode => {
  const { t } = useTranslation()

  return (
    <ReviewerStatusColumnHeaderWrapper>
      {title}
      <RadioGroup
        buttonStyle="solid"
        onChange={(value: string): void => onChange(value === 'compact')}
        optionType="button"
        size="small"
        value={isCompact ? 'compact' : 'detailed'}
      >
        <Tooltip title="Detailed hover view">
          <Radio.Button
            aria-label={t('manuscriptsTable.detailedView')}
            value="detailed"
          >
            <TableIcon />
          </Radio.Button>
        </Tooltip>
        <Tooltip title="Compact hover view">
          <Radio.Button
            aria-label={t('manuscriptsTable.compactView')}
            value="compact"
          >
            <Tasks />
          </Radio.Button>
        </Tooltip>
      </RadioGroup>
    </ReviewerStatusColumnHeaderWrapper>
  )
}

const ReviewerStatusGridWrapper = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  gap: ${grid(1)};
  max-width: calc(${grid(4)} * 5 + ${grid(1)} * 4);
`

const ReviewerStatusSquare = styled.span<{ $colorToken: string }>`
  display: inline-block;
  width: ${grid(4)};
  height: ${grid(4)};
  border-radius: ${th('borderRadius')};
  background-color: ${(props: { theme: any; $colorToken: string }): string =>
    props.theme[props.$colorToken]};
`

const ReviewerStatusTooltipList = styled.div<{ $columns: number }>`
  display: grid;
  grid-template-columns: ${(props: { $columns: number }): string =>
    `repeat(${props.$columns}, minmax(0, 1fr))`};
  gap: ${grid(4)};
  padding: ${grid(2)};
`

const ReviewerStatusTooltipRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${grid(2)};
  padding-bottom: ${grid(1)};
  margin-bottom: ${grid(1)};
  border-bottom: 1px solid ${th('colorBorder')};
  font-size: ${th('fontSizeBaseSmall')};
`

const ReviewerStatusTooltipSwatch = styled.span<{ $colorToken: string }>`
  flex-shrink: 0;
  width: ${grid(3)};
  height: ${grid(3)};
  border-radius: ${th('borderRadius')};
  background-color: ${(props: { theme: any; $colorToken: string }): string =>
    props.theme[props.$colorToken]};
`

const ReviewerStatusTooltipGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${grid(1)};
`

const ReviewerStatusTooltipMembers = styled.div`
  display: flex;
  flex-direction: column;
  font-size: ${th('fontSizeBaseSmaller')};
`

const ReviewerStatusTooltipCompactList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${grid(1)};
  padding: ${grid(2)};
  font-size: ${th('fontSizeBaseSmall')};
`

const ReviewerStatusTooltipCompactRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${grid(2)};
`

const resolveReviewerStatusColorToken = (
  status: ReviewerStatusValue,
): string => {
  const variant = reviewerStatusVariants[status]
  return variant ? badgeVariantColorTokens[variant] : badgeDefaultColorToken
}

type ReviewerStatusEntry = {
  status: ReviewerStatusValue
  name: string
}

const ReviewerStatusSummary = ({
  value,
  isCompact,
}: {
  value: any
  isCompact: boolean
}): ReactNode => {
  const { t } = useTranslation()

  if (!Array.isArray(value) || value.length === 0) return null

  const reviewers = value as ReviewerStatusEntry[]

  const groups: Partial<Record<ReviewerStatusValue, ReviewerStatusEntry[]>> = {}

  reviewers.forEach(reviewer => {
    groups[reviewer.status] = [...(groups[reviewer.status] ?? []), reviewer]
  })

  const groupEntries = Object.entries(groups) as [
    ReviewerStatusValue,
    ReviewerStatusEntry[],
  ][]

  const content = isCompact ? (
    <ReviewerStatusTooltipCompactList>
      {groupEntries.map(([status, members]) => (
        <ReviewerStatusTooltipCompactRow key={status}>
          <ReviewerStatusTooltipSwatch
            $colorToken={resolveReviewerStatusColorToken(status)}
          />
          <span>
            <strong>{members.length}</strong>{' '}
            {t(reviewerStatusTranslationKeys[status])}
          </span>
        </ReviewerStatusTooltipCompactRow>
      ))}
    </ReviewerStatusTooltipCompactList>
  ) : (
    <ReviewerStatusTooltipList $columns={Math.min(groupEntries.length, 3)}>
      {groupEntries.map(([status, members]) => (
        <ReviewerStatusTooltipGroup key={status}>
          <ReviewerStatusTooltipRow>
            <ReviewerStatusTooltipSwatch
              $colorToken={resolveReviewerStatusColorToken(status)}
            />
            <span>
              <strong>{members.length}</strong>{' '}
              {t(reviewerStatusTranslationKeys[status])}
            </span>
          </ReviewerStatusTooltipRow>
          <ReviewerStatusTooltipMembers>
            {members.map(member => (
              <span key={member.name}>{member.name}</span>
            ))}
          </ReviewerStatusTooltipMembers>
        </ReviewerStatusTooltipGroup>
      ))}
    </ReviewerStatusTooltipList>
  )

  return (
    <ConfigProvider theme={{ components: { Tooltip: { maxWidth: 600 } } }}>
      <Tooltip title={content}>
        <ReviewerStatusGridWrapper>
          {reviewers.map(({ status, name }) => (
            <ReviewerStatusSquare
              $colorToken={resolveReviewerStatusColorToken(status)}
              aria-label={`${name}: ${t(reviewerStatusTranslationKeys[status])}`}
              data-testid="reviewer-status-square"
              key={name}
              role="img"
            />
          ))}
        </ReviewerStatusGridWrapper>
      </Tooltip>
    </ConfigProvider>
  )
}
// #endregion reviewer-grid

// #region filter-chips
const FilterChipsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${grid(1)};
  margin-bottom: ${grid(2)};
`

const FilterChipCloseButton = styled.button`
  display: inline-flex;
  margin-left: ${grid(2)};
  background: none;
  color: inherit;
  cursor: pointer;
`

const formatChipDate = (value: string): string =>
  dayjs(value).format('MMM D, YYYY')

type FilterChip = {
  key: string
  label: string
  onRemove: (event: MouseEvent<HTMLElement>) => void
}

/**
 * Sets the column's filter to an empty array rather than deleting the key
 * outright: a consumer's onFiltersChange (e.g. SubmissionsTable.jsx) needs to
 * see the key present-but-empty to know it should clear that column's URL
 * param -- a missing key looks like "untouched".
 */
const withoutColumnFilter = (
  filters: Record<string, string[]>,
  columnKey: string,
): Record<string, string[]> => ({
  ...filters,
  [columnKey]: [],
})

const buildFilterChips = (
  columns: ManuscriptsTableColumn[],
  columnFilters: Record<string, string[]>,
  onFiltersChange: (filters: Record<string, string[]>) => void,
): FilterChip[] => {
  const chips: FilterChip[] = []

  Object.entries(columnFilters).forEach(([columnKey, values]) => {
    if (!values || values.length === 0) return

    const column = columns.find(c => c.key === columnKey)
    if (!column) return

    if (column.dataType === 'date') {
      const [start, end] = values
      if (!start || !end) return

      chips.push({
        key: columnKey,
        label: `${column.title}: ${formatChipDate(start)} – ${formatChipDate(end)}`,
        onRemove: event => {
          event.preventDefault()
          onFiltersChange(withoutColumnFilter(columnFilters, columnKey))
        },
      })
      return
    }

    values.forEach(value => {
      const label = column.options?.find(o => o.value === value)?.label ?? value

      chips.push({
        key: `${columnKey}:${value}`,
        label: `${column.title}: ${label}`,
        onRemove: event => {
          event.preventDefault()
          const remaining = values.filter(v => v !== value)

          onFiltersChange(
            remaining.length > 0
              ? { ...columnFilters, [columnKey]: remaining }
              : withoutColumnFilter(columnFilters, columnKey),
          )
        },
      })
    })
  })

  return chips
}
// #endregion filter-chips

// #region column-setup
export type ManuscriptsTableColumn = {
  align?: 'left' | 'center' | 'right'
  dataIndex: string
  /**
   * Opts into one of this component's built-in renderers for a common kind of
   * value. Ignored if `render` is also supplied.
   */
  dataType?:
    | 'date'
    | 'status'
    | 'reviewerStatus'
    | 'reviewerStatusSummary'
    | 'badge'
    | 'options'
    | 'person'
    | 'title'
    | 'richText'
  /**
   * Applies to the 'options' datatype, single-value case only.
   * Renders a select dropdown instead of a static badge.
   */
  editable?: boolean
  /** Applies to 'options', 'status', 'reviewerStatus' and 'date' datatypes */
  filterable?: boolean
  /**
   * Shows a question-mark icon next to the column header, with this text in a
   * click-to-opne tooltip.
   */
  helpTooltip?: string
  key: string
  title: string
  options?: ManuscriptsTableColumnOption[]
  /**
   * Escape hatch for anything else (e.g. an actions column with
   * business-specific links) -- takes precedence over dataType.
   */
  render?: (value: any, record: any) => ReactNode
  /**
   * Applies to the 'title' datatype -- shows an info icon that opens a tooltip
   * with the manuscript's abstract on click.
   */
  showAbstract?: boolean
  sortable?: boolean
}

const resolveColumn = (
  column: ManuscriptsTableColumn,
  context: {
    columnFilters?: Record<string, string[]>
    sortState?: ManuscriptsTableSortState | null
    reviewerStatusViewMode?: 'compact' | 'detailed'
    onReviewerStatusViewModeChange?: (viewMode: 'compact' | 'detailed') => void
    onOptionChange?: (
      columnKey: string,
      id: string,
      value: string | null,
    ) => void
  },
): TableColumnType<Record<string, any>> => {
  let resolved: TableColumnType<Record<string, any>> = column

  // maps datatypes to their render functions (unless a custom render is provided)
  if (!column.render) {
    switch (column.dataType) {
      case 'badge':
        resolved = {
          ...column,
          render: (value: any): ReactNode => <Badge small>{value}</Badge>,
        }
        break
      case 'date':
        resolved = { ...column, render: renderDate }
        break
      case 'options':
        resolved = {
          ...column,
          render: (value: any, record: Record<string, any>): ReactNode =>
            column.editable
              ? renderEditableOption(
                  value,
                  record,
                  column,
                  context.onOptionChange,
                )
              : renderOptions(value, column.options),
        }
        break
      case 'person':
        resolved = { ...column, render: renderPerson }
        break
      case 'reviewerStatus':
        resolved = {
          ...column,
          render: (value: any): ReactNode => (
            <ReviewerStatus small status={value} />
          ),
        }
        break
      case 'reviewerStatusSummary':
        resolved = {
          ...column,
          render: (value: any): ReactNode => (
            <ReviewerStatusSummary
              isCompact={
                (context.reviewerStatusViewMode ?? 'detailed') === 'compact'
              }
              value={value}
            />
          ),
        }
        break
      case 'richText':
        resolved = {
          ...column,
          render: (value: any): ReactNode => renderPlainOrRichText(value),
        }
        break
      case 'status':
        resolved = {
          ...column,
          render: (value: any, record: Record<string, any>): ReactNode => (
            <ManuscriptStatus
              published={record.published}
              small
              status={value}
            />
          ),
        }
        break
      case 'title':
        resolved = {
          ...column,
          render: (value: any): ReactNode => (
            <TitleCell showAbstract={column.showAbstract} value={value} />
          ),
        }
        break
      default:
        break
    }
  }

  if (column.filterable && column.options) {
    resolved = {
      ...resolved,
      filters: column.options.map(({ value, label }) => ({
        text: label ?? value,
        value,
      })),
      filteredValue: context.columnFilters?.[column.key] ?? null,
    }
  }

  if (column.filterable && column.dataType === 'date') {
    resolved = {
      ...resolved,
      filterDropdown: (props: FilterDropdownProps): ReactNode => (
        <DateRangeFilterDropdown {...props} />
      ),
      filteredValue: context.columnFilters?.[column.key] ?? null,
    }
  }

  if (column.helpTooltip) {
    resolved = {
      ...resolved,
      title: (
        <ColumnTitleWithTooltip
          title={resolved.title as ReactNode}
          tooltip={column.helpTooltip}
        />
      ),
    }
  }

  if (column.dataType === 'reviewerStatusSummary') {
    resolved = {
      ...resolved,
      title: (
        <ReviewerStatusColumnHeader
          isCompact={
            (context.reviewerStatusViewMode ?? 'detailed') === 'compact'
          }
          onChange={isCompact =>
            context.onReviewerStatusViewModeChange?.(
              isCompact ? 'compact' : 'detailed',
            )
          }
          title={resolved.title as ReactNode}
        />
      ),
    }
  }

  // Ignored (forced off) for 'render' escape-hatch columns -- they have no
  // real dataIndex value semantics for the server to sort on.
  if (column.sortable && !column.render) {
    resolved = {
      ...resolved,
      sorter: true,
      sortOrder:
        context.sortState?.columnKey === column.key
          ? context.sortState.order
          : null,
    }
  }

  resolved = {
    ...resolved,
    onCell: (): Record<string, any> => ({ 'data-testid': column.key }),
    onHeaderCell: (): Record<string, any> => ({ 'data-testid': column.key }),
  }

  return resolved
}
// #endregion column-setup

// #region table-styles
const SearchBarWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${grid(2)};
  margin-bottom: ${grid(3)};
  padding: 0 ${grid(1)};

  .ant-input-search {
    flex: 1;
  }
`

const SearchInfoButton = styled.button`
  display: inline-flex;
  align-items: center;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  cursor: pointer;
`

const SearchTipsList = styled.ul`
  margin: 0;
  padding-left: ${grid(4)};
`

const SelectionActionsWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${grid(2)};
  margin-bottom: ${grid(2)};
`

const ViewArchivedToggleWrapper = styled.div`
  margin-left: auto;
`

const SelectionCount = styled.span`
  font-size: ${th('fontSizeBaseSmall')};
  color: ${th('colorTextPlaceholder')};
`

const EmptyStatePlaceholder = styled.div`
  color: ${th('colorTextPlaceholder')};
  display: grid;
  height: 100%;
  padding: ${grid(8)};
  place-items: center;
`
// #endregion table-styles

// #region table-render
export type ManuscriptsTableSortState = {
  columnKey: string
  order: 'ascend' | 'descend'
}

type ManuscriptsTableProps = {
  actionModal?: {
    confirm: (config: Record<string, any>) => void
    error: (config: Record<string, any>) => void
  }
  actionModalContextHolder?: ReactNode
  columns: ManuscriptsTableColumn[]
  /**
   * Currently selected filter values, keyed by column key (controlled), e.g.
   * { status: ['accepted', 'rejected'] }. Only relevant for columns with
   * `filterable: true`.
   */
  columnFilters?: Record<string, string[]>
  dataSource: Record<string, any>[]
  loading?: boolean
  onArchiveSelected?: (ids: string[]) => void
  onDownloadSelected?: (ids: string[]) => void
  onFiltersChange?: (filters: Record<string, string[]>) => void
  /**
   * Fired when a value is picked or cleared in an `editable` 'options' column. `id` is the
   * changed manuscript's `record.id`; `value` is `null` when cleared.
   */
  onOptionChange?: (columnKey: string, id: string, value: string | null) => void
  onPageChange: (page: number) => void
  onReviewerStatusViewModeChange?: (viewMode: 'compact' | 'detailed') => void
  onSearch: (value: string) => void
  onSortChange?: (sortState: ManuscriptsTableSortState | null) => void
  onUnarchiveSelected?: (ids: string[]) => void
  onViewingArchivedChange?: (viewingArchived: boolean) => void
  page: number
  pageSize: number
  /**
   * Compact/detailed view mode for 'reviewerStatusSummary' columns.
   * Defaults to 'detailed'.
   */
  reviewerStatusViewMode?: 'compact' | 'detailed'
  searchQuery?: string
  /**
   * Enables row selection checkboxes.
   */
  selectable?: boolean
  /** Only visible is selectable is true. */
  showArchiveActions?: boolean
  /** Only visible is selectable is true. */
  showDownloadAction?: boolean
  showViewArchivedToggle?: boolean
  /**
   * Currently applied sort (controlled), for a single `sortable` column.
   * `null`/`undefined` means unsorted.
   */
  sortState?: ManuscriptsTableSortState | null
  totalCount: number
  viewingArchived?: boolean
}

const ManuscriptsTable = ({
  actionModal,
  actionModalContextHolder,
  columnFilters,
  columns,
  dataSource,
  loading = false,
  onArchiveSelected,
  onDownloadSelected,
  onFiltersChange,
  onOptionChange,
  onPageChange,
  onReviewerStatusViewModeChange,
  onSearch,
  onSortChange,
  onUnarchiveSelected,
  onViewingArchivedChange,
  page,
  pageSize,
  reviewerStatusViewMode,
  searchQuery = '',
  selectable = false,
  showArchiveActions = false,
  showDownloadAction = false,
  showViewArchivedToggle = false,
  sortState,
  totalCount,
  viewingArchived = false,
}: ManuscriptsTableProps): ReactNode => {
  const { t } = useTranslation()
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([])
  const searchBarRef = useRef<HTMLDivElement>(null)

  // effect handles keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      const { activeElement } = document

      if (event.key === 'Escape') {
        if (
          activeElement instanceof HTMLElement &&
          searchBarRef.current?.contains(activeElement)
        ) {
          activeElement.blur()
        }

        return
      }

      if (event.key !== '/') return

      const isEditableElementFocused =
        activeElement instanceof HTMLElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.isContentEditable)

      if (isEditableElementFocused) return

      event.preventDefault()
      searchBarRef.current?.querySelector('input')?.focus()
    }

    document.addEventListener('keydown', handleKeyDown)
    return (): void => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const filterChips = [
    ...(searchQuery
      ? [
          {
            key: 'searchQuery',
            label: t('manuscriptsTable.searchChip', { query: searchQuery }),
            onRemove: (event: MouseEvent<HTMLElement>): void => {
              event.preventDefault()
              onSearch('')
            },
          },
        ]
      : []),
    ...(columnFilters && onFiltersChange
      ? buildFilterChips(columns, columnFilters, onFiltersChange)
      : []),
    ...(viewingArchived
      ? [
          {
            key: 'viewingArchived',
            label: t('manuscriptsPage.archivedManuscripts'),
            onRemove: (event: MouseEvent<HTMLElement>): void => {
              event.preventDefault()
              onViewingArchivedChange?.(false)
            },
          },
        ]
      : []),
  ]

  // #region search-snippets
  const rowsWithSnippets = dataSource.filter(hasSearchSnippets)

  const expandable = rowsWithSnippets.length > 0 && {
    expandedRowKeys: rowsWithSnippets.map(row => row.key),
    expandedRowRender: (record: Record<string, any>): ReactNode => (
      <SearchSnippets snippets={record.searchSnippets} />
    ),
    rowExpandable: hasSearchSnippets,
    showExpandColumn: false,
  }
  // #endregion search-snippets

  // #region row-selection
  const selectedRows = dataSource.filter(row => selectedRowIds.includes(row.id))

  const showSelectionActions =
    (selectable && (showArchiveActions || showDownloadAction)) ||
    showViewArchivedToggle

  const hasSelection = selectedRows.length > 0
  const allSelectedAreArchived =
    hasSelection && selectedRows.every(row => row.archived)
  const noneSelectedAreArchived =
    hasSelection && selectedRows.every(row => !row.archived)

  const rowSelection = selectable
    ? {
        selectedRowKeys: selectedRows.map(row => row.key),
        onChange: (_keys: unknown[], rows: Record<string, any>[]): void =>
          setSelectedRowIds(rows.map(row => row.id)),
      }
    : undefined
  // #endregion row-selection

  // #region handlers
  const filterableColumns = columns.filter(column =>
    Boolean(
      column.filterable && (column.options || column.dataType === 'date'),
    ),
  )

  /**
   * Reports which values are selected, for every filterable column, and
   * (separately) the current sort, for whichever sortable column the user last
   * clicked. Never sorts `dataSource` itself -- the caller re-fetches.
   */
  const handleTableChange = (
    _pagination: unknown,
    filters: Record<string, (string | number | boolean)[] | null>,
    sorter:
      | SorterResult<Record<string, any>>
      | SorterResult<Record<string, any>>[],
  ): void => {
    if (filterableColumns.length > 0 && onFiltersChange) {
      onFiltersChange(
        Object.fromEntries(
          filterableColumns.map(column => [
            column.key,
            (filters[column.key] ?? []) as string[],
          ]),
        ),
      )
    }

    if (onSortChange) {
      const activeSorter = Array.isArray(sorter) ? sorter[0] : sorter

      onSortChange(
        activeSorter?.order && activeSorter.columnKey
          ? {
              columnKey: String(activeSorter.columnKey),
              order: activeSorter.order,
            }
          : null,
      )
    }
  }

  const handleArchiveClick = (): void => {
    actionModal?.confirm({
      content: t('manuscriptsTable.confirmArchive', {
        count: selectedRows.length,
      }),
      okText: t('common.OK'),
      cancelText: t('common.Cancel'),
      onOk: () => {
        onArchiveSelected?.(selectedRows.map(row => row.id))
        setSelectedRowIds([])
      },
    })
  }

  const handleUnarchiveClick = (): void => {
    actionModal?.confirm({
      content: t('manuscriptsTable.confirmUnarchive', {
        count: selectedRows.length,
      }),
      okText: t('common.OK'),
      cancelText: t('common.Cancel'),
      onOk: () => {
        onUnarchiveSelected?.(selectedRows.map(row => row.id))
        setSelectedRowIds([])
      },
    })
  }

  const handleDownloadClick = (): void => {
    onDownloadSelected?.(selectedRows.map(row => row.id))
  }
  // #endregion handlers

  const resolvedColumns = columns.map(column =>
    resolveColumn(column, {
      columnFilters,
      sortState,
      reviewerStatusViewMode,
      onReviewerStatusViewModeChange,
      onOptionChange,
    }),
  )

  return (
    <>
      {actionModalContextHolder}

      {showSelectionActions && (
        <SelectionActionsWrapper>
          {selectable && (showArchiveActions || showDownloadAction) && (
            <>
              <SelectionCount data-testid="selected-manuscripts-number">
                {t('manuscriptsTable.selectedCount', {
                  count: selectedRows.length,
                })}
              </SelectionCount>

              <ButtonGroup>
                {showArchiveActions && (
                  <Button
                    disabled={!hasSelection || allSelectedAreArchived}
                    onClick={handleArchiveClick}
                    size="small"
                  >
                    {t('manuscriptsPage.Archive')}
                  </Button>
                )}
                {showArchiveActions && (
                  <Button
                    disabled={!hasSelection || noneSelectedAreArchived}
                    onClick={handleUnarchiveClick}
                    size="small"
                  >
                    {t('manuscriptsPage.Unarchive')}
                  </Button>
                )}
                {showDownloadAction && (
                  <Button
                    disabled={!hasSelection}
                    onClick={handleDownloadClick}
                    size="small"
                  >
                    {t('manuscriptsPage.exportAsJson')}
                  </Button>
                )}
              </ButtonGroup>
            </>
          )}

          {showViewArchivedToggle && (
            <ViewArchivedToggleWrapper>
              <Switch
                checked={viewingArchived}
                label={t('manuscriptsPage.viewArchived')}
                onChange={onViewingArchivedChange}
              />
            </ViewArchivedToggleWrapper>
          )}
        </SelectionActionsWrapper>
      )}

      {filterChips.length > 0 && (
        <FilterChipsWrapper>
          {filterChips.map(chip => (
            <Badge key={chip.key} small>
              {chip.label}
              <FilterChipCloseButton
                aria-label={t('manuscriptsTable.removeFilter')}
                onClick={chip.onRemove}
                type="button"
              >
                <Close />
              </FilterChipCloseButton>
            </Badge>
          ))}
        </FilterChipsWrapper>
      )}

      <SearchBarWrapper ref={searchBarRef}>
        <Search
          allowClear
          defaultValue={searchQuery}
          key={searchQuery}
          loading={loading}
          onSearch={onSearch}
          placeholder={t('common.Enter search terms...')}
        />

        <ConfigProvider theme={{ components: { Tooltip: { maxWidth: 480 } } }}>
          <Tooltip
            title={
              <TitleAbstractTooltipContent>
                <TitleAbstractTooltipHeader>
                  {t('manuscriptsTable.searchTipsHeader')}
                </TitleAbstractTooltipHeader>

                <SearchTipsList>
                  {(
                    t('manuscriptsTable.searchTips', {
                      returnObjects: true,
                    }) as string[]
                  ).map(tip => (
                    <li key={tip}>{tip}</li>
                  ))}
                </SearchTipsList>
              </TitleAbstractTooltipContent>
            }
            trigger={['click']}
          >
            <SearchInfoButton
              aria-label={(
                t('manuscriptsTable.searchTips', {
                  returnObjects: true,
                }) as string[]
              ).join(' ')}
              type="button"
            >
              <Info />
            </SearchInfoButton>
          </Tooltip>
        </ConfigProvider>
      </SearchBarWrapper>

      <Table
        bordered={false}
        columns={resolvedColumns}
        dataSource={dataSource}
        expandable={expandable}
        loading={loading}
        locale={{
          emptyText: (
            <EmptyStatePlaceholder data-testid="empty-manuscripts-table-placeholder">
              {t('manuscriptsTable.No matching manuscripts were found')}
            </EmptyStatePlaceholder>
          ),
        }}
        onChange={handleTableChange}
        pagination={{
          current: page,
          pageSize,
          total: totalCount,
          showTotal: (total: number, range: [number, number]) => (
            <Trans
              count={total}
              i18nKey="manuscriptsTable.pagination"
              values={{
                firstResult: range[0],
                lastResult: range[1],
                totalCount: total,
              }}
            />
          ),
          onChange: onPageChange,
        }}
        rowSelection={rowSelection}
      />
    </>
  )
}
// #endregion table-render

export default ManuscriptsTable
