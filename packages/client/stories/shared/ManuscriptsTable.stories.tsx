/* eslint-disable react-hooks/rules-of-hooks */

import { useState, type ReactNode } from 'react'

import preview from '../../.storybook/preview'
import ManuscriptsTable, {
  type ManuscriptsTableColumn,
} from '../../app/ui/shared/ManuscriptsTable'
import { MANUSCRIPT_STATUSES } from '../../app/ui/shared/ManuscriptStatus'
import {
  reviewerStatusValues,
  reviewerStatusTranslationKeys,
} from '../../app/ui/shared/_constants'
import Link from '../../app/ui/shared/Link'
import avatarImg from '../assets/avatar_sample.png'

const manuscriptStatusOptions = MANUSCRIPT_STATUSES.map(status => ({
  value: status,
  label: status,
}))

const reviewerStatusOptions = reviewerStatusValues.map(status => ({
  value: status,
  label: reviewerStatusTranslationKeys[status],
}))

const meta = preview.meta({
  component: ManuscriptsTable,
})

type Row = {
  key: string
  manuscriptNumber: number
  title: string
  status: string
  created: string
  updated: string
}

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
  { title: 'Updated', dataIndex: 'updated', key: 'updated', dataType: 'date' },
  {
    title: 'Actions',
    dataIndex: 'actions',
    key: 'actions',
    render: () => <Link to="#">View</Link>,
  },
]

const allData: Row[] = [
  {
    key: '1',
    manuscriptNumber: 101,
    title: 'Honey bee colonies benefit from grassland',
    status: 'submitted',
    created: '2026-07-01',
    updated: '2026-07-20',
  },
  {
    key: '2',
    manuscriptNumber: 102,
    title: 'A dataset of pollinator visitation rates',
    status: 'accepted',
    created: '2026-06-15',
    updated: '2026-07-18',
  },
  {
    key: '3',
    manuscriptNumber: 103,
    title: 'BeeTrack: software for tracking pollinators',
    status: 'inProgress',
    created: '2026-05-02',
    updated: '2026-07-10',
  },
  {
    key: '4',
    manuscriptNumber: 104,
    title: 'Neuropsychological effects of urban noise',
    status: 'rejected',
    created: '2026-04-11',
    updated: '2026-06-30',
  },
  {
    key: '5',
    manuscriptNumber: 105,
    title: 'Climate variability dataset for the Alps',
    status: 'completed',
    created: '2026-03-22',
    updated: '2026-05-14',
  },
]

const PAGE_SIZE = 3

export const Base = meta.story({
  args: {
    columns,
    dataSource: allData,
    page: 1,
    pageSize: PAGE_SIZE,
    totalCount: allData.length,
    onPageChange: () => {},
    onSearch: () => {},
  },
  render: args => {
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(false)

    const filtered = allData.filter(row =>
      row.title.toLowerCase().includes(search.toLowerCase()),
    )

    const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    const handleSearch = (value: string): void => {
      setLoading(true)

      setTimeout(() => {
        setSearch(value)
        setPage(1)
        setLoading(false)
      }, 1000)
    }

    const handlePageChange = (newPage: number): void => {
      setLoading(true)

      setTimeout(() => {
        setPage(newPage)
        setLoading(false)
      }, 1000)
    }

    return (
      <ManuscriptsTable
        {...args}
        dataSource={pageData}
        loading={loading}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        page={page}
        totalCount={filtered.length}
      />
    )
  },
})

const baseColumns: ManuscriptsTableColumn[] = [
  {
    title: 'No.',
    dataIndex: 'manuscriptNumber',
    key: 'manuscriptNumber',
    align: 'center',
  },
  { title: 'Title', dataIndex: 'title', key: 'title' },
]

const baseRow = {
  key: '1',
  manuscriptNumber: 101,
  title: 'Honey bee colonies benefit from grassland',
}

export const DefaultTextRendering = meta.story({
  args: {
    columns: baseColumns,
    dataSource: [baseRow],
    page: 1,
    pageSize: 10,
    totalCount: 1,
    onPageChange: () => {},
    onSearch: () => {},
  },
})

