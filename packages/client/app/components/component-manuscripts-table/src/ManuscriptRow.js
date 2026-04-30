/* eslint-disable react/prop-types */

import PropTypes from 'prop-types'
import { sanitize } from 'isomorphic-dompurify'
import 'rc-tooltip/assets/bootstrap_white.css'

import { useHistory } from 'react-router-dom'
import { getFieldValueAndDisplayValue } from '../../../shared/manuscriptUtils'
import {
  Cell,
  ClickableManuscriptsRow,
  ManuscriptsRow,
  SnippetRow,
} from './style'

const ManuscriptRow = ({
  manuscript,
  columnDefinitions,
  setFilter,
  mainActionLink,
  archived,
}) => {
  const history = useHistory()

  const rowCells = columnDefinitions.map(column => {
    const values = getFieldValueAndDisplayValue(column, manuscript)
    const Renderer = column.component
    return (
      <Cell key={column.name} {...column}>
        <Renderer
          applyFilter={
            column.filterOptions && (val => setFilter(column.name, val))
          }
          manuscript={manuscript}
          values={values}
          {...column.extraProps}
        />
      </Cell>
    )
  })

  const searchSnippet = (
    <SnippetRow
      dangerouslySetInnerHTML={{
        __html: `... ${manuscript.searchSnippet} ...`,
      }}
    />
  )

  // Whole Row is clickable
  if (mainActionLink) {
    const onRowClick = () => history.push(mainActionLink)

    return (
      <>
        <ClickableManuscriptsRow
          $archived={archived}
          onClick={onRowClick}
          onKeyDown={e => e.key === 'Enter' && onRowClick()}
          role="button"
          tabIndex={0}
        >
          {rowCells}
        </ClickableManuscriptsRow>
        {manuscript.searchSnippet && searchSnippet}
      </>
    )
  }

  return (
    <>
      <ManuscriptsRow $archived={archived}>{rowCells}</ManuscriptsRow>
      {manuscript.searchSnippet && (
        <SnippetRow
          dangerouslySetInnerHTML={{
            __html: `... ${sanitize(manuscript.searchSnippet)} ...`,
          }}
        />
      )}
    </>
  )
}

ManuscriptRow.propTypes = {
  manuscript: PropTypes.shape({
    teams: PropTypes.arrayOf(PropTypes.object),
    created: PropTypes.string.isRequired,
    id: PropTypes.string,
    updated: PropTypes.string,
    status: PropTypes.string.isRequired,
    // Disabled because submission can have different fields

    submission: PropTypes.object.isRequired,
  }).isRequired,
  columnDefinitions: PropTypes.arrayOf(
    PropTypes.shape({
      /** The column name, corresponding either to a field name e.g. 'submission.$abstract' or to a special built-in column type */
      name: PropTypes.string.isRequired,
      /** Title to display in column heading */
      title: PropTypes.string.isRequired,
      /** Can this column be sorted? */
      canSort: PropTypes.bool.isRequired,
      /** 'ASC' or 'DESC' if this column is currently used to sort the table */
      sortDirection: PropTypes.string,
      /** The first sort direction to apply if the user opts to sort by this column */
      defaultSortDirection: PropTypes.string,
      /** The set of values that this column can be filtered by */
      filterOptions: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          value: PropTypes.string.isRequired,
        }).isRequired,
      ),
      /** If this column is currently used to filter the results, the filter value in use */
      filterValue: PropTypes.string,
      /** CSS flex attribute to use for sizing the column */
      flex: PropTypes.string.isRequired,
      /** The component to use for displaying a cell in this column */
      component: PropTypes.elementType.isRequired,
      /** Extra non-standard props to be supplied to the component */
      extraProps: PropTypes.shape({}),
    }).isRequired,
  ).isRequired,
  setFilter: PropTypes.func.isRequired,
}

export default ManuscriptRow
