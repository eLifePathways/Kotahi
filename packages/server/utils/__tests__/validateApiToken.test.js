/* eslint-disable */

const validateApiToken = require('../validateApiToken')

describe('validateApiToken', () => {
  test('nonePermitted', () => {
    expect(() => validateApiToken('aaa', '')).toThrow()
  })
  test('noToken', () => {
    expect(() => validateApiToken(null, 'aaa,bbb,ccc')).toThrow()
  })
  test('singleToken', () => {
    expect(() => validateApiToken('aaa', 'aaa')).not.toThrow()
  })
  test('severalTokens', () => {
    expect(() => validateApiToken('aaa', 'aaa,bbb,ccc')).not.toThrow()
  })
  test('severalTokens2', () => {
    expect(() => validateApiToken('bbb', 'aaa,bbb,ccc')).not.toThrow()
  })
  test('whitespace', () => {
    expect(() => validateApiToken('bbb', ' aaa ,  bbb  ,  ccc  ')).not.toThrow()
  })
  test('multiWordToken', () => {
    expect(() =>
      validateApiToken(
        'Ben: bbb',
        ' Alice: aaa ,  Ben: bbb  ,  Catherine: ccc  ',
      ),
    ).not.toThrow()
  })
})
