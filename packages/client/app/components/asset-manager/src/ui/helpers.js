/* eslint-disable new-cap */

import moment from 'moment-timezone'

const suffixes = ['B', 'kB', 'MB', 'GB', 'TB']

const fileSizeFormatter = bytes => {
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / 1024 ** i).toFixed(2)} ${suffixes[i]}`
}

const dateTimeFormatter = dateTime =>
  moment
    .tz(dateTime, Intl.DateTimeFormat().resolvedOptions().timeZone)
    .format('LLL')

export { fileSizeFormatter, dateTimeFormatter }
