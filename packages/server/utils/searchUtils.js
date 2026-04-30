/** Splits a search query string into string segments, each being a term or operator or bracket.
 * Spaces are not returned. */
const segmentQuery = query => {
  const segments = []
  let currentSegment = ''

  for (const c of query) {
    if (['"', '(', ')'].includes(c)) {
      if (currentSegment) segments.push(currentSegment)
      currentSegment = ''
      segments.push(c)
    } else if (c === '-' && !currentSegment) {
      segments.push(c)
    } else if (c === ' ') {
      if (currentSegment) segments.push(currentSegment)
      currentSegment = ''
    } else {
      currentSegment += c
    }
  }

  if (currentSegment) segments.push(currentSegment)
  return segments
}

/** Interpret all '-term' expressions as 'not' */
// eslint-disable-next-line camelcase
const apply_NOT = ex => {
  let i = 0

  while (i < ex.terms.length) {
    if (ex.terms[i] === '-') {
      if (i + 1 < ex.terms.length && !['OR', '-'].includes(ex.terms[i + 1])) {
        const subex = { type: 'not', terms: [ex.terms[i + 1]], parent: ex }

        ex.terms[i] = subex
        ex.terms.splice(i + 1, 1)
        i += 1
      } else {
        // the '-' didn't have a valid term or subexpression after it. Just remove/ignore it.
        ex.terms.splice(i, 1)
      }
    } else i += 1
  }
}

/** If one or more terms are 'OR', convert this to an 'or' group */
/* eslint-disable camelcase */
const apply_OR = ex => {
  const orGroups = []
  let orGroupTerms = []

  for (const term of ex.terms) {
    if (term === 'OR') {
      if (orGroupTerms.length)
        orGroups.push({ type: 'and', terms: orGroupTerms, parent: ex })
      orGroupTerms = []
    } else {
      orGroupTerms.push(term)
    }
  }

  if (orGroupTerms.length)
    orGroups.push({ type: 'and', terms: orGroupTerms, parent: ex })

  if (!orGroups.length) return

  ex.type = 'or'
  ex.terms = orGroups
}
/* eslint-enable camelcase */

/** find 'OR' and '-' items in an expression and use them to create 'or'/'not' subexpressions */
/* eslint-disable camelcase */
const apply_OR_NOT_Recursively = (ex, maxDepth = 50) => {
  if (maxDepth <= 0)
    throw new Error('Search expression exceeds maximum nesting depth!')
  if (ex.type === 'phrase') return

  // depth-first recursion
  for (const term of ex.terms) {
    if (term.terms) {
      apply_OR_NOT_Recursively(term, maxDepth - 1)
    }
  }

  // some poorly formatted subexpressions may have ended up with no terms; remove these.
  ex.terms = ex.terms.filter(x => typeof x === 'string' || x.terms.length)

  apply_NOT(ex)
  apply_OR(ex)
}
/* eslint-enable camelcase */

const operatorPrecedence = { not: 0, phrase: 1, and: 2, or: 3 }

const escapeTerm = term => {
  return term.replace(':', '\\:')
}

const getSubExpressionWithParenthesesIfNeeded = (outerExType, ex, maxDepth) => {
  if (typeof ex === 'string') {
    ex = escapeTerm(ex)

    // Support wildcard * on end of term
    if (ex.endsWith('*')) ex = `${ex.substring(0, ex.length - 1)}:*`

    // Searching for '10.1101/2022.08.11.503644' should also search '/10.1101/2022.08.11.503644' to enable DOI match
    if (ex.includes('/') && !ex.startsWith('/') && !ex.includes(':')) {
      if (outerExType === 'or') return `${ex} | /${ex}`
      return `( ${ex} | /${ex} )`
    }

    return ex
  }

  if (!ex.terms.length) return null

  while (ex.type !== 'not' && ex.terms.length <= 1)
    return getSubExpressionWithParenthesesIfNeeded(
      outerExType,
      ex.terms[0],
      maxDepth,
    )

  if (
    outerExType === 'not' ||
    operatorPrecedence[outerExType] < operatorPrecedence[ex.type]
  )
    return `( ${expressionTreeToPostgresQuery(ex, maxDepth)} )`
  return expressionTreeToPostgresQuery(ex, maxDepth)
}

const expressionTreeToPostgresQuery = (ex, maxDepth = 50) => {
  if (maxDepth <= 0)
    throw new Error('Search expression exceeds maximum nesting depth')

  if (ex.type === 'and')
    return ex.terms
      .map(t => getSubExpressionWithParenthesesIfNeeded(ex.type, t, maxDepth))
      .filter(Boolean)
      .join(' & ')
  if (ex.type === 'phrase')
    return ex.terms
      .map(t => getSubExpressionWithParenthesesIfNeeded(ex.type, t, maxDepth))
      .filter(Boolean)
      .join(' <-> ')
  if (ex.type === 'or')
    return ex.terms
      .map(t => getSubExpressionWithParenthesesIfNeeded(ex.type, t, maxDepth))
      .filter(Boolean)
      .join(' | ')

  if (ex.type === 'not') {
    const terms = ex.terms
      .map(t => getSubExpressionWithParenthesesIfNeeded(ex.type, t, maxDepth))
      .filter(Boolean)

    if (terms.length) return `!${terms[0]}`
    return ''
  }

  throw new Error(`Unrecognised expression type ${ex.type}`)
}

// eslint-disable-next-line camelcase
const generateExpressionTreeWithout_OR_NOT = segments => {
  let expression = { type: 'and', terms: [], parent: null }

  for (const segment of segments) {
    if (segment === '"') {
      if (expression.type === 'phrase') {
        if (expression.parent) {
          if (expression.terms.length) expression.parent.terms.push(expression)
          expression = expression.parent
        }
      } else {
        expression = { type: 'phrase', terms: [], parent: expression }
      }
    } else if (segment === '(') {
      if (expression.type !== 'phrase')
        expression = { type: 'and', terms: [], parent: expression }
    } else if (segment === ')') {
      if (expression.type !== 'phrase' && expression.parent) {
        if (expression.terms.length) expression.parent.terms.push(expression)
        expression = expression.parent
      }
    } else {
      // Note: At this point we treat 'OR' and '-' like ordinary words. We will deal with these in a separate step.

      // postgres doesn't like '&|\: characters in words, and treats them as space when indexing text.
      // So we should convert such words into phrases with spaces replacing the offending characters.
      const parts = segment.split(/['&|\\]/g).filter(Boolean)

      if (
        parts.length <= 1 ||
        (expression.parent && expression.parent.type === 'phrase')
      )
        expression.terms.push(...parts)
      else
        expression.terms.push({
          type: 'phrase',
          terms: parts,
          parent: expression,
        })
    }
  }

  // Deal gracefully with any unterminated subexpressions
  while (expression.parent) {
    if (expression.terms.length) expression.parent.terms.push(expression)
    expression = expression.parent
  }

  return expression
}

/** Convert a user-friendly search string to postgresql tsquery format searchstring */
const formatSearchQueryForPostgres = query => {
  const segments = segmentQuery(query)
  const expression = generateExpressionTreeWithout_OR_NOT(segments)
  apply_OR_NOT_Recursively(expression)
  return expressionTreeToPostgresQuery(expression)
}

module.exports = {
  formatSearchQueryForPostgres,
  segmentQuery,
}
