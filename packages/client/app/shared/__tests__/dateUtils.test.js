/* eslint-disable */

import {
  parseDate,
  dateToIso8601,
  dateToCompactString,
  compactStringToDate,
  transposeFromLocalToTimezone,
  transposeFromTimezoneToLocal,
  transposeUtcToTimezone,
  transposeTimezoneToUtc,
  convertTimestampToDateString,
  getStartOfDay,
  getEndOfDay,
} from '../dateUtils'

describe('transposeLocalAndTimezone', () => {
  test('UTC', () => {
    const localDate = new Date('2022-01-01 12:00:00.000')
    const tzDate = new Date('2022-01-01T12:00:00.000Z')
    expect(
      transposeFromLocalToTimezone(localDate, 'Etc/UTC').toISOString(),
    ).toEqual(tzDate.toISOString())
    expect(
      transposeFromTimezoneToLocal(tzDate, 'Etc/UTC').toISOString(),
    ).toEqual(localDate.toISOString())
  })
  test('NZ', () => {
    const localDate = new Date('2022-01-01 12:00:00.000')
    const tzDate = new Date('2022-01-01 12:00:00.000 GMT+1300')
    expect(
      transposeFromLocalToTimezone(localDate, 'Pacific/Auckland').toISOString(),
    ).toEqual(tzDate.toISOString())
    expect(
      transposeFromTimezoneToLocal(tzDate, 'Pacific/Auckland').toISOString(),
    ).toEqual(localDate.toISOString())
  })
  test('Niue', () => {
    const localDate = new Date('2022-01-01 12:00:00.000')
    const tzDate = new Date('2022-01-01 12:00:00.000 GMT-1100')
    expect(
      transposeFromLocalToTimezone(localDate, 'Pacific/Niue').toISOString(),
    ).toEqual(tzDate.toISOString())
    expect(
      transposeFromTimezoneToLocal(tzDate, 'Pacific/Niue').toISOString(),
    ).toEqual(localDate.toISOString())
  })
})

describe('dateToIso8601', () => {
  test('utc', () => {
    expect(
      dateToIso8601(new Date('August 19, 1975 05:15:00 GMT+0700')),
    ).toEqual('1975-08-18')
    expect(dateToIso8601(new Date('January 5, 2020 23:00 GMT-0300'))).toEqual(
      '2020-01-06',
    )
  })
  test('withTimezone', () => {
    expect(
      dateToIso8601(new Date('August 19, 1975 05:15:00 GMT+0700'), -7 * 60),
    ).toEqual('1975-08-19')
    expect(
      dateToIso8601(new Date('January 5, 2020 23:00 GMT-0300'), 3 * 60),
    ).toEqual('2020-01-05')
    expect(
      dateToIso8601(new Date('August 19, 1975 05:15:00 GMT-0700'), 7 * 60),
    ).toEqual('1975-08-19')
    expect(
      dateToIso8601(new Date('January 5, 2020 23:00 GMT+0300'), -3 * 60),
    ).toEqual('2020-01-05')
  })
})

describe('dateToCompactString', () => {
  test('utc', () => {
    expect(
      dateToCompactString(new Date('August 19, 1975 05:15:00 GMT+0700')),
    ).toEqual('19750818')
    expect(
      dateToCompactString(new Date('January 5, 2020 23:00 GMT-0300')),
    ).toEqual('20200106')
  })
  test('withTimezone', () => {
    expect(
      dateToCompactString(
        new Date('August 19, 1975 05:15:00 GMT+0700'),
        -7 * 60,
      ),
    ).toEqual('19750819')
    expect(
      dateToCompactString(new Date('January 5, 2020 23:00 GMT-0300'), 3 * 60),
    ).toEqual('20200105')
  })
})

describe('compactStringToDate', () => {
  test('utc', () => {
    expect(compactStringToDate('19750818').toISOString()).toEqual(
      '1975-08-18T00:00:00.000Z',
    )
  })
  test('withTimezone', () => {
    expect(compactStringToDate('20221010', -13 * 60).toISOString()).toEqual(
      '2022-10-09T11:00:00.000Z',
    )
  })
})

