const transposeUtcToTimezone = (date, timezoneOffsetMinutes) => {
  const utc = new Date(date)
  const local = utc.getTime() - timezoneOffsetMinutes * 60000
  return new Date(local)
}

const transposeTimezoneToUtc = (date, timezoneOffsetMinutes) => {
  const local = new Date(date)
  const utc = local.getTime() + timezoneOffsetMinutes * 60000
  return new Date(utc)
}

/** Format date as yyyy-MM-dd (using timezone if supplied, otherwise UTC) */
const dateToIso8601 = (date, timezoneOffsetMinutes) => {
  return (
    timezoneOffsetMinutes
      ? transposeUtcToTimezone(date, timezoneOffsetMinutes)
      : new Date(date)
  )
    .toISOString()
    .slice(0, 10)
}

/** Get the most recent UTC 00:00:00.000 for a given date-time */
const getStartOfDay = (date, timezoneOffsetMinutes) => {
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
const getEndOfDay = (date, timezoneOffsetMinutes) => {
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

/** Convert yyyyMMdd string into a date (midnight at start of day), using timezone if supplied, otherwise UTC */
const compactStringToDate = (compactString, timezoneOffsetMinutes) => {
  const isoString = `${compactString.substring(0, 4)}-${compactString.substring(
    4,
    6,
  )}-${compactString.substring(6, 8)}T00:00:00.000Z`

  const date = new Date(isoString)
  if (timezoneOffsetMinutes)
    return transposeTimezoneToUtc(date, timezoneOffsetMinutes)
  return date
}

module.exports = {
  dateToIso8601,
  getStartOfDay,
  getEndOfDay,
  compactStringToDate,
}
