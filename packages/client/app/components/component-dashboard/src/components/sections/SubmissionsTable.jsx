/* eslint-disable react/prop-types */

import { useMemo, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation, Trans } from 'react-i18next'
import styled from 'styled-components'
import get from 'lodash/get'
import {
  grid,
  // DateParser
} from '@coko/client'

import { authorColumns } from '../../../../../../config/journal/manuscripts'
import {
  extractSortData,
  URI_PAGENUM_PARAM,
  URI_SEARCH_PARAM,
} from '../../../../../shared/urlParamUtils'
import ManuscriptsTable from '../../../../component-manuscripts-table/src/ManuscriptsTable'
import buildColumnDefinitions from '../../../../component-manuscripts-table/src/util/buildColumnDefinitions'
import { ConfigContext } from '../../../../config/src'
import {
  Pagination,
  PaginationContainerShadowed,
  SectionContent,
  SectionHeader,
  Title,
} from '../../../../shared'
import Table from '../../../../../ui/shared/Table'
import Link from '../../../../../ui/shared/Link'
import { convertTimestampToRelativeDateString } from '../../../../../shared/dateUtils'
import ManuscriptStatus from '../../../../../ui/shared/ManuscriptStatus'
import Badge from '../../../../../ui/shared/Badge'

const centeredColumns = [
  'shortId',
  'adaState',
  '$doi',
  'status',
  'manuscriptVersions',
  'reviewerStatusBadge',
  'statusCounts',
]

const LinkList = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
`

const TableWrapper = styled.div`
  padding: ${grid(2)};
