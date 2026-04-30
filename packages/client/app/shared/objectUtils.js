/** Parses if value is a string, otherwise returns value unaltered. */

export const ensureJsonIsParsed = value =>
  typeof value === 'string' ? JSON.parse(value) : value
