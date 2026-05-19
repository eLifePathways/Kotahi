import { get, isFunction, isPlainObject } from 'lodash'

// #region OBJECT ------------------------------------------------------------------
const { entries, keys, values, fromEntries } = Object

/**
 * Checks if a value is a plain object and not null(i.e., {}).
 *
 * @param {*} value - The value to check.
 * @returns {boolean} - Returns true if the value is a plain object and not empty, otherwise false.
 */
export const isNonNullObject = value => {
  return isPlainObject(value) && value !== null
}

/**
 * Iterates over the entries of an object and applies a callback function to each entry.
 *
 * @param {Object} obj - The object to iterate over.
 * @param {Function} cb - The callback function to apply to each entry.
 */
export const onEntries = (obj, cb) => entries(obj).forEach(([k, v]) => cb(k, v))

/**
 * Maps the entries of an object using a callback function.
 *
 * @param {Object} obj - The object to map.
 * @param {Function} cb - The callback function to apply to each entry.
 * @returns {Array} - An array of mapped entries.
 */
export const mapEntries = (obj, cb) => entries(obj).map(([k, v]) => cb(k, v))

/**
 * Filters the entries of an object using a callback function.
 *
 * @param {Object} obj - The object to filter.
 * @param {Function} cb - The callback function to apply to each entry.
 * @returns {Array} - An array of filtered entries.
 */
export const filterEntries = (obj, cb) =>
  entries(obj).filter(([k, v]) => cb(k, v))

/**
 * Iterates over the keys of an object and applies a callback function to each key.
 *
 * @param {Object} obj - The object to iterate over.
 * @param {Function} cb - The callback function to apply to each key.
 */
export const onKeys = (obj, cb) => keys(obj).forEach(cb)

/**
 * Maps the keys of an object using a callback function.
 *
 * @param {Object} obj - The object to map.
 * @param {Function} cb - The callback function to apply to each key.
 * @returns {Array} - An array of mapped keys.
 */
export const mapKeys = (obj, cb) => keys(obj).map(cb)

/**
 * Filters the keys of an object using a callback function.
 *
 * @param {Object} obj - The object to filter.
 * @param {Function} cb - The callback function to apply to each key.
 * @returns {Array} - An array of filtered keys.
 */
export const filterKeys = (obj, cb) => keys(obj).filter(cb)

/**
 * Iterates over the values of an object and applies a callback function to each value.
 *
 * @param {Object} obj - The object to iterate over.
 * @param {Function} cb - The callback function to apply to each value.
 */
export const onValues = (obj, cb) => values(obj).forEach(cb)

/**
 * Maps the values of an object using a callback function.
 *
 * @param {Object} obj - The object to map.
 * @param {Function} cb - The callback function to apply to each value.
 * @returns {Array} - An array of mapped values.
 */
export const mapValues = (obj, cb) => values(obj).map(cb)

/**
 * Filters the values of an object using a callback function.
 *
 * @param {Object} obj - The object to filter.
 * @param {Function} cb - The callback function to apply to each value.
 * @returns {Array} - An array of filtered values.
 */
export const filterValues = (obj, cb) => values(obj).filter(cb)

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
export const transformEntries = (obj, mapFn) => {
  return fromEntries(
    mapEntries(obj, entry => {
      const mappedEntries = mapFn(entry)
      return entries(mappedEntries)
    }).flat(),
  )
}

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
export const objIf = (condition, fields, fallback = {}) =>
  condition ? fields : fallback

/**
 * Safely parses a JSON string and returns the parsed object, or a fallback value if parsing fails.
 *
 * @param {string} str - The JSON string to parse.
 * @param {*} [fallback={}] - The fallback value to return if parsing fails. Defaults to an empty object.
 * @returns {*} - The parsed object if parsing is successful, otherwise the fallback value.
 * @example
 * const jsonString = '{"name": "Alice", "age": 25}';
 * const result = safeParse(jsonString);
 * console.log(result); // Output: { name: 'Alice', age: 25 }
 *
 * const invalidJsonString = '{name: Alice, age: 25}';
 * const resultWithFallback = safeParse(invalidJsonString, { error: 'Invalid JSON' });
 * console.log(resultWithFallback); // Output: { error: 'Invalid JSON' }
 */
