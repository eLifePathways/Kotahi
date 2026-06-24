import _ from 'lodash'

const prune = current => {
  _.forOwn(current, (value, key) => {
    if (
      _.isUndefined(value) ||
      _.isNull(value) ||
      _.isNaN(value) ||
      (_.isString(value) && _.isEmpty(value)) ||
      (_.isObject(value) && _.isEmpty(prune(value)) && !_.isArray(value))
    ) {
      delete current[key]
    }
  })
  // remove any leftover undefined values from the delete
  // operation on an array
  if (_.isArray(current)) _.pull(current, undefined)

  return current
}

/**
 * Return a deep clone of the object, skipping all items that are null, undefined, '' or {}.
 */
const pruneEmpty = obj => prune(_.cloneDeep(obj)) // Do not modify the original object, create a clone instead

export default pruneEmpty
