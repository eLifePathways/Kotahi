/* eslint-disable */

import pruneEmpty from '../pruneEmpty'

describe('pruneEmpty', () => {
  test('nil', () => {
    expect(pruneEmpty(undefined)).toEqual(undefined)
    expect(pruneEmpty(null)).toEqual(null)
  })
  test('non-object', () => {
    expect(pruneEmpty('')).toEqual('')
    expect(pruneEmpty(0)).toEqual(0)
    expect(pruneEmpty(false)).toEqual(false)
    expect(pruneEmpty('cheese')).toEqual('cheese')
    expect(pruneEmpty(1)).toEqual(1)
    expect(pruneEmpty(true)).toEqual(true)
  })
  test('empty', () => {
    expect(pruneEmpty({})).toEqual({})
    expect(pruneEmpty([])).toEqual([])
  })
  test('basic', () => {
    expect(pruneEmpty({ a: 1, b: 2, c: null })).toEqual({ a: 1, b: 2 })
    expect(pruneEmpty([1, 2, null, undefined, 3])).toEqual([1, 2, 3])
    expect(
      pruneEmpty([
        1,
        2,
        null,
        { a: 1, b: [1, 2, null, 3, { a: undefined }] },
        3,
      ]),
    ).toEqual([1, 2, { a: 1, b: [1, 2, 3] }, 3])
  })
})
