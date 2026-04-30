//delete after 2nd function will appear here
export const russianPluralRule = {
  numbers: [1, 2, 5],
  plurals: n => {
    let absNum = Math.abs(n)
    if (absNum % 1 !== 0) absNum = Math.floor(absNum)

    if (absNum === 1 && Math.abs(n) % 1 !== 0) return 'few'

    if (absNum % 10 === 1 && absNum % 100 !== 11) return 'one' // e.g. день
    if ([2, 3, 4].includes(absNum % 10) && ![12, 13, 14].includes(absNum % 100))
      return 'few' // e.g. дня
    return 'many' // e.g. дней
  },
}