`

const SubmissionsTable = props => {
  const {
    currentUser,
    manuscriptsUserHasCurrentRoleIn,
    submissionForm,
    applyQueryParams,
    uriQueryParams,
  } = props

  const config = useContext(ConfigContext)
  const { urlFrag } = config
  const { t } = useTranslation()
  const { groupName } = useParams()

  const authorProofingEnabled = config.controlPanel?.authorProofingEnabled

  const fieldDefinitions = useMemo(() => {
    const fields = submissionForm?.structure?.children ?? []
    const defs = {}
    fields.forEach(field => {
      // Incomplete fields in the formbuilder may not have a name specified. Ignore these
      if (field.name) defs[field.name] = field
    })
    return defs
  }, [submissionForm])

  const currentSearchQuery = uriQueryParams.get(URI_SEARCH_PARAM)
  const sortName = extractSortData(uriQueryParams).name
  const sortDirection = extractSortData(uriQueryParams).direction

  const page = uriQueryParams.get(URI_PAGENUM_PARAM) || 1
  const limit = config?.manuscript?.paginationCount || 10
  const { totalCount } = manuscriptsUserHasCurrentRoleIn

  const specialComponentValues = {
    urlFrag,
    currentUser,
  }

  const displayProps = {
    uriQueryParams,
    columnToSortOn: sortName,
    sortDirection,
    currentSearchQuery,
  }

  const configColumns = (config.dashboard?.mySubmissions || []).map(
    tc => tc.value,
  )

  const columnsProps = buildColumnDefinitions(
    config,
    authorColumns(configColumns),
    fieldDefinitions,
    specialComponentValues,
    displayProps,
  )

  const columnKeys =
    configColumns && configColumns.length > 0
      ? [...configColumns, 'actions']
      : [
          'shortId',
          'submission.$title',
          'status',
          'created',
          'updated',
          'actions',
        ]

  const specialColumnTitles = useMemo(
    () => ({
      'submission.$doi': t('formBuilder.fieldOpts.doi'),
      'submission.adaState': t('manuscriptsTable.adaState'),
      actions: 'Actions', // not in translation!
      author: t('manuscriptsTable.Author'),
      authorProofingLink: 'Actions', // not in translation!
      created: t('manuscriptsTable.Created'),
      editor: t('manuscriptsTable.Editor'),
      editorLinks: t('manuscriptsTable.Actions'),
      lastUpdated: t('manuscriptsTable.lastReviewerStatusUpdate'),
      manuscriptVersions: t('manuscriptsTable.Version'),
      reviewerLinks: 'Action', // not in translation!
      reviewerStatusBadge: t('manuscriptsTable.Your Status'),
      // shortId: t('manuscriptsTable.Manuscript number'),
      shortId: 'No.', // not in translation!
      status: t('manuscriptsTable.Status'),
      statusCounts: t('manuscriptsTable.Reviewer Status'),
      submitter: t('manuscriptsTable.Author'), // alias of 'author'
      titleAndAbstract: t('manuscriptsTable.Title'),
      updated: t('manuscriptsTable.Updated'),
    }),
    [t],
  )

  const actionText = useMemo(
    () => ({
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
    }),
    [t],
  )

  const findColumnTitle = key => {
    const formTitle = submissionForm.structure.children.find(
      field => field.name === key,
    )?.title

    if (formTitle) return formTitle
    if (specialColumnTitles[key]) return specialColumnTitles[key]
    return key
  }

  const tableColumns = columnKeys
    .map(key => ({
      title: findColumnTitle(key),
      dataIndex: key,
      key: key,
      align: centeredColumns.includes(key) ? 'center' : 'left',
    }))
    .map(column => {
      if (column.key === 'actions') {
        return {
          ...column,
          render: (_, record) => {
            const { id, status, showAuthorProofing } = record

            return (
              <LinkList>
                <Link to={`/${groupName}/versions/${id}/submit`}>
                  {actionText[status]}
                </Link>

                {showAuthorProofing && (
                  <Link to={`/${groupName}/versions/${id}/production`}>
                    {(status === 'assigned' || status === 'inProgress') &&
                      t(
                        'dashboardPage.mySubmissions.Provide production feedback',
                      )}

                    {status === 'completed' &&
                      t('dashboardPage.mySubmissions.View production feedback')}
                  </Link>
                )}
              </LinkList>
            )
          },
        }
      }

      if (
        ['created', 'updated'].includes(column.key) ||
        fieldDefinitions[column.key]?.component === 'DatePicker'
      ) {
        return {
          ...column,
          render: value => {
            // return <DateParser humanizeThreshold={7} timestamp={value} />
            if (!value) return null
            return convertTimestampToRelativeDateString(value)
          },
        }
      }

      if (column.key === 'status') {
        return {
          ...column,
          render: value => {
            return <ManuscriptStatus small status={value} />
          },
        }
      }

      if (column.key === 'submission.adaStatus') {
        return {
          ...column,
          render: value => {
            return <Badge small>{value}</Badge>
          },
        }
      }

      if (fieldDefinitions[column.key]?.options) {
        return {
          ...column,
          render: value => {
            if (!value) return null

            const option = fieldDefinitions[column.key].options.find(
              o => o.value === value,
            )

            if (option?.labelColor) {
              return (
                <Badge small style={{ backgroundColor: option.labelColor }}>
                  {option.label ?? value}
                </Badge>
              )
            }

            return option?.label ?? value
          },
        }
      }

      return column
    })

  const dataSource = manuscriptsUserHasCurrentRoleIn.manuscripts.map(
    manuscriptObj => {
      const manuscript = { ...manuscriptObj }
      manuscript.submission = JSON.parse(manuscript.submission)

      const row = tableColumns.reduce((accumulator, current) => {
        const property = current.dataIndex
        accumulator[property] = get(manuscript, property)
        return accumulator
      }, {})

      // #region author-proofing
      const authorTeam = manuscript.teams.find(team => team.role === 'author')

      const sortedAuthors = authorTeam?.members
        .slice()
        .sort(
          (a, b) =>
            Date.parse(new Date(b.created)) - Date.parse(new Date(a.created)),
        )

      row.showAuthorProofing =
        authorProofingEnabled &&
        manuscript.authorFeedback.assignedAuthors?.length > 0 &&
        sortedAuthors[0]?.user?.id === currentUser.id &&
        ['assigned', 'inProgress', 'completed'].includes(manuscript.status)
      // #endregion author-proofing

      row.key = manuscript.shortId
      row.id = manuscript.id
      return row
    },
  )

  return (
    <SectionContent>
      <SectionHeader>
        <Title>{t('dashboardPage.My Submissions')}</Title>
      </SectionHeader>

      <ManuscriptsTable
        applyQueryParams={applyQueryParams}
        columnsProps={columnsProps}
        getMainActionLink={manuscript =>
          `${urlFrag}/versions/${manuscript.parentId || manuscript.id}/submit`
        }
        manuscripts={manuscriptsUserHasCurrentRoleIn.manuscripts}
        sortDirection={sortDirection}
        sortName={sortName}
      />

      <Pagination
        limit={limit}
        page={page}
        PaginationContainer={PaginationContainerShadowed}
        setPage={newPage => applyQueryParams({ [URI_PAGENUM_PARAM]: newPage })}
        totalCount={totalCount}
      />

      <TableWrapper>
        <Table
          bordered={false}
          columns={tableColumns}
          dataSource={dataSource}
          onSearch={value => applyQueryParams({ [URI_SEARCH_PARAM]: value })}
          pagination={{
            current: Number(page),
            pageSize: limit,
            total: totalCount,
            showTotal: (total, range) => (
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
            onChange: newPage =>
              applyQueryParams({ [URI_PAGENUM_PARAM]: newPage }),
          }}
          searchPlaceholder={t('common.Enter search terms...')}
          showSearch
        />
      </TableWrapper>
    </SectionContent>
  )
}

export default SubmissionsTable
