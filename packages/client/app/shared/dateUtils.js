import i18next from 'i18next'
import moment from 'moment-timezone'
import { getLanguages } from '../i18n'

const tzOffset = new Date().getTimezoneOffset()

/** Turn e.g. midday in the supplied timezone into midday in local timezone */
export const transposeFromTimezoneToLocal = (date, timezone) => {
  const timestamp = new Date(date).getTime()
  const localOffsetMinutes = new Date().getTimezoneOffset()
  const tzOffsetMinutes = moment.tz.zone(timezone).utcOffset(timestamp)
  const totalOffsetMilliseconds = (localOffsetMinutes - tzOffsetMinutes) * 60000
  return new Date(timestamp + totalOffsetMilliseconds)
}

/** Turn e.g. midday in local timezone into midday in the supplied timezone */
export const transposeFromLocalToTimezone = (date, timezone) => {
  const timestamp = new Date(date).getTime()
  const localOffsetMinutes = new Date().getTimezoneOffset()
  const tzOffsetMinutes = moment.tz.zone(timezone).utcOffset(timestamp)
  const totalOffsetMilliseconds = (localOffsetMinutes - tzOffsetMinutes) * 60000
  return new Date(timestamp - totalOffsetMilliseconds)
}

/** Format date as yyyy-MM-dd (using timezone if supplied, otherwise UTC) */

/** Format date as yyyyMMdd (using timezone if supplied, otherwise UTC) */

/** Convert yyyyMMdd string into a date (midnight at start of day), using timezone if supplied, otherwise UTC */

/** Add the local timezone offset to mimic a UTC datetime.
 *  E.g. if local time is NZST,
 *  transposeUtcToLocal('2020-01-02 10:00 GMT+1200') = 2020-01-01 22:00 GMT+1200
 *  (since 2 Jan 10:00 NZST = 1 Jan 22:00 UTC) */
export const transposeUtcToLocal = date =>
  transposeUtcToTimezone(date, tzOffset)

const transposeUtcToTimezone = (date, timezoneOffsetMinutes) => {
  const utc = new Date(date)
  const local = utc.getTime() - timezoneOffsetMinutes * 60000
  return new Date(local)
}

/** Subtract the local timezone offset to convert a mimicked UTC datetime back to normal.
 *  E.g. if local time is NZST,
 *  transposeLocalToUtc('2020-01-01 22:00 GMT+1200') = 2020-01-02 10:00 GMT+1200
 *  (since 1 Jan 22:00 UTC = 2 Jan 10:00 NZST) */
export const transposeLocalToUtc = date =>
  transposeTimezoneToUtc(date, tzOffset)

const transposeTimezoneToUtc = (date, timezoneOffsetMinutes) => {
  const local = new Date(date)
  const utc = local.getTime() + timezoneOffsetMinutes * 60000
  return new Date(utc)
}

/** Get the most recent UTC 00:00:00.000 for a given date-time */
export const getStartOfDay = (date, timezoneOffsetMinutes) => {
  const dayStartUtc = new Date(
    timezoneOffsetMinutes
      ? transposeUtcToTimezone(date, timezoneOffsetMinutes)
      : date,
  )

  dayStartUtc.setUTCHours(0)
  dayStartUtc.setUTCMinutes(0)
  dayStartUtc.setUTCSeconds(0)
  dayStartUtc.setUTCMilliseconds(0)
  return timezoneOffsetMinutes
    ? transposeTimezoneToUtc(dayStartUtc, timezoneOffsetMinutes)
    : dayStartUtc
}

/** Get the next UTC 23:59:59.999 for a given date-time */
export const getEndOfDay = (date, timezoneOffsetMinutes) => {
  const dayEndUtc = new Date(
    timezoneOffsetMinutes
      ? transposeUtcToTimezone(date, timezoneOffsetMinutes)
      : date,
  )

  dayEndUtc.setUTCHours(23)
  dayEndUtc.setUTCMinutes(59)
  dayEndUtc.setUTCSeconds(59)
  dayEndUtc.setUTCMilliseconds(999)
  return timezoneOffsetMinutes
    ? transposeTimezoneToUtc(dayEndUtc, timezoneOffsetMinutes)
    : dayEndUtc
}

const pad = num => (num < 10 ? `0${num}` : num.toString())

export const monthAbbrevs = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

export const convertTimestampToDateString = timestamp => {
  const curLang = getLanguages().find(elem => elem.value === i18next.language)
  const date = new Date(timestamp)
  const day = date.getDate()
  let month = monthAbbrevs[date.getMonth()]
  const year = date.getFullYear()
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const ampm = hours < 12 ? 'am' : 'pm'
  const cleanHours = ((hours + 11) % 12) + 1
  if (curLang?.monthAbbrevs) month = curLang.monthAbbrevs[date.getMonth()]

  if (curLang?.funcs?.convertTimestampToDateString) {
    return curLang.funcs.convertTimestampToDateString(date, month, pad)
  }

  return `${month} ${pad(day)}, ${year} ${cleanHours}:${pad(minutes)}${ampm}`
}

export const convertTimestampToDateWithoutTimeString = timestamp => {
  const curLang = getLanguages().find(elem => elem.value === i18next.language)
  const date = new Date(timestamp)
  const day = date.getDate()
  let month = monthAbbrevs[date.getMonth()]
  const year = date.getFullYear()
  if (curLang?.monthAbbrevs) month = curLang.monthAbbrevs[date.getMonth()]

  if (curLang?.funcs?.convertTimestampToDateWithoutTimeString) {
    return curLang.funcs.convertTimestampToDateWithoutTimeString(date, month)
  }

  return `${month} ${pad(day)}, ${year}`
}

export const convertTimestampToDateWithTimeString = timestamp => {
  const date = new Date(timestamp)
  const day = date.getDate()
  const month = monthAbbrevs[date.getMonth()]
  const year = date.getFullYear()
  const hours = date.getHours()
  const minutes = date.getMinutes()

  return `${month} ${pad(day)}, ${year} ${pad(hours)}:${pad(minutes)}`
}

export const convertTimestampToTimeString = timestamp => {
  const date = new Date(timestamp)
  const hours = date.getHours()
  const minutes = date.getMinutes()

  return `${pad(hours)}:${pad(minutes)}`
}

export const convertTimestampToRelativeDateString = timestamp => {
  const updatedTime = new Date(timestamp)
  const currTime = new Date()
  const diff = Math.round((currTime - updatedTime) / (1000 * 3600 * 24))

  if (diff === 0) {
    return i18next.t('common.relativeDateStrings.today')
  }

  if (diff === 1) {
    return i18next.t('common.relativeDateStrings.yesterday')
  }

  if (diff <= 7) {
    return i18next.t('common.relativeDateStrings.daysAgo', {
      count: diff,
    })
  }

  return convertTimestampToDateWithoutTimeString(timestamp)
}

export const convertTimestampToDateTimeString = timestamp => {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())

  return `${year}-${month}-${day} ${hours}:${minutes}`
}