export const CenteredColumn = meta.story({
  args: {
    columns: [baseColumns[0], { ...baseColumns[1], align: 'center' }],
    dataSource: [baseRow],
    page: 1,
    pageSize: 10,
    totalCount: 1,
    onPageChange: () => {},
    onSearch: () => {},
  },
})

export const AlignRightColumn = meta.story({
  args: {
    columns: [baseColumns[0], { ...baseColumns[1], align: 'right' }],
    dataSource: [baseRow],
    page: 1,
    pageSize: 10,
    totalCount: 1,
    onPageChange: () => {},
    onSearch: () => {},
  },
})

/**
 * Combines a title with an optional import-source icon, an "Overdue tasks"
 * badge, (with `showAbstract`) a click-triggered info tooltip showing the
 * abstract, and (with `link`) a hyperlinked title opening the source in a new
 * tab.
 */
export const BuiltInTitleRendering = meta.story({
  args: {
    columns: [
      baseColumns[0],
      {
        title: 'Title',
        dataIndex: 'titleInfo',
        key: 'titleInfo',
        dataType: 'title',
        showAbstract: true,
      },
    ],
    dataSource: [
      {
        key: '1',
        manuscriptNumber: 101,
        titleInfo: {
          title: 'Honey bee colonies benefit from grassland',
          hasOverdueTasks: true,
          abstract:
            'Grassland habitats bordering agricultural land are increasingly recognized as a critical resource for pollinator health, yet the mechanisms behind this benefit remain poorly understood. In this study, we tracked twenty honey bee colonies over two foraging seasons across sites with varying proportions of adjacent grassland cover. Colonies near extensive grassland showed significantly higher overwintering survival, greater brood production, and lower incidence of common parasites compared to colonies in predominantly monoculture landscapes. Pollen analysis revealed a more diverse foraging diet in grassland-adjacent colonies, suggesting that floral diversity rather than raw forage volume drives the observed health benefits. These findings support targeted grassland conservation and restoration as a practical intervention for improving pollinator resilience in agricultural regions.',
        },
      },
      {
        key: '2',
        manuscriptNumber: 102,
        titleInfo: {
          title: 'A dataset of pollinator visitation rates',
          importSource: 'coar',
          link: 'https://doi.org/10.5281/zenodo.1234567',
          abstract:
            'We present a multi-year dataset of pollinator visitation rates collected across forty field sites spanning three biogeographic regions. Observations were recorded using a standardized timed-count protocol, capturing visitation frequency, pollinator identity to genus level, and flowering plant species for each interaction. The dataset includes over two hundred thousand individual visitation records alongside site-level metadata on land use, climate, and floral community composition. We anticipate this resource will support comparative analyses of pollinator community structure, phenological mismatch under climate change, and the design of pollinator-friendly agricultural policy. Data are provided in a normalized, analysis-ready format with accompanying documentation and quality-control flags for each observation.',
        },
      },
      {
        key: '3',
        manuscriptNumber: 103,
        titleInfo: {
          title: 'BeeTrack: software for tracking pollinators',
          importSource: 'semanticScholar',
          abstract:
            'BeeTrack is an open-source computer vision toolkit for automated tracking of individual pollinators in field video recordings. Built on a lightweight object-detection backbone, BeeTrack identifies and tracks multiple insects simultaneously under variable outdoor lighting conditions, exporting per-individual trajectories, flower-visit durations, and inter-flower flight paths. The software includes a graphical annotation interface for rapid model fine-tuning on new sites or species, and a batch-processing pipeline suitable for large-scale monitoring campaigns. In benchmark comparisons against manual observation, BeeTrack matched expert-annotated visitation counts within a five percent margin while reducing analysis time by over ninety percent, making continuous, fine-grained pollinator monitoring practical at landscape scale.',
        },
      },
      {
        key: '4',
        manuscriptNumber: 104,
        titleInfo: {
          title: 'Neuropsychological effects of urban noise',
        },
      },
      {
        key: '5',
        manuscriptNumber: 105,
        titleInfo: {
          title:
            '<p class="paragraph">Climate variability dataset for the <em>Alps</em></p>',
        },
      },
    ],
    page: 1,
    pageSize: 10,
    totalCount: 5,
    onPageChange: () => {},
    onSearch: () => {},
  },
})

