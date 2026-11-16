/* eslint-disable new-cap */

import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'

dayjs.extend(localizedFormat)

const suffixes = ['B', 'kB', 'MB', 'GB', 'TB']

const fileSizeFormatter = bytes => {
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / 1024 ** i).toFixed(2)} ${suffixes[i]}`
}

const dateTimeFormatter = dateTime => dayjs(dateTime).format('LLL')

export { fileSizeFormatter, dateTimeFormatter }