describe('getStartOfDay', () => {
  test('utc', () => {
    expect(getStartOfDay('January 5, 2022 22:20 GMT').toISOString()).toEqual(
      '2022-01-05T00:00:00.000Z',
    )
  })
  test('timezone', () => {
    expect(
      getStartOfDay('January 5, 2022 10:20 GMT+12', -12 * 60).toISOString(),
    ).toEqual('2022-01-04T12:00:00.000Z')
  })
})

describe('getEndOfDay', () => {
  test('utc', () => {
    expect(getEndOfDay('January 5, 2022 22:20 GMT').toISOString()).toEqual(
      '2022-01-05T23:59:59.999Z',
    )
  })
  test('timezone', () => {
    expect(
      getEndOfDay('January 5, 2022 10:20 GMT+12', -12 * 60).toISOString(),
    ).toEqual('2022-01-05T11:59:59.999Z')
  })
})

describe('parseDate', () => {
  test('yyyy-mm-dd', () => {
    expect(parseDate('2021-09-08')).toEqual([2021, 9, 8])
  })
  test('yyyy-m-d', () => {
    expect(parseDate('2021-9-8')).toEqual([2021, 9, 8])
  })
  test('mm-dd-yyyy', () => {
    expect(parseDate('09/08/2021')).toEqual([2021, 9, 8])
  })
  test('UK format regarded as invalid', () => {
    expect(() => parseDate('13/08/2021')).toThrow()
  })
  test('trim', () => {
    expect(parseDate('  2021-09-08  ')).toEqual([2021, 9, 8])
  })
  test('invalid1', () => {
    expect(() => parseDate('13/13/2021')).toThrow()
  })
  test('invalid2', () => {
    expect(() => parseDate('1b/13/2021')).toThrow()
  })
  test('invalid3', () => {
    expect(() => parseDate('20/12/12')).toThrow()
  })
})

describe('transposeUtcToTimezone', () => {
  test('transpose', () => {
    expect(
      transposeUtcToTimezone(
        new Date('2022-10-07T23:00:00.000Z'),
        0,
      ).toISOString(),
    ).toEqual('2022-10-07T23:00:00.000Z')
    expect(
      transposeUtcToTimezone(
        new Date('2022-10-07T23:00:00.000Z'),
        -720,
      ).toISOString(),
    ).toEqual('2022-10-08T11:00:00.000Z')
    expect(
      transposeUtcToTimezone(
        new Date('2022-10-08T11:00:00.000Z'),
        720,
      ).toISOString(),
    ).toEqual('2022-10-07T23:00:00.000Z')
  })
})

describe('transposeTimezoneToUtc', () => {
  test('transpose', () => {
    expect(
      transposeTimezoneToUtc(
        new Date('2022-10-07T23:00:00.000Z'),
        0,
      ).toISOString(),
    ).toEqual('2022-10-07T23:00:00.000Z')
    expect(
      transposeTimezoneToUtc(
        new Date('2022-10-07T23:00:00.000Z'),
        720,
      ).toISOString(),
    ).toEqual('2022-10-08T11:00:00.000Z')
    expect(
      transposeTimezoneToUtc(
        new Date('2022-10-08T11:00:00.000Z'),
        -720,
      ).toISOString(),
    ).toEqual('2022-10-07T23:00:00.000Z')
  })
})

describe('convertTimestampToDateString', () => {
  test('convert', () => {
    expect(
      convertTimestampToDateString(Date.parse('2020-01-01 00:00')),
    ).toEqual('Jan 01, 2020 12:00am')
    expect(
      convertTimestampToDateString(Date.parse('2020-01-01 00:01')),
    ).toEqual('Jan 01, 2020 12:01am')
    expect(
      convertTimestampToDateString(Date.parse('2020-01-01 11:59')),
    ).toEqual('Jan 01, 2020 11:59am')
    expect(
      convertTimestampToDateString(Date.parse('2020-01-01 12:00')),
    ).toEqual('Jan 01, 2020 12:00pm')
    expect(
      convertTimestampToDateString(Date.parse('2020-01-01 23:59')),
    ).toEqual('Jan 01, 2020 11:59pm')
  })
})