export const BuiltInRichTextRendering = meta.story({
  args: {
    columns: [
      ...baseColumns,
      {
        title: 'Notes',
        dataIndex: 'notes',
        key: 'notes',
        dataType: 'richText',
      },
    ],
    dataSource: [
      {
        ...baseRow,
        notes:
          '<p class="paragraph">Reviewers should pay <strong>close attention</strong> to the methodology section.</p>',
      },
      {
        key: '2',
        manuscriptNumber: 102,
        title: 'A dataset of pollinator visitation rates',
        notes: 'Plain text notes with no formatting.',
      },
    ],
    page: 1,
    pageSize: 10,
    totalCount: 2,
    onPageChange: () => {},
    onSearch: () => {},
  },
})

export const BuiltInDateRendering = meta.story({
  args: {
    columns: [
      ...baseColumns,
      {
        title: 'Created',
        dataIndex: 'created',
        key: 'created',
        dataType: 'date',
      },
    ],
    dataSource: [{ ...baseRow, created: '2026-07-01' }],
    page: 1,
    pageSize: 10,
    totalCount: 1,
    onPageChange: () => {},
    onSearch: () => {},
  },
})

/**
 * `filterable` on a column with the `date` data type shows a date-range picker.
 * No `options` needed here.
 */
export const BuiltInDateRenderingWithFilter = meta.story({
  args: {
    columns: [
      ...baseColumns,
      {
        title: 'Created',
        dataIndex: 'created',
        key: 'created',
        dataType: 'date',
        filterable: true,
      },
    ],
    dataSource: allData,
    page: 1,
    pageSize: 10,
    totalCount: allData.length,
    onPageChange: () => {},
    onSearch: () => {},
  },
  render: args => {
    const [columnFilters, setColumnFilters] = useState<
      Record<string, string[]>
    >({})

    const [start, end] = columnFilters.created ?? []

    const filtered =
      start && end
        ? allData.filter(row => row.created >= start && row.created <= end)
        : allData

    return (
      <ManuscriptsTable
        {...args}
        columnFilters={columnFilters}
        dataSource={filtered}
        onFiltersChange={setColumnFilters}
        totalCount={filtered.length}
      />
    )
  },
})

export const BuiltInDateRenderingWithSortAndFilter = meta.story({
  args: {
    columns: [
      ...baseColumns,
      {
        title: 'Created',
        dataIndex: 'created',
        key: 'created',
        dataType: 'date',
        filterable: true,
        sortable: true,
      },
    ],
    dataSource: allData,
    page: 1,
    pageSize: 10,
    totalCount: allData.length,
    onPageChange: () => {},
    onSearch: () => {},
  },
  render: args => {
    const [columnFilters, setColumnFilters] = useState<
      Record<string, string[]>
    >({})

    const [sortState, setSortState] = useState<{
      columnKey: string
      order: 'ascend' | 'descend'
    } | null>(null)

    const [start, end] = columnFilters.created ?? []

    const filtered =
      start && end
        ? allData.filter(row => row.created >= start && row.created <= end)
        : allData

    const sorted = sortState
      ? [...filtered].sort((a, b) => {
          const direction = sortState.order === 'ascend' ? 1 : -1
          return a.created < b.created ? -direction : direction
        })
      : filtered

    return (
      <ManuscriptsTable
        {...args}
        columnFilters={columnFilters}
        dataSource={sorted}
        onFiltersChange={setColumnFilters}
        onSortChange={setSortState}
        sortState={sortState}
        totalCount={sorted.length}
      />
    )
  },
})

export const BuiltInStatusRendering = meta.story({
  args: {
    columns: [
      ...baseColumns,
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        dataType: 'status',
      },
    ],
    dataSource: [{ ...baseRow, status: 'submitted' }],
    page: 1,
    pageSize: 10,
    totalCount: 1,
    onPageChange: () => {},
    onSearch: () => {},
  },
})

