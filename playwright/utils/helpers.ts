export const hexToRgb = (hex: string): string => {
  const value = parseInt(hex.slice(1), 16)
  const r = Math.floor(value / 65536) % 256
  const g = Math.floor(value / 256) % 256
  const b = value % 256
  return `rgb(${r}, ${g}, ${b})`
}

const MONTH_ABBREVS = [
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

// Mirrors convertTimestampToDateWithoutTimeString in
// packages/client/app/shared/dateUtils.js - the fallback the 'date' column
// renders to once a manuscript is more than 7 days old.
export const formatAbsoluteDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0')
  const month = MONTH_ABBREVS[date.getMonth()]
  const year = date.getFullYear()
  return `${month} ${day}, ${year}`
}

// Mirrors formatChipDate in ManuscriptsTable.tsx (dayjs 'MMM D, YYYY') - used
// for the date filter's chip label, which doesn't zero-pad the day like
// formatAbsoluteDate does.
export const formatChipDate = (date: Date): string => {
  const day = date.getDate()
  const month = MONTH_ABBREVS[date.getMonth()]
  const year = date.getFullYear()
  return `${month} ${day}, ${year}`
}
