const { cloneDeep, mergeWith, isArray } = require('lodash')

const replaceArrays = (destination, source) => {
  if (isArray(destination)) return source
  return undefined
}

/** Returns a deep-merge of baseObj and objToMerge.
 * If a field with the same path exists in both baseObj and objToMerge, the resulting value will come from objToMerge.
 * Two arrays at the same path are not merged, but replaced with the array from objToMerge. */
const deepMergeObjectsReplacingArrays = (baseObj, objToMerge) => {
  const result = cloneDeep(baseObj)
  mergeWith(result, objToMerge, replaceArrays)
  return result
}

/** Parses if value is a string, otherwise returns value unaltered. */
const ensureJsonIsParsed = value =>
  typeof value === 'string' ? JSON.parse(value) : value

/**
 * Conditionally returns an object based on a given condition.
 * Useful for spreading conditionally fields to an object or create new ones.
 *
 * @param {boolean} condition - The condition to evaluate.
 * @param {Object} fields - The object to return if the condition is true.
 * @param {Object} [fallback={}] - The object to return if the condition is false defaults to {}.
 * @returns {Object} - The resulting object based on the condition.
 *
 * @example
 * const baseObject = { a: 1, b: 2 };
 * const additionalFields = { c: 3, d: 4 };
 * const moreFields = { e: 5, f: 6 };
 *
 * const result = {
 *   ...baseObject,
 *   ...objIf(true, additionalFields)
 *   ...objIf(false, moreFields)
 * };
 * // result: { a: 1, b: 2, c: 3, d: 4 }
 *
 */
const objIf = (condition, fields, fallback = {}) =>
  condition ? fields : fallback

const safeParse = (str, fallback = {}) => {
  const tryParse = s => {
    try {
      return JSON.parse(s)
      /* eslint-disable-next-line */
    } catch (e) {
      return null
    }
  }

  return tryParse(str) ?? fallback
}

/**
 * Transforms the entries of an object using a mapping function.
 * The mapping function can return an object with multiple key-value pairs.
 *
 * @param {Object} obj - The object to transform.
 * @param {Function} mapFn - The mapping function that takes a key and value, and returns an object with new key-value pairs.
 * @returns {Object} - The transformed object.
 *
 * @example
 * const obj = { name: 'John', age: 30 };
 * const result = transformEntries(obj, (key, value) => {
 *   const newKey = `new_${key}`;
 *   const newValue = typeof value === 'number' ? value * 2 : value;
 *   return { [newKey]: newValue, [`original_${key}`]: value };
 * });
 * console.log(result);
 * // Output: { new_name: 'John', original_name: 'John', new_age: 60, original_age: 30 }
 */
const transformEntries = (obj, mapFn) => {
  return Object.fromEntries(
    Object.entries(obj).flatMap(([key, value]) => {
      const mappedEntries = mapFn(key, value)
      return Object.entries(mappedEntries)
    }),
  )
}

module.exports = {
  deepMergeObjectsReplacingArrays,
  ensureJsonIsParsed,
  objIf,
  safeParse,
  transformEntries,
}