export const BuiltInStatusRenderingWithFilter = meta.story({
  args: {
    columns: [
      ...baseColumns,
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        dataType: 'status',
        filterable: true,
        options: manuscriptStatusOptions,
      },
    ],
    dataSource: allData,
    page: 1,
    pageSize: 10,
    totalCount: allData.length,
    onPageChange: () => {},
    onSearch: () => {},
  },
  render: args => {
    const [columnFilters, setColumnFilters] = useState<
      Record<string, string[]>
    >({})

    const selectedStatuses = columnFilters.status ?? []

    const filtered =
      selectedStatuses.length > 0
        ? allData.filter(row => selectedStatuses.includes(row.status))
        : allData

    return (
      <ManuscriptsTable
        {...args}
        columnFilters={columnFilters}
        dataSource={filtered}
        onFiltersChange={setColumnFilters}
        totalCount={filtered.length}
      />
    )
  },
})

export const BuiltInReviewerStatusRendering = meta.story({
  args: {
    columns: [
      ...baseColumns,
      {
        title: 'Reviewer status',
        dataIndex: 'reviewerStatus',
        key: 'reviewerStatus',
        dataType: 'reviewerStatus',
      },
    ],
    dataSource: [{ ...baseRow, reviewerStatus: 'invited' }],
    page: 1,
    pageSize: 10,
    totalCount: 1,
    onPageChange: () => {},
    onSearch: () => {},
  },
})

export const BuiltInReviewerStatusRenderingWithFilter = meta.story({
  args: {
    columns: [
      ...baseColumns,
      {
        title: 'Reviewer status',
        dataIndex: 'reviewerStatus',
        key: 'reviewerStatus',
        dataType: 'reviewerStatus',
        filterable: true,
        options: reviewerStatusOptions,
      },
    ],
    dataSource: [
      { ...baseRow, reviewerStatus: 'invited' },
      {
        key: '2',
        manuscriptNumber: 102,
        title: 'A dataset of pollinator visitation rates',
        reviewerStatus: 'accepted',
      },
      {
        key: '3',
        manuscriptNumber: 103,
        title: 'BeeTrack: software for tracking pollinators',
        reviewerStatus: 'completed',
      },
    ],
    page: 1,
    pageSize: 10,
    totalCount: 3,
    onPageChange: () => {},
    onSearch: () => {},
  },
  render: args => {
    const [columnFilters, setColumnFilters] = useState<
      Record<string, string[]>
    >({})

    const selectedStatuses = columnFilters.reviewerStatus ?? []

    const allRows = args.dataSource

    const filtered =
      selectedStatuses.length > 0
        ? allRows.filter(row => selectedStatuses.includes(row.reviewerStatus))
        : allRows

    return (
      <ManuscriptsTable
        {...args}
        columnFilters={columnFilters}
        dataSource={filtered}
        onFiltersChange={setColumnFilters}
        totalCount={filtered.length}
      />
    )
  },
})

/**
 * One square per reviewer, colored by status. Hover the grid for a tooltip grouping reviewers
 * by status, with each reviewer's name listed underneath their group's total.
 * Be careful with usage of this datatype as it can expose the reviewer names.
 */
export const BuiltInReviewerStatusSummaryRendering = meta.story({
  args: {
    columns: [
      ...baseColumns,
      {
        title: 'Reviewers',
        dataIndex: 'reviewerStatuses',
        key: 'reviewerStatuses',
        dataType: 'reviewerStatusSummary',
      },
    ],
    dataSource: [
      {
        ...baseRow,
        reviewerStatuses: [
          { status: 'completed', name: 'Maria Alvarez' },
          { status: 'completed', name: 'Tom Ellison' },
          { status: 'invited', name: 'Priya Nair' },
          { status: 'rejected', name: 'Sam Okafor' },
        ],
      },
      {
        key: '2',
        manuscriptNumber: 102,
        title: 'A dataset of pollinator visitation rates',
        reviewerStatuses: [
          { status: 'accepted', name: 'Lucas Bergmann' },
          { status: 'accepted', name: 'Naledi Dube' },
        ],
      },
      {
        key: '3',
        manuscriptNumber: 103,
        title: 'BeeTrack: software for tracking pollinators',
        reviewerStatuses: [],
      },
      {
        key: '4',
        manuscriptNumber: 104,
        title: 'Neuropsychological effects of urban noise',
        reviewerStatuses: [
          { status: 'completed', name: 'Maria Alvarez' },
          { status: 'completed', name: 'Tom Ellison' },
          { status: 'completed', name: 'Priya Nair' },
          { status: 'accepted', name: 'Sam Okafor' },
          { status: 'accepted', name: 'Lucas Bergmann' },
          { status: 'inProgress', name: 'Naledi Dube' },
          { status: 'invited', name: 'Haruto Sato' },
          { status: 'invited', name: 'Elena Petrova' },
          { status: 'rejected', name: 'David Kim' },
        ],
      },
    ],
    page: 1,
    pageSize: 10,
    totalCount: 4,
    onPageChange: () => {},
    onSearch: () => {},
  },
  render: args => {
    const [reviewerStatusViewMode, setReviewerStatusViewMode] = useState<
      'compact' | 'detailed'
    >('detailed')

    return (
      <ManuscriptsTable
        {...args}
        onReviewerStatusViewModeChange={setReviewerStatusViewMode}
        reviewerStatusViewMode={reviewerStatusViewMode}
      />
    )
  },
})

