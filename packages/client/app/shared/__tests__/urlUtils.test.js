/* eslint-disable */

import { getUriQueryParams } from '../urlUtils'

describe('getUriQueryParams', () => {
  test('none', () => {
    expect(getUriQueryParams('https://a.com/asdf')).toEqual([])
  })
  test('basic', () => {
    expect(getUriQueryParams('https://a.com/asdf?param1=abc')).toEqual([
      { field: 'param1', value: 'abc' },
    ])
    expect(
      getUriQueryParams('https://a.com/asdf?param1=abc&param2=def'),
    ).toEqual([
      { field: 'param1', value: 'abc' },
      { field: 'param2', value: 'def' },
    ])
    expect(getUriQueryParams('https://a.com/asdf?a=1&b=2&c=3&d=4')).toEqual([
      { field: 'a', value: '1' },
      { field: 'b', value: '2' },
      { field: 'c', value: '3' },
      { field: 'd', value: '4' },
    ])
  })
  test('escaping', () => {
    expect(getUriQueryParams('http://a.com/a?x.y=The%20cat%20sat')).toEqual([
      { field: 'x.y', value: 'The cat sat' },
    ])
    expect(getUriQueryParams('http://a.com/a?x.y=The+cat+sat')).toEqual([
      { field: 'x.y', value: 'The cat sat' },
    ])
  })
  test('no repeats', () => {
    expect(getUriQueryParams('http://a.com/a?a=1&b=2&c=3&a=foo&b=bar')).toEqual(
      [
        { field: 'a', value: '1' },
        { field: 'b', value: '2' },
        { field: 'c', value: '3' },
      ],
    )
  })
})