export const safeParse = (str, fallback = {}) => {
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

// #endregion OBJECT ---------------------------------------------------------------

// #region ARRAY -------------------------------------------------------------------
/**
 * Conditionally returns an array with the item(s) added, or the fallback array.
 * Useful for spreading conditionally items to an array.
 *
 * @param {boolean} condition - The condition to evaluate.
 * @param {*} item - The item to add to the array if the condition is true. If the item is an array, its values will be spread into the array.
 * @param {Array} [fallback=[]] - (Optional) the array to return if the condition is false. Defaults to an empty array.
 * @returns {Array} The array with the item(s) conditionally added, or the fallback array.
 *
 * @example
 * const finalNumbers = [
 *   ...arrIf(true, 1),
 *   ...arrIf(true, 2),
 *   ...arrIf(false, 3),
 *   ...arrIf(true, 4)
 * ]
 * console.log(finalNumbers) // Output: [1, 2, 4]
 * @example
 * const arr = [5, 6, 7]
 * const result = arrIf(true, 8, arr)
 * console.log(result) // Output: [5, 6, 7, 8]
 */
export const arrIf = (condition, item, fallback = []) => {
  if (condition) {
    return Array.isArray(item) ? item : [item]
  }

  return fallback
}

/**
 * Finds an element in an array of objects by a given property and value, and returns the element and its index.
 * Supports nested properties in the criteria.
 *
 * @param {Object} criteria - An object containing the property and value to search for. E.g., { 'address.city': 'New York' }.
 * @param {Array} arr - The array of objects to search.
 * @returns {[Object, number]} An array containing the found element and its index. If not found, returns [undefined, -1].
 *
 * @example
 * const users = [
 *   { id: 1, name: 'Alice', address: { city: 'Los Angeles' } },
 *   { id: 2, name: 'Bob', address: { city: 'New York' } },
 *   { id: 3, name: 'Charlie', address: { city: 'Chicago' } }
 * ];
 *
 * const [user, index] = getBy({ 'address.city': 'New York' }, users);
 * console.log(user); // Output: { id: 2, name: 'Bob', address: { city: 'New York' } }
 * console.log(index); // Output: 1
 */
export const getBy = (criteria, arr) => {
  const [property, value] = entries(criteria)[0]
  const match = elm => get(elm, property) === value
  const index = arr?.findIndex(match)
  const element = arr?.find(match)

  return [element, index]
}

// #endregion ARRAY ----------------------------------------------------------------

// #region STRING ------------------------------------------------------------------

/**
 * Capitalizes the first character of each word in a string.
 */
export const capitalizeWords = str =>
  str.replace(/\b\w/g, char => char.toUpperCase())

/**
 * Converts a camelCase string to a capitalized string.
 * @param {string} camelCaseStr - The camelCase string to convert.
 * @returns {string} - The capitalized string.
 */
export const camelCaseToCapital = camelCaseStr => {
  if (!camelCaseStr) return ''
  const words = camelCaseStr.replace(/([A-Z])/g, ' $1').split(' ')

  const capitalizedWords = words.map(
    word => word.charAt(0).toUpperCase() + word.slice(1),
  )

  return capitalizedWords.join(' ')
}

// #endregion STRING ---------------------------------------------------------------

// #region FUNCTION ----------------------------------------------------------------

/**
 * Safely calls the provided callback if it's a function, otherwise returns the fallback function.
 *
 * @param {function} cb - The callback to call if it's a function.
 * @param {function} fb - The fallback function to return if the callback is not a function.
 * @returns {function} - Returns the callback if it's a function, otherwise returns the fallback function.
 */
export const safeCall = (cb, fb) =>
  // eslint-disable-next-line no-nested-ternary
  isFunction(cb) ? cb : isFunction(fb) ? fb : () => {}

/**
 * Returns the function specified by the key in the options object if it's a function, otherwise returns the fallback function.
 *
 * This will work as a switch statement.
 *
 * @param {string} key - A string to check if matches a key from the options object.
 * @param {{}} options - The options object containing (or not) the function to return.
 * @param {Array} params - An array of params to spread to each function.
 * @returns {function} - Returns the function specified by the key if it's a function, otherwise returns the fallback function.
 * @example
 *  const data = 3 // define the data as a number
 *
 *  callOn(typeof data, {
 *    number: (n) => data + n,
 *    string: (n) => console.log(`${n} is a string!`)
 *    default: () => console.log(`no key matching to handle ${n}`)
 *  }, [5])
 *
 * // returns 8
 *
 *  const data = '3' // define the data as a string
 *
 *  callOn(typeof data, {
 *    number: (n) => data + n,
 *    string: (n) => console.log(`${n} is a string!`)
 *    default: (n) => console.log(`no key matching to handle ${n}`)
 *  }, [5])
 *
 * // show in console: `3 is a string!`
 *
 *  const data = [] // define the data as anything else
 *
 *  callOn(typeof data, {
 *    number: (n) => data + n,
 *    string: (n) => console.log(`${n} is a string!`)
 *    default: (n) => console.log(`no key matching to handle ${n}`)
 *  },[5])
 *
 * // show in console: `no key matching to handle 5`
 */

export const callOn = (key, options, params = []) =>
  safeCall(options[key], options.default || (() => null))(...params)
// #endregion FUNCTION -------------------------------------------------------------

/**
 * Returns the value specified by the key in the options object if it exists, otherwise returns the default value.
 *
 * @param {string} key - A string to check if matches a key from the options object.
 * @param {{}} options - The options object containing (or not) the value to return.
 * @param {*} defaultValue - The default value to return if the key does not exist in the options object.
 * @returns {*} - Returns the value specified by the key if it exists, otherwise returns the default value.
 * @note If your intention is to return a function on all or some of the values, consider using `callOn` instead (as you can add params).
 * @see {@link callOn}
 * @example
 * const dataType = 'number';
 * const result = switchOn(dataType, {
 *   number: 42,
 *   string: 'Hello, world!',
 *   default: 'Unknown type'
 * });
 * console.log(result); // Output: 42
 *
 * const dataType2 = 'boolean';
 * const result2 = switchOn(dataType2, {
 *   number: 42,
 *   string: 'Hello, world!',
 *   default: 'Unknown type'
 * });
 * console.log(result2); // Output: 'Unknown type'
 *
 */
export const switchOn = (key, options, defaultValue = null) => {
  return options[key] ?? options?.default ?? defaultValue
}
