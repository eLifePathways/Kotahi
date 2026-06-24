/* eslint-disable */

const { formatSearchQueryForPostgres, segmentQuery } = require('../searchUtils')

describe('segmentQuery', () => {
  test('blank', () => {
    expect(segmentQuery('')).toEqual([])
  })
  test('whitespace', () => {
    expect(segmentQuery('    ')).toEqual([])
  })
  test('single', () => {
    expect(segmentQuery('hello')).toEqual(['hello'])
  })
  test('hyphenated', () => {
    expect(segmentQuery('hi-ho')).toEqual(['hi-ho'])
  })
  test('and', () => {
    expect(segmentQuery('this that other')).toEqual(['this', 'that', 'other'])
  })
  test('phrase', () => {
    expect(segmentQuery('"a phrase"')).toEqual(['"', 'a', 'phrase', '"'])
  })
  test('phrase2', () => {
    expect(segmentQuery('" a phrase "')).toEqual(['"', 'a', 'phrase', '"'])
  })
  test('phrase3', () => {
    expect(segmentQuery('a word and "a phrase"')).toEqual([
      'a',
      'word',
      'and',
      '"',
      'a',
      'phrase',
      '"',
    ])
  })
  test('not', () => {
    expect(segmentQuery('-this')).toEqual(['-', 'this'])
  })
  test('not2', () => {
    expect(segmentQuery('- this')).toEqual(['-', 'this'])
  })
  test('not3', () => {
    expect(segmentQuery('that -this')).toEqual(['that', '-', 'this'])
  })
  test('or', () => {
    expect(segmentQuery('this OR that')).toEqual(['this', 'OR', 'that'])
  })
  test('parentheses', () => {
    expect(segmentQuery('bank -("river bank")')).toEqual([
      'bank',
      '-',
      '(',
      '"',
      'river',
      'bank',
      '"',
      ')',
    ])
  })
  test('parentheses2', () => {
    expect(segmentQuery('bank -((river OR road) bank)')).toEqual([
      'bank',
      '-',
      '(',
      '(',
      'river',
      'OR',
      'road',
      ')',
      'bank',
      ')',
    ])
  })
  test('extra space', () => {
    expect(segmentQuery('   this  that  (  other  )  ')).toEqual([
      'this',
      'that',
      '(',
      'other',
      ')',
    ])
  })
})

