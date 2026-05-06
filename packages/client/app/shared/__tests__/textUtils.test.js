/* eslint-disable */

import { convertCamelCaseToTitleCase } from '../textUtils'

describe('convert camel case', () => {
  test('nil', () => {
    expect(() => convertCamelCaseToTitleCase(undefined)).toThrow()
    expect(() => convertCamelCaseToTitleCase(null)).toThrow()
  })
  test('empty', () => {
    expect(convertCamelCaseToTitleCase('')).toEqual('')
  })
  test('basic', () => {
    expect(convertCamelCaseToTitleCase('asdf')).toEqual('Asdf')
    expect(convertCamelCaseToTitleCase('Asdf')).toEqual('Asdf')
    expect(convertCamelCaseToTitleCase('asdfQwer')).toEqual('Asdf Qwer')
    expect(convertCamelCaseToTitleCase('AsdfQwer')).toEqual('Asdf Qwer')
  })
})
