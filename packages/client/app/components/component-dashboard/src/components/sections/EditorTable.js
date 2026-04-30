/* eslint-disable react/prop-types */

import { useMemo, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import ManuscriptsTable from '../../../../component-manuscripts-table/src/ManuscriptsTable'
import buildColumnDefinitions from '../../../../component-manuscripts-table/src/util/buildColumnDefinitions'
import {
  Pagination,
  PaginationContainerShadowed,
  SectionContent,
  SectionHeader,
  Title,
} from '../../../../shared'
import { editorColumns } from '../../../../../../config/journal/manuscripts'
import {
  extractSortData,
  URI_PAGENUM_PARAM,
  URI_SEARCH_PARAM,
} from '../../../../../shared/urlParamUtils'
import { ConfigContext } from '../../../../config/src'

const EditorTable = ({
  currentUser,
  doUpdateManuscript,
  manuscriptsUserHasCurrentRoleIn,
  submissionForm,
  unsetCustomStatus,
  setReadyToEvaluateLabels,
  uriQueryParams,
  applyQueryParams,
}) => {
  const config = useContext(ConfigContext)
  const { urlFrag } = config

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

  const setReadyToEvaluateLabel = id => {
    return setReadyToEvaluateLabels(id)
  }

  const specialComponentValues = {
    urlFrag,
    currentUser,
    setReadyToEvaluateLabel,
    unsetCustomStatus,
  }

  const displayProps = {
    uriQueryParams,
    columnToSortOn: sortName,
    sortDirection,
    currentSearchQuery,
  }

  const rColumn = (config.dashboard?.editingQueue || []).map(tc => tc.value)

  const columnsProps = buildColumnDefinitions(
    config,
    editorColumns(rColumn),
    fieldDefinitions,
    specialComponentValues,
    displayProps,
    doUpdateManuscript,
  )

  const { t } = useTranslation()

  return (
    <SectionContent>
      <SectionHeader>
        <Title>{t("dashboardPage.Manuscripts I'm editor of")}</Title>
      </SectionHeader>
      <ManuscriptsTable
        applyQueryParams={applyQueryParams}
        columnsProps={columnsProps}
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
    </SectionContent>
  )
}

export default EditorTable
