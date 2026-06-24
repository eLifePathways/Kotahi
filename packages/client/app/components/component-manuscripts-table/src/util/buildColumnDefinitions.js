import buildSpecialColumnProps from './specialColumnProps'
import { DefaultField } from '../cell-components'

const fieldCanBeSorted = field => {
  return ['AbstractEditor', 'TextField'].includes(field?.component)
}

/**
 * buildColumnDefinition: Takes in a column key and information to build out a standardized object of properties
 * @param {string} columnName The column key
 * @param {object} fieldDefinitions Field definitions returned from the GET_MANUSCRIPTS_AND_FORM query
 * @param {object} specialColumnProperties Special component definitions for columns
 * @param {object} customDisplayProps Props for display
 */
const buildColumnDefinition = (
  columnName,
  fieldDefinitions,
  specialColumnProperties,
  customDisplayProps,
) => {
  const { currentSearchQuery, columnToSortOn, sortDirection, uriQueryParams } =
    customDisplayProps

  const field = fieldDefinitions[columnName]
  const presetProps = specialColumnProperties[columnName] || {}

  // We disable sorting by column when showing search results, and just order by search ranking.
  // This could be changed in future to allow ordering within search results.
  const canSort =
    !currentSearchQuery && (presetProps.canSort || fieldCanBeSorted(field))

  const filterOptions = presetProps.filterOptions || field?.options

  const defaultProps = {
    name: columnName,
    centered: field?.centered || false,
    title: field?.shortDescription ?? field?.title ?? '',
    defaultSortDirection: canSort ? 'ASC' : null,
    component: DefaultField,
    flex: '1 0.5 16em',
  }

  return {
    ...defaultProps,
    ...presetProps,
    canSort,
    filterOptions,
    filterValue:
      ((filterOptions || presetProps.canFilterByDateRange) &&
        uriQueryParams.get(columnName)) ||
      null,
    sortDirection:
      canSort && columnToSortOn === columnName ? sortDirection : null,
  }
}

/**
 * buildColumnDefinitions: Master function to build the Manuscripts table definition
 * @param {string[]} columnNames The columns we want to display as a part of the table
 * @param {object} fieldDefinitions The graphQL structure of the fields returned from GET_MANUSCRIPTS_AND_FORM
 * @param {object} specialComponentValues values needed for specific components
 * @param {object} displayProps Props for display
 * @returns {object} the list of standardized column information
 */
const buildColumnDefinitions = (
  config,
  columnNames,
  fieldDefinitions,
  specialComponentValues,
  displayProps,
  doUpdateManuscript,
  archived,
) => {
  const specialColumnProperties = buildSpecialColumnProps(
    specialComponentValues,
    config,
    fieldDefinitions,
    doUpdateManuscript,
    archived,
  )

  return columnNames.map(columnName => {
    return buildColumnDefinition(
      columnName,
      fieldDefinitions,
      specialColumnProperties,
      displayProps,
    )
  })
}

export default buildColumnDefinitions
