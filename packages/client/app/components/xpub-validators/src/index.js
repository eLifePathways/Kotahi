import striptags from 'striptags'

export const split =
  (separator = ',') =>
  value =>
    value ? value.split(separator) : []

export const join =
  (separator = ',') =>
  value =>
    value ? value.join(separator) : value

export const required = value => {
  if (value === undefined || value === null || value === '') {
    return 'Required'
  }

  if (Array.isArray(value) && !value.length) {
    return 'Required'
  }

  return undefined
}

export const minChars = min => {
  const message = `Enter at least ${min} characters`

  return value => {
    const text = striptags(value)

    if (!text || text.length < min) {
      return message
    }

    return undefined
  }
}

export const maxChars = max => {
  const message = `Enter no more than ${max} characters`

  return value => {
    const text = striptags(value)

    if (!text || text.length > max) {
      return message
    }

    return undefined
  }
}

// TODO: minSize and minChars could be merged into one function (strip tags if it's text, then check length of string or array)
export const minSize = min => {
  const message = `Enter at least ${min} ${min === 1 ? 'item' : 'items'}`

  return value => {
    if (!value || value.length < min) {
      return message
    }

    return undefined
  }
}
