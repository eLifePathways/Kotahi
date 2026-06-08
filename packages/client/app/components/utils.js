const transformTeamsToLegacy = input => {
  const res = {}

  Object.keys(input).forEach(group => {
    Object.keys(input[group]).forEach(t => {
      const item = input[group][t]
      res[item.role] = {
        name: item.displayName,
      }
    })
  })

  return res
}

export { transformTeamsToLegacy }
