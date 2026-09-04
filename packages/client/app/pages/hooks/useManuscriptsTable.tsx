/**
 * Collapse regions to make this file more managable to read through.
 */

// #region import
import { useMemo, useState, type ReactNode } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  useQuery,
  useMutation,
  useLazyQuery,
  useApolloClient,
} from '@apollo/client/react'
import styled, { ThemeProvider, useTheme } from 'styled-components'
import { grid, th, Modal } from '@coko/client'
import get from 'lodash/get'
import mapValues from 'lodash/mapValues'

import { useConfig } from './useConfig'
import { useCurrentUser } from './useCurrentUser'
import {
  GET_MANUSCRIPTS_FOR_ROLE,
  GET_ALL_MANUSCRIPTS,
  GET_MANUSCRIPTS_DATA,
  ARCHIVE_MANUSCRIPTS,
  UNARCHIVE_MANUSCRIPTS,
  UPDATE_MANUSCRIPT,
  REVIEWER_RESPONSE,
  UPDATE_REVIEWER_STATUS,
  PUBLISH_MANUSCRIPT,
} from '../../queries'

import Link from '../../ui/shared/Link'
import {
  reviewerStatusValues,
  reviewerStatusTranslationKeys,
} from '../../ui/shared/_constants'
import type {
  ManuscriptsTableColumn,
  ManuscriptsTableSortState,
} from '../../ui/shared/ManuscriptsTable'
import { articleStatuses } from '../../globals'
import { validateManuscriptSubmission } from '../../shared/manuscriptUtils'
import { validateDoi, validateSuffix } from '../../shared/commsUtils'
import PublishingResponse from '../../components/component-review/src/components/publishing/PublishingResponse'
// #endregion import

// #region styled
const LinkList = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
`

const ActionRow = styled.div`
  align-items: center;
  display: flex;

  > div {
    border-right: 2px solid ${th('colorPrimary')};
    padding-right: ${grid(2)};
    margin-right: ${grid(2)};
    height: ${grid(6)};
  }
