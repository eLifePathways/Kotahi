function flattenObj(obj, parent, res = {}) {
  // TODO clean this up with nicer code

  for (const key in obj) {
    const propName = parent ? `${parent}_${key}` : key

    if (typeof obj[key] === 'object') {
      flattenObj(obj[key], propName, res)
    } else {
      res[propName] = obj[key]
    }
  }

  return res
}

module.exports = flattenObj