describe('formatSearchQueryForPostgres', () => {
  test('blank', () => {
    expect(formatSearchQueryForPostgres('')).toEqual('')
  })
  test('single', () => {
    expect(formatSearchQueryForPostgres('hello')).toEqual('hello')
  })
  test('hyphenated', () => {
    expect(formatSearchQueryForPostgres('hi-ho')).toEqual('hi-ho')
  })
  test('and', () => {
    expect(formatSearchQueryForPostgres('this that other')).toEqual(
      'this & that & other',
    )
  })
  test('phrase', () => {
    expect(formatSearchQueryForPostgres('"a phrase"')).toEqual('a <-> phrase')
  })
  test('phrase2', () => {
    expect(formatSearchQueryForPostgres('a word and "a phrase"')).toEqual(
      'a & word & and & a <-> phrase',
    )
  })
  test('phrase3', () => {
    expect(formatSearchQueryForPostgres('a word but -"a phrase"')).toEqual(
      'a & word & but & !( a <-> phrase )',
    )
  })
  test('not', () => {
    expect(formatSearchQueryForPostgres('-this')).toEqual('!this')
  })
  test('not2', () => {
    expect(formatSearchQueryForPostgres('that -this')).toEqual('that & !this')
  })
  test('or', () => {
    expect(formatSearchQueryForPostgres('this OR that')).toEqual('this | that')
  })
  test('parentheses', () => {
    expect(formatSearchQueryForPostgres('bank -("river bank")')).toEqual(
      'bank & !( river <-> bank )',
    )
  })
  test('parentheses2', () => {
    expect(
      formatSearchQueryForPostgres('bank -((river OR road) bank)'),
    ).toEqual('bank & !( ( river | road ) & bank )')
  })
  test('malformed1', () => {
    expect(formatSearchQueryForPostgres('a b)')).toEqual('a & b')
    expect(formatSearchQueryForPostgres(')a b')).toEqual('a & b')
    expect(formatSearchQueryForPostgres('a b(')).toEqual('a & b')
    expect(formatSearchQueryForPostgres('(a b')).toEqual('a & b')
    expect(formatSearchQueryForPostgres('a (b')).toEqual('a & b')
    expect(formatSearchQueryForPostgres('a) b')).toEqual('a & b')
  })
  test('malformed2', () => {
    expect(formatSearchQueryForPostgres('a b -')).toEqual('a & b')
    expect(formatSearchQueryForPostgres('a (-) b')).toEqual('a & b')
  })
  test('malformed3', () => {
    expect(formatSearchQueryForPostgres('a "" b')).toEqual('a & b')
    expect(formatSearchQueryForPostgres('a b "')).toEqual('a & b')
    expect(formatSearchQueryForPostgres('a " b')).toEqual('a & b')
    expect(formatSearchQueryForPostgres('"a b')).toEqual('a <-> b')
  })
  test('malformed4', () => {
    expect(formatSearchQueryForPostgres('a OR OR b')).toEqual('a | b')
    expect(formatSearchQueryForPostgres('a b OR')).toEqual('a & b')
    expect(formatSearchQueryForPostgres('OR a b')).toEqual('a & b')
    expect(formatSearchQueryForPostgres('"a OR b"')).toEqual('a <-> OR <-> b')
  })
  test('escaping', () => {
    expect(
      formatSearchQueryForPostgres('https://doi.org/10.1101/2022.08.11.503644'),
    ).toEqual('https\\://doi.org/10.1101/2022.08.11.503644')
  })
  test('doi', () => {
    expect(
      formatSearchQueryForPostgres('doi.org/10.1101/2022.08.11.503644'),
    ).toEqual(
      'doi.org/10.1101/2022.08.11.503644 | /doi.org/10.1101/2022.08.11.503644',
    )
  })
  test('doi2', () => {
    expect(
      formatSearchQueryForPostgres(
        '"this doi.org/10.1101/2022.08.11.503644 in phrase"',
      ),
    ).toEqual(
      'this <-> ( doi.org/10.1101/2022.08.11.503644 | /doi.org/10.1101/2022.08.11.503644 ) <-> in <-> phrase',
    )
  })
  test('apostrophe', () => {
    expect(formatSearchQueryForPostgres(`apples aren't oranges`)).toEqual(
      'apples & aren <-> t & oranges',
    )
  })
  test('apostrophe2', () => {
    expect(formatSearchQueryForPostgres(`apples -aren't oranges`)).toEqual(
      'apples & !( aren <-> t ) & oranges',
    )
    expect(formatSearchQueryForPostgres(`"apples aren't oranges"`)).toEqual(
      'apples <-> aren <-> t <-> oranges',
    )
  })
  test('apostrophe3', () => {
    expect(formatSearchQueryForPostgres(`boys' toys`)).toEqual('boys & toys')
  })
  test('illegal chars', () => {
    expect(formatSearchQueryForPostgres('AT&T')).toEqual('AT <-> T')
    expect(formatSearchQueryForPostgres('"the AT&T company"')).toEqual(
      'the <-> AT <-> T <-> company',
    )
    expect(formatSearchQueryForPostgres('x|y AT&T back\\slash')).toEqual(
      'x <-> y & AT <-> T & back <-> slash',
    )
  })
  test('wildcard', () => {
    expect(formatSearchQueryForPostgres(`"univers* paper"`)).toEqual(
      'univers:* <-> paper',
    )
  })
})
