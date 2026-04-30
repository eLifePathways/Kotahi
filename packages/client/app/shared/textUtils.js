export const convertCamelCaseToTitleCase = string =>
  Array.from(string).reduce((acc, cur) => {
    if (!acc) return cur.toUpperCase()
    if (cur < 'A' || cur > 'Z') return acc + cur
    return `${acc} ${cur}`
  }, '')