export const BuiltInBadgeRendering = meta.story({
  args: {
    columns: [
      ...baseColumns,
      {
        title: 'ADA status',
        dataIndex: 'adaStatus',
        key: 'adaStatus',
        dataType: 'badge',
      },
    ],
    dataSource: [{ ...baseRow, adaStatus: 'Compliant' }],
    page: 1,
    pageSize: 10,
    totalCount: 1,
    onPageChange: () => {},
    onSearch: () => {},
  },
})

export const BuiltInPersonRendering = meta.story({
  args: {
    columns: [
      ...baseColumns,
      {
        title: 'Submitter',
        dataIndex: 'submitter',
        key: 'submitter',
        dataType: 'person',
      },
    ],
    dataSource: [
      {
        ...baseRow,
        submitter: {
          displayName: 'Jane Doe',
          profilePicture: avatarImg,
          orcid: '0000-0001-2345-6789',
        },
      },
      {
        key: '2',
        manuscriptNumber: 102,
        title: 'A dataset of pollinator visitation rates',
        submitter: {
          displayName: 'John Smith',
        },
      },
    ],
    page: 1,
    pageSize: 10,
    totalCount: 2,
    onPageChange: () => {},
    onSearch: () => {},
  },
})

const typeOptions = [
  { value: 'dataset', label: 'Dataset', labelColor: '#3f21d4' },
  { value: 'software', label: 'Software', labelColor: '#e901ca' },
  { value: 'article', label: 'Research article' },
  { value: 'preprint', label: 'Preprint' },
]

const typeData = [
  { ...baseRow, type: 'dataset' },
  {
    key: '2',
    manuscriptNumber: 102,
    title: 'BeeTrack: software for tracking pollinators',
    type: 'software',
  },
  {
    key: '3',
    manuscriptNumber: 103,
    title: 'Neuropsychological effects of urban noise',
    type: 'article',
  },
]

export const BuiltInOptionsRendering = meta.story({
  args: {
    columns: [
      ...baseColumns,
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        dataType: 'options',
        options: typeOptions,
      },
    ],
    dataSource: typeData.slice(0, 2),
    page: 1,
    pageSize: 10,
    totalCount: 2,
    onPageChange: () => {},
    onSearch: () => {},
  },
})

/**
 * Any column can be `filterable` as long as it has an `options` key.
 */
export const BuiltInOptionsRenderingWithFilter = meta.story({
  args: {
    columns: [
      ...baseColumns,
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        dataType: 'options',
        filterable: true,
        options: typeOptions,
      },
    ],
    dataSource: typeData,
    page: 1,
    pageSize: 10,
    totalCount: typeData.length,
    onPageChange: () => {},
    onSearch: () => {},
  },
  render: args => {
    const [columnFilters, setColumnFilters] = useState<
      Record<string, string[]>
    >({})

    const selectedTypes = columnFilters.type ?? []

    const filtered =
      selectedTypes.length > 0
        ? typeData.filter(row => selectedTypes.includes(row.type))
        : typeData

    return (
      <ManuscriptsTable
        {...args}
        columnFilters={columnFilters}
        dataSource={filtered}
        onFiltersChange={setColumnFilters}
        totalCount={filtered.length}
      />
    )
  },
})

