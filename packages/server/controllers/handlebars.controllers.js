const Form = require('../models/form/form.model')

const {
  overrideFormKeys,
  HANDLEBARS_NON_FORM_VARIABLES,
  EDITORS_DATA_VARIABLES,
} = require('../services/handlebars.service')

const ALLOWED_FORMS = ['submission' /* , 'review', 'decision' */]
const NON_ESCAPED_COMPONENTS = ['AbstractEditor', 'Abstract', 'FullWaxField']

/**
 * Converts a camelCase string to a more readable format.
 *
 * @param {string} camelCaseString - The camelCase string to convert.
 * @returns {string} - The converted string in a more readable format.
 */
const toReadable = camelCaseString => {
  if (!camelCaseString) return ''

  // Insert spaces before each uppercase letter and capitalize the first letter
  const readableString = camelCaseString
    .replace(/([A-Z])/g, ' $1') // Insert space before each uppercase letter
    .replace(/^./, str => str.toUpperCase()) // Capitalize the first letter

  return readableString
}

/**
 * Builds an option object for a form variable.
 *
 * @param {string} category - The category of the form: eg.: submission, review, decision
 * @returns {(name: string, title: string) => {value: string, label: string, type: string, form: string} | false}
 */
const buildOption = category => {
  return ({ name, title, component }) => {
    if (!name || !ALLOWED_FORMS.includes(category)) return false
    const value = overrideFormKeys(category, name)
    const label = title || toReadable(value.replace(category, ''))

    const option = {
      value,
      label,
      type: NON_ESCAPED_COMPONENTS.includes(component) ? 'link' : 'text',
      form: category,
    }

    return option
  }
}

const getVariables = async groupId => {
  const { result: forms } = await Form.find({ groupId })

  const formVars = forms.map(({ structure, category }) => {
    const { children } = structure
    return children.map(buildOption(category)).filter(Boolean)
  })

  return [
    ...HANDLEBARS_NON_FORM_VARIABLES,
    ...EDITORS_DATA_VARIABLES,
    ...formVars,
  ].flat()
}

module.exports = {
  getVariables,
}
