import { get } from 'lodash'
import { validateFormField } from './formValidation'
import {
  convertTimestampToRelativeDateString,
  convertTimestampToDateWithoutTimeString,
} from './dateUtils'
import { StatusBadge } from '../components/shared'
import TitleWithAbstractAsTooltip from '../components/component-manuscripts-table/src/cell-components/TitleWithAbstractAsTooltip'

/** Validate just manuscript.submission, based on the supplied array of field definitions */
export const validateManuscriptSubmission = async (
  submission,
  submissionForm,
  validateDoi,
  validateSuffix,
) => {
  const fieldDefinitions = submissionForm?.children ?? []

  const promiseArr = fieldDefinitions
    .filter(element => element?.name)
    .map(element => {
      const validatorFn = validateFormField(
        element.validate,
        element.validateValue,
        element.name,
        JSON.parse(element.doiValidation || false),
        JSON.parse(element.doiUniqueSuffixValidation || false),
        validateDoi,
        validateSuffix,
        element.component,
      )

      const errorMessage = validatorFn(submission[element.name.split('.')[1]])

      return errorMessage
    })

  const results = await Promise.all(promiseArr)
  return results.filter(Boolean)
}

/** Find the data stored in the manuscript for this fieldName. If the fieldDefinition from the form has a key/value structure we should
 * treat the manuscript data as the key and obtain the displayValue from the fieldDefinition. Otherwise use the manuscript data directly
 * as the displayValue. If manuscript data is an array, we have to do this for each item in the array.
 * There is special logic for some fieldNames, such as 'created' and 'updated'.
 */
export const getFieldValueAndDisplayValue = (column, manuscript) => {
  if (column.name === 'created')
    return [
      {
        value: manuscript.firstVersionCreated,
        displayValue: convertTimestampToRelativeDateString(
          manuscript.firstVersionCreated,
        ),
      },
    ]
  if (column.name === 'updated')
    return [
      {
        value: manuscript.updated,
        displayValue: convertTimestampToRelativeDateString(manuscript.updated),
      },
    ]
  if (column.name === 'status')
    return [
      {
        value: manuscript.status,
        displayValue: (
          <StatusBadge
            published={manuscript.published}
            status={manuscript.status}
          />
        ),
      },
    ]
  if (column.name === 'manuscriptVersions')
    return [
      {
        value: manuscript.manuscriptVersions,
        displayValue: `${manuscript.numVersions}`,
      },
    ]
  if (column.name === 'titleAndAbstract')
    return [
      {
        value: manuscript.submission.$title || '',
        displayValue: <TitleWithAbstractAsTooltip manuscript={manuscript} />,
      },
    ]
  if (column.name === 'submission.$embargoDate')
    return [
      {
        value: manuscript.submission?.$embargoDate,
        displayValue: manuscript.submission?.$embargoDate
          ? convertTimestampToDateWithoutTimeString(
              manuscript.submission?.$embargoDate,
            )
          : '',
      },
    ]
  // if (column.name === 'shortId')
  //  return [manuscript.shortId, manuscript.shortId.toString()]

  const valueInManuscript = get(manuscript, column.name, null)

  const valuesInManuscript = Array.isArray(valueInManuscript)
    ? valueInManuscript
    : [valueInManuscript]

  return valuesInManuscript
    .filter(val => !!val)
    .map(val => {
      const option = column.filterOptions?.find(o => o.value === val)

      return {
        value: val,
        displayValue: option?.label ?? val,
        color: option?.labelColor,
      }
    })
}

/*
Get all team members of a manuscript with a specified role
*/
export const getMembersOfTeam = (version, role) => {
  if (!version.teams) return []

  const teams = version.teams.find(team => team.role === role)
  return teams ? teams.members : []
}

const getMetadataObject = (version, value) => {
  const metadata = version.meta || {}
  return metadata[value] || []
}

export const getSubmittedDate = version =>
  getMetadataObject(version, 'history').find(
    history => history.type === 'submitted',
  ) || []

/*
Get all roles of the user in a manuscript
*/
export const getRoles = (manuscript, userId) =>
  manuscript.teams
    .filter(t => t.members.some(member => member.user.id === userId))
    .map(t => t.role)

export const getActiveTab = (location, tabKey = 'tab') => {
  const searchParams = new URLSearchParams(location.search)
  return searchParams.get(tabKey)
}
