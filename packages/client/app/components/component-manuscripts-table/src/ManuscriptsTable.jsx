/* eslint-disable react/prop-types */

import { useTranslation } from 'react-i18next'
import { ManuscriptsHeaderRow, ManuscriptsTableStyled } from './style'
import FilterSortHeader from './FilterSortHeader'
import ManuscriptRow from './ManuscriptRow'
import {
  URI_PAGENUM_PARAM,
  URI_SORT_PARAM,
} from '../../../shared/urlParamUtils'
import { Placeholder } from '../../component-dashboard/src/style'
import { getNumVersions } from '../../component-dashboard/src/utils'

const ManuscriptsTable = ({
  applyQueryParams,
  archived,
  manuscripts,
  columnsProps,
  sortDirection,
  sortName,
  getMainActionLink,
}) => {
  const { t } = useTranslation()

  const setFilter = (name, value) =>
    applyQueryParams({
      [name]: value,
      [URI_PAGENUM_PARAM]: 1,
    })

  const setSort = (name, direction) =>
    applyQueryParams({
      [URI_SORT_PARAM]: `${name}_${direction}`,
      [URI_PAGENUM_PARAM]: 1,
    })

  return (
    <ManuscriptsTableStyled>
      <ManuscriptsHeaderRow $archived={archived}>
        {columnsProps.map(info => (
          <FilterSortHeader
            columnInfo={info}
            key={info.name}
            setFilter={setFilter}
            setSort={setSort}
            sortDirection={sortDirection}
            sortName={sortName}
          />
        ))}
      </ManuscriptsHeaderRow>
      {manuscripts.length === 0 ? (
        <Placeholder>
          {t('manuscriptsTable.No matching manuscripts were found')}
        </Placeholder>
      ) : (
        manuscripts.map(manuscript => {
          const latestVersion = {
            numVersions: getNumVersions(manuscript),
            ...manuscript,
          }

          if (typeof latestVersion.submission === 'string')
            latestVersion.submission = JSON.parse(latestVersion.submission)

          const mainActionLink =
            getMainActionLink && getMainActionLink(latestVersion)

          return (
            <ManuscriptRow
              archived={archived}
              columnDefinitions={columnsProps}
              key={latestVersion.id}
              mainActionLink={mainActionLink}
              manuscript={latestVersion}
              setFilter={setFilter}
            />
          )
        })
      )}
    </ManuscriptsTableStyled>
  )
}

export default ManuscriptsTable