const multiValueTypeData = [
  { ...baseRow, types: ['dataset', 'software'] },
  {
    key: '2',
    manuscriptNumber: 102,
    title: 'BeeTrack: software for tracking pollinators',
    types: ['software'],
  },
  {
    key: '3',
    manuscriptNumber: 103,
    title: 'Neuropsychological effects of urban noise',
    types: [],
  },
  {
    key: '4',
    manuscriptNumber: 104,
    title: 'Climate variability dataset for the Alps',
    types: ['article', 'preprint'],
  },
]

export const BuiltInOptionsRenderingWithMultipleValues = meta.story({
  args: {
    columns: [
      ...baseColumns,
      {
        title: 'Types',
        dataIndex: 'types',
        key: 'types',
        dataType: 'options',
        filterable: true,
        options: typeOptions,
      },
    ],
    dataSource: multiValueTypeData,
    page: 1,
    pageSize: 10,
    totalCount: multiValueTypeData.length,
    onPageChange: () => {},
    onSearch: () => {},
  },
  render: args => {
    const [columnFilters, setColumnFilters] = useState<
      Record<string, string[]>
    >({})

    const selectedTypes = columnFilters.types ?? []

    const filtered =
      selectedTypes.length > 0
        ? multiValueTypeData.filter(row =>
            row.types.some(type => selectedTypes.includes(type)),
          )
        : multiValueTypeData

    return (
      <ManuscriptsTable
        {...args}
        columnFilters={columnFilters}
        dataSource={filtered}
        onFiltersChange={setColumnFilters}
        totalCount={filtered.length}
      />
    )
  },
})

const customStatusOptions = [
  {
    value: 'readyToEvaluate',
    label: 'Ready to evaluate',
    labelColor: '#e0a800',
  },
  { value: 'evaluated', label: 'Evaluated', labelColor: '#3f21d4' },
  { value: 'readyToPublish', label: 'Ready to publish', labelColor: '#1a8917' },
]

export const BuiltInOptionsRenderingEditable = meta.story({
  args: {
    columns: [
      ...baseColumns,
      {
        title: 'Custom status',
        dataIndex: 'customStatus',
        key: 'customStatus',
        dataType: 'options',
        editable: true,
        filterable: true,
        options: customStatusOptions,
      },
    ],
    dataSource: [
      { ...baseRow, id: 'ms-1', customStatus: 'readyToEvaluate' },
      {
        key: '2',
        id: 'ms-2',
        manuscriptNumber: 102,
        title: 'A dataset of pollinator visitation rates',
        customStatus: null,
      },
      {
        key: '3',
        id: 'ms-3',
        manuscriptNumber: 103,
        title: 'BeeTrack: software for tracking pollinators',
        customStatus: 'evaluated',
      },
    ],
    page: 1,
    pageSize: 10,
    totalCount: 3,
    onPageChange: () => {},
    onSearch: () => {},
  },
  render: args => {
    const [dataSource, setDataSource] = useState(args.dataSource)

    const [columnFilters, setColumnFilters] = useState<
      Record<string, string[]>
    >({})

    const selectedStatuses = columnFilters.customStatus ?? []

    const filtered =
      selectedStatuses.length > 0
        ? dataSource.filter(row => selectedStatuses.includes(row.customStatus))
        : dataSource

    return (
      <ManuscriptsTable
        {...args}
        columnFilters={columnFilters}
        dataSource={filtered}
        onFiltersChange={setColumnFilters}
        onOptionChange={(columnKey, id, value) =>
          setDataSource(previous =>
            previous.map(row =>
              row.id === id ? { ...row, [columnKey]: value } : row,
            ),
          )
        }
        totalCount={filtered.length}
      />
    )
  },
})

/**
 * Action uses a custom render function
 */
export const CustomRendering = meta.story({
  args: {
    columns: [
      ...baseColumns,
      {
        title: 'Actions',
        dataIndex: 'actions',
        key: 'actions',
        render: (): ReactNode => <Link to="#">View</Link>,
      },
    ],
    dataSource: [baseRow],
    page: 1,
    pageSize: 10,
    totalCount: 1,
    onPageChange: () => {},
    onSearch: () => {},
  },
})

