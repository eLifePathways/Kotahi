import { DROPDOWN_ID } from './constants'

const { keys } = Object

export const getFormBadgeBg = form => props => {
  const colorVariations = {
    common: '#f0f0f0',
    decision: '#fffacb',
    review: '#ffddc2',
    submission: props.theme.color.brand1.tint90,
    editors: '#fae5b4',
  }

  const safeKey = keys(colorVariations).includes(form) ? form : 'common'
  return colorVariations[safeKey]
}

export const normalize = str => str?.trim().toLowerCase()

export const capitalizeFirst = value =>
  `${value.charAt(0).toUpperCase()}${value.slice(1)}`

export const splitAndCapitalize = value => {
  let result = value.split(/(?=[A-Z])/).join(' ')
  result = result.charAt(0).toUpperCase() + result.slice(1)
  return result
}

/**
 * Finds an option by a given property.
 * @param {Object} prop - The property to search by.
 * @param {Array} options - The list of options to search within.
 * @returns {Object} The found option or undefined if not found.
 */
export const getBy = (prop, options = []) => {
  const [k, v] = Object.entries(prop)[0]
  return options.find(option => option[k] === v)
}

/**
 * Generates opening and closing brackets of the specified length.
 * @param {number} length - The length of the brackets.
 * @returns {Array} An array containing the opening and closing brackets and the length.
 * @returns {string} return[0] - The opening brackets.
 * @returns {string} return[1] - The closing brackets.
 * @returns {number} return[2] - The length of the brackets.
 */
export const getBrackets = length => {
  const brackets = ['', '']
  Array.from({ length }).forEach(() => {
    brackets[0] += '{'
    brackets[1] += '}'
  })
  return [...brackets, length]
}

export const getUpdatedPosition = ({ surface, end, overlay }) => {
  const top = end.top - surface.top + 20
  let left = end.left - surface.left - overlay.width / 2

  if (end.left - overlay.width / 2 < surface.left) {
    left += surface.left - (end.left - overlay.width / 2)
  }

  if (end.left + overlay.width / 2 > surface.right) {
    left -= end.left + overlay.width / 2 - surface.right
  }

  return { left, top }
}

export const getOptionsFromDOM = index => {
  const dropdown = document.getElementById(DROPDOWN_ID)
  if (!dropdown) return {}
  const options = [...dropdown.querySelectorAll('button')]
  const selected = options[index]
  return { selected, options }
}
