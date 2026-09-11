import { validateFormField } from './formValidation'

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

/*
Get all team members of a manuscript with a specified role
*/
export const getMembersOfTeam = (version, role) => {
  if (!version.teams) return []

  const teams = version.teams.find(team => team.role === role)
  return teams ? teams.members : []
}

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