export const WithFiltersApplied = meta.story({
  args: {
    columns: [
      ...baseColumns,
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        dataType: 'status',
        filterable: true,
        options: manuscriptStatusOptions,
      },
      {
        title: 'Created',
        dataIndex: 'created',
        key: 'created',
        dataType: 'date',
        filterable: true,
      },
    ],
    dataSource: allData,
    page: 1,
    pageSize: 10,
    totalCount: allData.length,
    onPageChange: () => {},
    onSearch: () => {},
  },
  render: args => {
    const [columnFilters, setColumnFilters] = useState<
      Record<string, string[]>
    >({
      status: ['submitted', 'accepted'],
      created: ['2026-06-01', '2026-07-31'],
    })

    const selectedStatuses = columnFilters.status ?? []
    const [start, end] = columnFilters.created ?? []

    const filtered = allData
      .filter(row =>
        selectedStatuses.length > 0
          ? selectedStatuses.includes(row.status)
          : true,
      )
      .filter(row =>
        start && end ? row.created >= start && row.created <= end : true,
      )

    return (
      <ManuscriptsTable
        {...args}
        columnFilters={columnFilters}
        dataSource={filtered}
        onFiltersChange={setColumnFilters}
        totalCount={filtered.length}
      />
    )
  },
})

const initialSelectableData = [
  {
    key: '1',
    id: 'ms-1',
    manuscriptNumber: 101,
    title: 'Honey bee colonies benefit from grassland',
    status: 'submitted',
    archived: false,
  },
  {
    key: '2',
    id: 'ms-2',
    manuscriptNumber: 102,
    title: 'A dataset of pollinator visitation rates',
    status: 'accepted',
    archived: false,
  },
  {
    key: '3',
    id: 'ms-3',
    manuscriptNumber: 103,
    title: 'BeeTrack: software for tracking pollinators',
    status: 'rejected',
    archived: true,
  },
]

export const WithSelectableRows = meta.story({
  args: {
    columns: [
      ...baseColumns,
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        dataType: 'status',
        filterable: true,
        options: manuscriptStatusOptions,
      },
    ],
    dataSource: initialSelectableData,
    page: 1,
    pageSize: 10,
    totalCount: initialSelectableData.length,
    onPageChange: () => {},
    onSearch: () => {},
    selectable: true,
    showArchiveActions: true,
    showDownloadAction: true,
    showViewArchivedToggle: true,
  },
  render: args => {
    const [dataSource, setDataSource] = useState(initialSelectableData)
    const [viewingArchived, setViewingArchived] = useState(false)

    const [columnFilters, setColumnFilters] = useState<
      Record<string, string[]>
    >({})

    const setArchived = (ids: string[], archived: boolean): void => {
      setDataSource(previous =>
        previous.map(row =>
          ids.includes(row.id) ? { ...row, archived } : row,
        ),
      )
    }

    const selectedStatuses = columnFilters.status ?? []

    const filtered =
      selectedStatuses.length > 0
        ? dataSource.filter(row => selectedStatuses.includes(row.status))
        : dataSource

    return (
      <ManuscriptsTable
        {...args}
        columnFilters={columnFilters}
        dataSource={filtered}
        onArchiveSelected={ids => setArchived(ids, true)}
        onDownloadSelected={ids =>
          // eslint-disable-next-line no-console
          console.log('Download JSON for:', ids)
        }
        onFiltersChange={setColumnFilters}
        onUnarchiveSelected={ids => setArchived(ids, false)}
        onViewingArchivedChange={setViewingArchived}
        totalCount={filtered.length}
        viewingArchived={viewingArchived}
      />
    )
  },
})

/**
 * Show why a row matched
 */

export const WithSearchSnippets = meta.story({
  args: {
    columns: baseColumns,
    dataSource: [
      {
        ...baseRow,
        searchSnippets: [
          {
            field: 'Title',
            html: 'Honey bee colonies benefit from <b>grassland</b>',
          },
          {
            field: 'Abstract',
            html: '...pollinators depend on nearby <b>grassland</b> habitats for forage during the dry season...',
          },
        ],
      },
      {
        key: '2',
        manuscriptNumber: 102,
        title: 'A dataset of pollinator visitation rates',
      },
    ],
    page: 1,
    pageSize: 10,
    totalCount: 2,
    onPageChange: () => {},
    onSearch: () => {},
  },
})