`
// #endregion styled

// #region constants
const URI_PARAMS = {
  SEARCH: 'search',
  PAGENUM: 'pagenum',
  SORT: 'sort',
  ARCHIVED: 'archived',
  REVIEWER_STATUS: 'reviewerStatusBadge', // 'your status' column on reviews dashboard tab
}

type Variant = 'submitter' | 'editor' | 'reviewer' | 'admin'

type VariantConfig = {
  roles: string[]
  configColumnsPath: string
  defaultColumnKeys: string[]
  forcedColumnKeys: string[]
}

const VARIANT_CONFIG: Record<Variant, VariantConfig> = {
  submitter: {
    roles: ['author'],
    configColumnsPath: 'dashboard.mySubmissions',
    defaultColumnKeys: [
      'shortId',
      'submission.$title',
      'status',
      'created',
      'updated',
    ],
    forcedColumnKeys: [],
  },
  reviewer: {
    roles: [
      'reviewer',
      'invited:reviewer',
      'accepted:reviewer',
      'inProgress:reviewer',
      'completed:reviewer',
      'collaborativeReviewer',
      'invited:collaborativeReviewer',
      'accepted:collaborativeReviewer',
      'inProgress:collaborativeReviewer',
      'completed:collaborativeReviewer',
    ],
    configColumnsPath: 'dashboard.tableColumns',
    defaultColumnKeys: ['shortId', 'submission.$title', 'reviewerStatusBadge'],
    forcedColumnKeys: ['reviewerStatusBadge'],
  },
  editor: {
    roles: ['seniorEditor', 'handlingEditor', 'editor'],
    configColumnsPath: 'dashboard.editingQueue',
    defaultColumnKeys: [
      'shortId',
      'submission.$title',
      'status',
      'manuscriptVersions',
      'statusCounts',
      'lastUpdated',
    ],
    forcedColumnKeys: ['statusCounts', 'lastUpdated'],
  },
  admin: {
    roles: [],
    configColumnsPath: 'manuscript.tableColumns',
    defaultColumnKeys: [
      'shortId',
      'titleAndAbstract',
      'created',
      'updated',
      'status',
      'submission.$customStatus',
      'author',
    ],
    forcedColumnKeys: [],
  },
}

const columnAlignments: Record<string, 'left' | 'center' | 'right'> = {
  manuscriptVersions: 'center',
  reviewerStatusBadge: 'center',
  shortId: 'center',
  status: 'center',
  'submission.$doi': 'center',
  'submission.adaState': 'center',
}

const JOURNAL_STATUS_OPTIONS = [
  'new',
  'submitted',
  'accepted',
  'rejected',
  'revise',
  'revising',
  'published',
  'unpublished',
  'assigned',
  'inProgress',
  'completed',
  'underEmbargo',
  'embargoReleased',
]

const PREPRINT_STATUS_OPTIONS = [
  'new',
  'submitted',
  'evaluated',
  'published',
  'unpublished',
  'assigned',
  'inProgress',
  'completed',
  'underEmbargo',
  'embargoReleased',
]
// #endregion constants

// #region helpers
const REVIEWER_STATUS_VIEW_MODE_STORAGE_KEY =
  'manuscriptsTable.reviewerStatusViewMode'

const readReviewerStatusViewMode = (): 'compact' | 'detailed' =>
  localStorage.getItem(REVIEWER_STATUS_VIEW_MODE_STORAGE_KEY) === 'compact'
    ? 'compact'
    : 'detailed'

const isValidDOI = (doi: string): boolean => {
  const doiRegex =
    /^(https?:\/\/(dx\.)?doi\.org\/|doi:)?10.\d{4,9}\/[-._;():A-Z0-9]+$/i
  return doiRegex.test(doi)
}

const extractSortData = (
  params: URLSearchParams,
): {
  name: string | undefined
  direction: 'ascend' | 'descend' | undefined
} => ({
  name: params.get(URI_PARAMS.SORT)?.split('_')[0],
  direction: params.get(URI_PARAMS.SORT)?.split('_')[1] as
    | 'ascend'
    | 'descend'
    | undefined,
})

const extractFilters = (
  params: URLSearchParams,
): { field: string; value: string | null }[] =>
  Array.from(params.keys())
    .filter(field => field !== URI_PARAMS.PAGENUM && field !== URI_PARAMS.SORT)
    .map(field => ({ field, value: params.get(field) }))

const extractArchived = (params: URLSearchParams): boolean =>
  params.has(URI_PARAMS.ARCHIVED)

const importSourceFor = (
  manuscript: Record<string, any>,
): 'coar' | 'semanticScholar' | undefined => {
  if (manuscript.importSourceServer === 'COAR') return 'coar'
  if (manuscript.importSourceServer === 'semantic-scholar')
    return 'semanticScholar'

  return undefined
}

const titleLinkFor = (manuscript: Record<string, any>): string | undefined => {
  const { $doi, $sourceUri } = manuscript.submission || {}

  if ($sourceUri) return $sourceUri
  if ($doi && isValidDOI($doi))
    return `${$doi.includes('doi.org') ? '' : 'https://doi.org/'}${$doi}`

  return undefined
}

const findReviewerTeamMember = (
  version: Record<string, any>,
  userId: string,
): Record<string, any> | undefined =>
  (version.teams ?? [])
    .find((team: Record<string, any>) => team.role === 'reviewer')
    ?.members?.find((member: Record<string, any>) => member.user.id === userId)

const findCollaborativeReviewerTeamMember = (
  version: Record<string, any>,
  userId: string,
): Record<string, any> | undefined =>
  (version.teams ?? [])
    .find((team: Record<string, any>) => team.role === 'collaborativeReviewer')
    ?.members?.find((member: Record<string, any>) => member.user.id === userId)

const findReviewerStatus = (
  manuscript: Record<string, any>,
  userId: string,
): string => {
  let memberIsCurrent = true
  let member =
    findReviewerTeamMember(manuscript, userId) ??
    findCollaborativeReviewerTeamMember(manuscript, userId)

  if (!member) {
    memberIsCurrent = false

    for (const version of manuscript.manuscriptVersions ?? []) {
      member = findReviewerTeamMember(version, userId)
      if (member) break
    }
  }

  let status = member?.status

  if (
    !status ||
    (!memberIsCurrent && !['completed', 'rejected'].includes(status))
  )
    status = 'closed'

  return status
}

const INVITATION_STATUS_MAPPING: Record<string, string> = {
  UNANSWERED: 'invited',
  REJECTED: 'rejected',
}

const reviewerStatusEntriesFor = (
  manuscript: Record<string, any>,
): { status: string; name: string }[] => {
  const notAlreadyInvited = (reviewerMember: Record<string, any>): boolean => {
    if (reviewerMember.status !== 'invited') return true

    const foundInvitation = (manuscript.invitations ?? []).find(
      (invitation: Record<string, any>) =>
        invitation.toEmail === reviewerMember.user.email &&
        invitation.status === 'UNANSWERED' &&
        ['REVIEWER', 'COLLABORATIVE_REVIEWER'].includes(
          invitation.invitedPersonType,
        ),
    )

    return !foundInvitation
  }

  const membersOfRole = (role: string): Record<string, any>[] =>
    (
      (manuscript.teams ?? []).find(
        (team: Record<string, any>) => team.role === role,
      )?.members ?? []
    ).filter(notAlreadyInvited)

  const reviewerMembers = membersOfRole('reviewer')
  const collaborativeReviewerMembers = membersOfRole('collaborativeReviewer')

  const reviewerUserIds = [
    ...reviewerMembers,
    ...collaborativeReviewerMembers,
  ].map((member: Record<string, any>) => member.user.id)

  const invitationEntries = (manuscript.invitations ?? [])
    .filter(
      (invitation: Record<string, any>) =>
        invitation.status in INVITATION_STATUS_MAPPING &&
        ['REVIEWER', 'COLLABORATIVE_REVIEWER'].includes(
          invitation.invitedPersonType,
        ) &&
        !reviewerUserIds.includes(invitation.user?.id),
    )
    .map((invitation: Record<string, any>) => ({
      status: INVITATION_STATUS_MAPPING[invitation.status],
      name: invitation.toEmail,
    }))

  return [
    ...[...reviewerMembers, ...collaborativeReviewerMembers].map(
      (member: Record<string, any>) => ({
        status: member.status,
        name: member.user.username,
      }),
    ),
    ...invitationEntries,
  ]
}

const lastReviewerUpdateFor = (
  manuscript: Record<string, any>,
): string | undefined => {
  const updatedTimes = (
    (manuscript.teams ?? []).find(
      (team: Record<string, any>) => team.role === 'reviewer',
    )?.members ?? []
  ).map((member: Record<string, any>) => member.updated)

  if (updatedTimes.length === 0) return undefined

  return updatedTimes.reduce((max: string, current: string) =>
    new Date(current) > new Date(max) ? current : max,
  )
}

const editorNamesFor = (manuscript: Record<string, any>): string =>
  [
    ...new Set(
      (manuscript.teams ?? [])
        .filter((team: Record<string, any>) =>
          VARIANT_CONFIG.editor.roles.includes(team.role),
        )
        .map((team: Record<string, any>) => team.members?.[0]?.user?.username)
        .filter(Boolean),
    ),
  ].join(', ')

/**
 * Translate the table's 'yyyy-MM-dd' format to the server's date-range filter
 * format 'yyyyMMdd'. And vice versa.
 * No timezone handling needed, since both sides already represent the same
 * local calendar date.
 */
const isoDateToCompact = (isoDate: string): string =>
  isoDate.replaceAll('-', '')

const compactDateToIso = (compactDate: string): string =>
  `${compactDate.slice(0, 4)}-${compactDate.slice(4, 6)}-${compactDate.slice(6, 8)}`
// #endregion helpers

type UseManuscriptsTableResult = {
  actionModal: {
    confirm: (config: Record<string, any>) => void
    error: (config: Record<string, any>) => void
  }
  actionModalContextHolder: ReactNode
  columnFilters: Record<string, string[]>
  columns: ManuscriptsTableColumn[]
  dataSource: Record<string, any>[]
  error: unknown
  loading: boolean
  onArchiveSelected: (ids: string[]) => void
  onDownloadSelected: (ids: string[]) => void
  onFiltersChange: (filters: Record<string, string[]>) => void
  onOptionChange: (columnKey: string, id: string, value: string | null) => void
  onPageChange: (page: number) => void
  onReviewerStatusViewModeChange: (viewMode: 'compact' | 'detailed') => void
  onSearch: (value: string) => void
  onSortChange: (sortState: ManuscriptsTableSortState | null) => void
  onUnarchiveSelected: (ids: string[]) => void
  onViewingArchivedChange: (viewingArchived: boolean) => void
  page: number
  pageSize: number
  reviewerStatusViewMode: 'compact' | 'detailed'
  searchQuery: string
  selectable: boolean
  showArchiveActions: boolean
  showDownloadAction: boolean
  showViewArchivedToggle: boolean
  sortState: ManuscriptsTableSortState | null
  totalCount: number
  viewingArchived: boolean
}

/** Derives the props <ManuscriptsTable> needs */
const useManuscriptsTable = (variant: Variant): UseManuscriptsTableResult => {
  const config: any = useConfig()
  const { t } = useTranslation()
  const { groupName } = useParams()
  const currentUser = useCurrentUser()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [actionModal, actionModalContextHolder] = Modal.useModal()
  const theme = useTheme()

  const [reviewerStatusViewMode, setReviewerStatusViewMode] = useState<
    'compact' | 'detailed'
  >(readReviewerStatusViewMode)

  // #region definitions
  const { roles, configColumnsPath, defaultColumnKeys, forcedColumnKeys } =
    VARIANT_CONFIG[variant]
  const searchInAllVersions = variant === 'reviewer'
  const authorProofingEnabled = config.controlPanel?.authorProofingEnabled
  const currentSearchQuery = searchParams.get(URI_PARAMS.SEARCH)
  const { name: sortName, direction: sortDirection } =
    extractSortData(searchParams)
  const filters = extractFilters(searchParams)
  const page = Number(searchParams.get(URI_PARAMS.PAGENUM)) || 1
  const pageSize = config?.manuscript?.paginationCount || 10

  const specialColumnTitles = {
    'submission.$doi': t('formBuilder.fieldOpts.doi'),
    'submission.adaState': t('manuscriptsTable.adaState'),
    actions: t('manuscriptsTable.Actions'),
    author: t('manuscriptsTable.Author'),
    created: t('manuscriptsTable.Created'),
    editor: t('manuscriptsTable.Editor'),
    lastUpdated: t('manuscriptsTable.lastReviewerStatusUpdate'),
    manuscriptVersions: t('manuscriptsTable.Version'),
    reviewerStatusBadge: t('manuscriptsTable.Your Status'),
    shortId: t('manuscriptsTable.No.'),
    status: t('manuscriptsTable.Status'),
    statusCounts: t('manuscriptsTable.Reviewer Status'),
    submitter: t('manuscriptsTable.Author'), // alias of 'author'
    titleAndAbstract: t('manuscriptsTable.Title'),
    updated: t('manuscriptsTable.Updated'),
  }

  const actionText = {
    new: t('manuscriptsTable.actions.continueSubmission'),
    submitted: t('manuscriptsTable.actions.View'),
    revise: t('manuscriptsTable.actions.revise'),
    revising: t('manuscriptsTable.actions.continueRevision'),
    accepted: t('manuscriptsTable.actions.View'),
    rejected: t('manuscriptsTable.actions.View'),
    published: t('manuscriptsTable.actions.View'),
    assigned: t('manuscriptsTable.actions.View'),
    inProgress: t('manuscriptsTable.actions.View'),
    completed: t('manuscriptsTable.actions.View'),
    underEmbargo: t('manuscriptsTable.actions.View'),
    embargoReleased: t('manuscriptsTable.actions.View'),
  }
  // #endregion definitions

  // #region query-data
  const isArchived = extractArchived(searchParams)

  const sharedQueryVariables = {
    sort: sortName
      ? { field: sortName, isAscending: sortDirection === 'ascend' }
      : null,
    offset: (page - 1) * pageSize,
    limit: pageSize,
    filters,
    timezoneOffsetMinutes: new Date().getTimezoneOffset(),
    groupId: config.groupId,
  }

  const roleQuery = useQuery(GET_MANUSCRIPTS_FOR_ROLE, {
    variables: {
      ...sharedQueryVariables,
      reviewerStatus: searchParams.get(URI_PARAMS.REVIEWER_STATUS),
      wantedRoles: roles,
      searchInAllVersions,
    },
    fetchPolicy: 'network-only',
    skip: variant === 'admin',
  })

  const allQuery = useQuery(GET_ALL_MANUSCRIPTS, {
    variables: {
      ...sharedQueryVariables,
      archived: isArchived,
    },
    fetchPolicy: 'network-only',
    skip: variant !== 'admin',
  })

  const {
    data,
    previousData,
    loading: apolloLoading,
    error,
    refetch,
  } = variant === 'admin' ? allQuery : roleQuery

  const [updateManuscript] = useMutation(UPDATE_MANUSCRIPT)
  const [archiveManuscripts] = useMutation(ARCHIVE_MANUSCRIPTS)
  const [unarchiveManuscripts] = useMutation(UNARCHIVE_MANUSCRIPTS)
  const [getManuscriptsData] = useLazyQuery(GET_MANUSCRIPTS_DATA)
  const [reviewerRespond] = useMutation(REVIEWER_RESPONSE)
  const [updateReviewerStatus] = useMutation(UPDATE_REVIEWER_STATUS)
  const [publishManuscript] = useMutation(PUBLISH_MANUSCRIPT)
  const apolloClient = useApolloClient()

  const currentData: any = data ?? previousData
  const loading = apolloLoading && !currentData

  const submissionForm = currentData?.formForPurposeAndCategory

  const manuscripts =
    variant === 'admin'
      ? (currentData?.paginatedManuscripts?.manuscripts ?? [])
      : (currentData?.manuscriptsUserHasCurrentRoleIn?.manuscripts ?? [])

  const totalCount =
    variant === 'admin'
      ? (currentData?.paginatedManuscripts?.totalCount ?? 0)
      : (currentData?.manuscriptsUserHasCurrentRoleIn?.totalCount ?? 0)

  const fieldDefinitions = useMemo(() => {
    const fields = submissionForm?.structure?.children ?? []
    const defs: Record<string, any> = {}
    fields.forEach((field: Record<string, any>): void => {
      // Incomplete fields in the formbuilder may not have a name specified. Ignore these.
      if (field.name) defs[field.name] = field
    })
    return defs
  }, [submissionForm])

  let sortState: ManuscriptsTableSortState | null = null
  if (sortName) {
    sortState = { columnKey: sortName, order: sortDirection ?? 'descend' }
  } else if (!currentSearchQuery) {
    sortState = { columnKey: 'created', order: 'descend' }
  }
  // #endregion query-data

  // #region table-columns
  const rawConfigColumns = get(config, configColumnsPath)

  const configColumns = Array.isArray(rawConfigColumns)
    ? rawConfigColumns.map(
        (column: { value: string; label: string }): string => column.value,
      )
    : (rawConfigColumns || '')
        .split(',')
        .map((columnName: string) => columnName.trim())
        .filter(Boolean)

  const baseColumnKeys =
    configColumns.length > 0 ? configColumns : defaultColumnKeys

  const columnKeys = [
    ...baseColumnKeys,
    ...forcedColumnKeys.filter(key => !baseColumnKeys.includes(key)),
    'actions',
  ]

  const findColumnTitle = (key: string): string => {
    const formTitle = submissionForm?.structure?.children.find(
      (field: Record<string, any>): boolean => field.name === key,
    )?.title

    if (formTitle) return formTitle
    if (specialColumnTitles[key]) return specialColumnTitles[key]
    return key
  }

  const tableColumns: ManuscriptsTableColumn[] = columnKeys.map(
    (key: string): ManuscriptsTableColumn => {
      // common for all columns
      const column: ManuscriptsTableColumn = {
        title: findColumnTitle(key),
        dataIndex: key,
        key,
        align: columnAlignments[key] ?? 'left',
      }

      if (column.key === 'actions') {
        return {
          ...column,
          render: (_: any, record: any): ReactNode => {
            if (variant === 'submitter') {
              const { id, status, showAuthorProofing } = record

              return (
                <LinkList>
                  <Link
                    data-testid="submission-action-link"
                    to={`/${groupName}/versions/${id}/submit`}
                  >
                    {actionText[status]}
                  </Link>

                  {showAuthorProofing && (
                    <Link
                      data-testid="production-action-link"
                      to={`/${groupName}/versions/${id}/production`}
                    >
                      {(status === 'assigned' || status === 'inProgress') &&
                        t(
                          'dashboardPage.mySubmissions.Provide production feedback',
                        )}

                      {status === 'completed' &&
                        t(
                          'dashboardPage.mySubmissions.View production feedback',
                        )}
                    </Link>
                  )}
                </LinkList>
              )
            }

            if (variant === 'editor') {
              const { id, parentId } = record

              return (
                <LinkList>
                  <Link
                    data-testid="control-link"
                    to={`/${groupName}/versions/${parentId || id}/decision`}
                  >
                    {t('manuscriptsTable.Control')}
                  </Link>
                  <Link
                    data-testid="production-link"
                    to={`/${groupName}/versions/${id}/production`}
                  >
                    {t('manuscriptsTable.Production')}
                  </Link>
                </LinkList>
              )
            }

            if (variant === 'reviewer') {
              const { id, parentId, reviewerStatusBadge, reviewerTeamId } =
                record

              const reviewLinkText: Record<string, string> = {
                completed: t('common.View'),
                accepted: t('manuscriptsTable.reviewDo'),
                inProgress: t('manuscriptsTable.reviewContinue'),
                closed: t('common.View'),
              }

              if (
                ['accepted', 'completed', 'inProgress', 'closed'].includes(
                  reviewerStatusBadge,
                )
              ) {
                const reviewLink = `/${groupName}/versions/${parentId || id}/review`

                return (
                  <Link
                    data-testid="review-action-link"
                    onClick={async (event): Promise<void> => {
                      event.preventDefault()

                      if (reviewerStatusBadge === 'accepted') {
                        await updateReviewerStatus({
                          variables: { manuscriptId: id, status: 'inProgress' },
                        })
                      }

                      navigate(reviewLink)
                    }}
                    to={reviewLink}
                  >
                    {reviewLinkText[reviewerStatusBadge]}
                  </Link>
                )
              }

              if (reviewerStatusBadge === 'invited') {
                const respond = (action: 'accepted' | 'rejected'): void => {
                  actionModal.confirm({
                    content: t(
                      action === 'accepted'
                        ? 'manuscriptsTable.confirmReviewAccept'
                        : 'manuscriptsTable.confirmReviewReject',
                    ),
                    okText: t('common.OK'),
                    cancelText: t('common.Cancel'),
                    onOk: () => {
                      reviewerRespond({
                        variables: {
                          currentUserId: currentUser.id,
                          action,
                          teamId: reviewerTeamId,
                        },
                      })
                    },
                  })
                }

                return (
                  <ActionRow>
                    <Link
                      data-testid="accept-review"
                      onClick={(event): void => {
                        event.preventDefault()
                        respond('accepted')
                      }}
                      to="#"
                    >
                      {t('manuscriptsTable.reviewAccept')}
                    </Link>
                    <div></div>
                    <Link
                      data-testid="reject-review"
                      onClick={(event): void => {
                        event.preventDefault()
                        respond('rejected')
                      }}
                      to="#"
                    >
                      {t('manuscriptsTable.reviewReject')}
                    </Link>
                  </ActionRow>
                )
              }

              return null
            }

            if (variant === 'admin') {
              const { id, status, submission, archived: rowArchived } = record
              const instanceName = config?.instanceName

              const showEvaluation =
                !rowArchived &&
                ['preprint1', 'preprint2'].includes(instanceName) &&
                Object.values(articleStatuses).includes(status)

              const showControl =
                !rowArchived && ['journal', 'prc'].includes(instanceName)

              const showPublish =
                !rowArchived &&
                ['preprint1', 'preprint2'].includes(instanceName) &&
                status === articleStatuses.evaluated

              return (
                <LinkList>
                  {showEvaluation && (
                    <Link
                      data-testid="evaluation-action-link"
                      to={`/${groupName}/versions/${id}/evaluation`}
                    >
                      {t('manuscriptsTable.actions.Evaluation')}
                    </Link>
                  )}
                  {showControl && (
                    <Link
                      data-testid="control-action-link"
                      to={`/${groupName}/versions/${id}/decision`}
                    >
                      {t('manuscriptsTable.actions.Control')}
                    </Link>
                  )}
                  <Link
                    data-testid="view-action-link"
                    to={`/${groupName}/versions/${id}/manuscript`}
                  >
                    {t('manuscriptsTable.actions.View')}
                  </Link>
                  {!rowArchived && (
                    <Link
                      data-testid="production-action-link"
                      to={`/${groupName}/versions/${id}/production`}
                    >
                      {t('manuscriptsTable.actions.Production')}
                    </Link>
                  )}
                  {showPublish && (
                    <Link
                      data-testid="publish-action-link"
                      onClick={(event): void => {
                        event.preventDefault()
                        actionModal.confirm({
                          content: t('manuscriptsTable.confirmPublish'),
                          okText: t('common.OK'),
                          cancelText: t('common.Cancel'),
                          onOk: () => handlePublish(id, submission),
                        })
                      }}
                      to="#"
                    >
                      {t('manuscriptsTable.actions.Publish')}
                    </Link>
                  )}
                </LinkList>
              )
            }

            return null
          },
        }
      }

      if (column.key === 'shortId') {
        return { ...column, sortable: true }
      }

      if (
        ['created', 'updated'].includes(column.key) ||
        fieldDefinitions[column.key]?.component === 'DatePicker'
      ) {
        return { ...column, dataType: 'date', sortable: true, filterable: true }
      }

      if (column.key === 'lastUpdated') {
        return { ...column, dataType: 'date' }
      }

      if (
        column.key === 'submission.$title' ||
        column.key === 'titleAndAbstract'
      ) {
        return {
          ...column,
          dataType: 'title',
          showAbstract: column.key === 'titleAndAbstract',
          sortable: true,
        }
      }

      if (column.key === 'reviewerStatusBadge') {
        return {
          ...column,
          dataType: 'reviewerStatus',
          filterable: true,
          options: reviewerStatusValues.map(status => ({
            value: status,
            label: t(reviewerStatusTranslationKeys[status]),
          })),
        }
      }

      if (column.key === 'statusCounts') {
        return {
          ...column,
          dataType: 'reviewerStatusSummary',
          helpTooltip: t('manuscriptsTable.reviewerStatusColumnTip'),
        }
      }

      if (column.key === 'author' || column.key === 'submitter') {
        return { ...column, dataType: 'person' }
      }

      if (column.key === 'status') {
        const statusOptions = ['journal', 'prc'].includes(config?.instanceName)
          ? JOURNAL_STATUS_OPTIONS
          : PREPRINT_STATUS_OPTIONS

        return {
          ...column,
          dataType: 'status',
          filterable: true,
          options: statusOptions.map(status => ({
            value: status,
            label: t(`msStatus.${status}`),
          })),
        }
      }

      if (column.key === 'submission.adaState') {
        return {
          ...column,
          dataType: 'badge',
          filterable: true,
          options: [
            { value: 'draft', label: t('decisionPage.decisionTab.Draft') },
            { value: 'process', label: t('decisionPage.decisionTab.Process') },
            {
              value: 'findable',
              label: t('decisionPage.decisionTab.Findable'),
            },
            { value: 'publish', label: t('decisionPage.decisionTab.Publish') },
          ],
        }
      }

      if (column.key === 'submission.$customStatus') {
        return {
          ...column,
          dataType: 'options',
          editable: Boolean(config.manuscript?.labelColumn),
          filterable: true,
          options: fieldDefinitions[column.key]?.options,
        }
      }

      if (fieldDefinitions[column.key]?.options?.length) {
        return {
          ...column,
          dataType: 'options',
          filterable: true,
          options: fieldDefinitions[column.key].options,
        }
      }

      if (fieldDefinitions[column.key]?.component === 'AbstractEditor') {
        return { ...column, dataType: 'richText', sortable: true }
      }

      if (fieldDefinitions[column.key]?.component === 'TextField') {
        return { ...column, sortable: true }
      }

      if (column.key === 'manuscriptVersions') {
        /**
         * Intentionally not sortable: it's a count (prior versions + current),
         * derived from a GraphQL relation rather than a real column or jsonb
         * field the server can sort on.
         */
        return { ...column, sortable: false }
      }

      return column
    },
  )
  // #endregion table-columns

  // #region column-filters
  /**
   * Date filters are 'yyyyMMdd-yyyyMMdd' range.
   * All other filters are comma-separated values.
   */
  const columnFilters = tableColumns.reduce<Record<string, string[]>>(
    (accumulator, column) => {
      if (!column.filterable) return accumulator

      const value = searchParams.get(column.key)
      if (!value) return accumulator

      if (column.dataType === 'date') {
        const [start, end] = value.split('-')

        if (start && end) {
          accumulator[column.key] = [
            compactDateToIso(start),
            compactDateToIso(end),
          ]
        }

        return accumulator
      }

      accumulator[column.key] = value.split(',')
      return accumulator
    },
    {},
  )
  // #endregion column-filters

  // #region row-data
  const dataSource = manuscripts.map((manuscriptObj: any) => {
    const manuscript = { ...manuscriptObj }
    manuscript.submission = JSON.parse(manuscript.submission)

    const row = tableColumns.reduce<Record<string, any>>(
      (accumulator, current) => {
        const property = current.dataIndex

        if (
          property === 'submission.$title' ||
          property === 'titleAndAbstract'
        ) {
          accumulator[property] = {
            title: get(manuscript, 'submission.$title'),
            hasOverdueTasks: manuscript.hasOverdueTasksForUser,
            importSource: importSourceFor(manuscript),
            abstract: manuscript.submission?.$abstract,
            link: titleLinkFor(manuscript),
          }

          return accumulator
        }

        if (property === 'author' || property === 'submitter') {
          accumulator[property] = manuscript.submitter && {
            displayName: manuscript.submitter.username,
            profilePicture: manuscript.submitter.profilePicture,
            orcid: manuscript.submitter.defaultIdentity?.identifier,
          }

          return accumulator
        }

        if (property === 'created') {
          accumulator[property] = manuscript.firstVersionCreated
          return accumulator
        }

        accumulator[property] = get(manuscript, property)
        return accumulator
      },
      {},
    )

    row.key = manuscript.shortId
    row.id = manuscript.id
    row.parentId = manuscript.parentId
    row.published = manuscript.published
    row.status = manuscript.status
    row.searchSnippets = manuscript.searchSnippets
    row.manuscriptVersions = (manuscript.manuscriptVersions?.length ?? 0) + 1
    row.editor = editorNamesFor(manuscript)

    if (variant === 'admin') {
      row.archived = isArchived
      row.submission = manuscript.submission
    }

    if (variant === 'submitter') {
      const authorTeam = manuscript.teams.find(team => team.role === 'author')

      const sortedAuthors = authorTeam?.members
        .slice()
        .sort(
          (a: any, b: any) =>
            new Date(b.created).getTime() - new Date(a.created).getTime(),
        )

      row.showAuthorProofing =
        authorProofingEnabled &&
        manuscript.authorFeedback.assignedAuthors?.length > 0 &&
        sortedAuthors[0]?.user?.id === currentUser.id &&
        ['assigned', 'inProgress', 'completed'].includes(manuscript.status)
    }

    if (variant === 'reviewer') {
      row.reviewerStatusBadge = findReviewerStatus(manuscript, currentUser.id)
      row.reviewerTeamId = manuscript.teams?.find(
        (team: Record<string, any>) =>
          ['reviewer', 'collaborativeReviewer'].includes(team.role) &&
          team.members?.some(
            (member: Record<string, any>) => member.user.id === currentUser.id,
          ),
      )?.id
    }

    if (variant === 'editor') {
      row.statusCounts = reviewerStatusEntriesFor(manuscript)
      row.lastUpdated = lastReviewerUpdateFor(manuscript)
    }

    return row
  })
  // #endregion row-data

  // #region handlers
  const applyQueryParams = (
    queryParams: Record<string, string | number | null>,
  ): void => {
    const params = new URLSearchParams(window.location.search)

    Object.entries(queryParams).forEach(([fieldName, fieldValue]) => {
      if (fieldValue) params.set(fieldName, String(fieldValue))
      else params.delete(fieldName)
    })

    setSearchParams(params)
  }

  const handleSortChange = (
    newSortState: ManuscriptsTableSortState | null,
  ): void => {
    applyQueryParams({
      [URI_PARAMS.SORT]: newSortState
        ? `${newSortState.columnKey}_${newSortState.order}`
        : null,
      [URI_PARAMS.PAGENUM]: 1,
    })
  }

  const handleFiltersChange = (
    newColumnFilters: Record<string, string[]>,
  ): void => {
    applyQueryParams({
      ...mapValues(newColumnFilters, (values, key) => {
        const column = tableColumns.find(c => c.key === key)

        if (column?.dataType === 'date') {
          const [start, end] = values ?? []

          return start && end
            ? `${isoDateToCompact(start)}-${isoDateToCompact(end)}`
            : null
        }

        return values && values.length > 0 ? values.join(',') : null
      }),
      [URI_PARAMS.PAGENUM]: 1,
    })
  }

  const handlePageChange = (newPage: number): void => {
    applyQueryParams({ [URI_PARAMS.PAGENUM]: newPage })
  }

  const handleSearch = (value: string): void => {
    applyQueryParams({ [URI_PARAMS.SEARCH]: value })
  }

  const handleOptionChange = (
    columnKey: string,
    id: string,
    value: string | null,
  ): void => {
    if (columnKey !== 'submission.$customStatus') return

    updateManuscript({
      variables: {
        id,
        input: JSON.stringify({ submission: { $customStatus: value } }),
      },
    })
  }

  const handleArchiveSelected = async (ids: string[]): Promise<void> => {
    await archiveManuscripts({ variables: { ids } })
    refetch()
  }

  const handleUnarchiveSelected = async (ids: string[]): Promise<void> => {
    await unarchiveManuscripts({ variables: { ids } })
    refetch()
  }

  const handlePublish = async (
    manuscriptId: string,
    submission: Record<string, any>,
  ): Promise<void> => {
    const invalidFields = await validateManuscriptSubmission(
      submission,
      submissionForm?.structure,
      validateDoi(apolloClient),
      validateSuffix(apolloClient, config.groupId),
    )

    if (invalidFields.filter(Boolean).length > 0) {
      actionModal.error({ content: t('manuscriptsPage.manuscriptInvalid') })
      return
    }

    const { data: publishData } = await publishManuscript({
      variables: { id: manuscriptId },
    })

    // @ts-ignore
    const response = publishData?.publishManuscript

    if (response?.steps?.some((step: Record<string, any>) => !step.succeeded)) {
      actionModal.error({
        content: (
          <ThemeProvider theme={theme}>
            <PublishingResponse response={response} />
          </ThemeProvider>
        ),
        title: t('manuscriptsTable.actions.Publishing error'),
      })
    }

    refetch()
  }

  const handleDownloadSelected = async (ids: string[]): Promise<void> => {
    const stringifiedJsonKeys = ['submission', 'jsonData']

    const sanitizeExportValue = (value: any): any => {
      if (Array.isArray(value)) return value.map(sanitizeExportValue)

      if (value && typeof value === 'object') {
        return Object.fromEntries(
          Object.entries(value)
            .filter(([key]) => key !== '__typename')
            .map(([key, val]) => [
              key,
              stringifiedJsonKeys.includes(key) && typeof val === 'string'
                ? JSON.parse(val || '{}')
                : sanitizeExportValue(val),
            ]),
        )
      }

      return value
    }

    const { data: exportData } = await getManuscriptsData({
      variables: { selectedManuscripts: ids },
    })

    const cleanedData = sanitizeExportValue(
      // @ts-ignore
      exportData?.getManuscriptsData ?? [],
    )

    const jsonBlob = new Blob([JSON.stringify(cleanedData, null, 2)], {
      type: 'application/json',
    })

    const url = URL.createObjectURL(jsonBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'exportedData.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleViewingArchivedChange = (viewingArchived: boolean): void => {
    applyQueryParams({
      [URI_PARAMS.ARCHIVED]: viewingArchived ? 'true' : null,
      [URI_PARAMS.PAGENUM]: 1,
    })
  }

  const handleReviewerStatusViewModeChange = (
    viewMode: 'compact' | 'detailed',
  ): void => {
    setReviewerStatusViewMode(viewMode)
    localStorage.setItem(REVIEWER_STATUS_VIEW_MODE_STORAGE_KEY, viewMode)
  }
  // #endregion handlers

  return {
    columnFilters,
    columns: tableColumns,
    dataSource,
    error,
    loading,
    onArchiveSelected: handleArchiveSelected,
    onDownloadSelected: handleDownloadSelected,
    onFiltersChange: handleFiltersChange,
    onOptionChange: handleOptionChange,
    onPageChange: handlePageChange,
    onReviewerStatusViewModeChange: handleReviewerStatusViewModeChange,
    onSearch: handleSearch,
    onSortChange: handleSortChange,
    onUnarchiveSelected: handleUnarchiveSelected,
    onViewingArchivedChange: handleViewingArchivedChange,
    page: Number(page),
    pageSize,
    actionModal,
    actionModalContextHolder,
    reviewerStatusViewMode,
    searchQuery: currentSearchQuery ?? '',
    selectable: variant === 'admin',
    showArchiveActions: variant === 'admin',
    showDownloadAction: variant === 'admin',
    showViewArchivedToggle: variant === 'admin',
    sortState,
    totalCount,
    viewingArchived: isArchived,
  }
}

export default useManuscriptsTable
