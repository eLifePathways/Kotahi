/* eslint-disable react-hooks/exhaustive-deps */

import { useCallback, useEffect, useState } from 'react'
import { isArray, isObject, mergeWith } from 'lodash'
import { isNonNullObject, safeCall } from '../shared/generalUtils'

/**
 * @typedef {Object} UseBoolReturn
 * @property {boolean} state - The current boolean state.
 * @property {Function} set - Function to set the boolean state directly.
 * @property {Function} on - Function to set the state to true.
 * @property {Function} off - Function to set the state to false.
 * @property {Function} toggle - Function to toggle the state.
 */

/**
 * Custom hook to manage a boolean state.
 *
 * @param {Object} [options={}] - Options for callbacks.
 * @param {boolean} [options.start] - initial state.
 * @param {Function} [options.onTrue] - Callback when state becomes true.
 * @param {Function} [options.onFalse] - Callback when state becomes false.
 * @param {Function} [options.onToggle] - Callback when state toggles.
 * @returns {UseBoolReturn} - State and actions to manipulate the boolean state.
 */
export const useBool = (options = {}) => {
  const { onTrue, onFalse, onToggle, start } = options
  const [boolean, setBoolean] = useState(Boolean(start))

  const actions = {
    set: state => setBoolean(Boolean(state)),
    on: () => !boolean && setBoolean(true),
    off: () => !!boolean && setBoolean(false),
    toggle: () => setBoolean(!boolean),
    reset: () => setBoolean(Boolean(start)),
  }

  useEffect(() => {
    if (!onTrue && !onFalse && !onToggle) return
    if (boolean) {
      safeCall(onTrue)()
    } else {
      safeCall(onFalse)()
    }
    safeCall(onToggle)(boolean)
  }, [boolean])

  return { state: boolean, ...actions }
}

const customMerge = (objValue, srcValue) => {
  return Array.isArray(objValue) ? srcValue : undefined
}
/**
 * @typedef {Object} UseObjectReturn
 * @property {Object} state - The current object state.
 * @property {Function} set - Function to set the state directly.
 * @property {Function} update - Function to merge the current state object with the provided values.
 * @property {Function} reset - Function to reset the state to the initial state.
 * @property {Function} clear - Function to clear the state.
 */

/**
 * Custom hook to manage object state.
 *
 * @param {Object} [startState={}] - initial state.
 * @param {Object} [options={}] - Options for callbacks.
 * @param {Object} [options.start] - initial state.
 * @param {Function} [options.onFieldUpdate] - Callback when a field is updated.
 * @param {Function} [options.onUpdate] - Callback when the object is updated.
 * @param {Function} [options.onClear] - Callback when the object is cleared.
 * @returns {UseObjectReturn} - State and actions to manipulate the object state.
 */
export const useObject = (options = {}) => {
  const { onFieldUpdate, onUpdate, onClear, start = {} } = options
  const [object, setObject] = useState(start)

  const set = useCallback(
    state => {
      const prev = object
      if (isObject(state) && !isArray(state)) setObject(state)
      safeCall(onUpdate)(state, prev)
    },
    [onUpdate],
  )

  const update = useCallback(
    updates => {
      if (!isNonNullObject(updates)) return

      setObject(prev => {
        const newValue = mergeWith({}, prev, updates, customMerge)
        safeCall(onFieldUpdate)(updates)
        safeCall(onUpdate)(newValue, prev)
        return newValue
      })
    },
    [onFieldUpdate, onUpdate],
  )

  const reset = useCallback(() => {
    setObject(start)
    safeCall(onUpdate)(start)
  }, [start, onUpdate])

  const clear = useCallback(() => {
    setObject({})
    safeCall(onClear)({})
  }, [onClear])

  return { state: object, set, update, reset, clear }
}

/**
 * @typedef {Object} useStringReturn
 * @property {string} state - The current string state.
 * @property {string[]} values - Array of valid strings.
 * @property {Function} set - Function to set the state directly.
 * @property {Function} is - Function to check if the state matches a given value.
 * @property {Function} update - Function to update the state with a new value.
 * @property {Function} reset - Function to reset the state to the initial state.
 * @property {Function} clear - Function to clear the state.
 */

/**
 * Custom hook to manage string state with validation.
 *
 * @param {Object} [options={}] - Options for validation and callbacks.
 * @param {string} [options.start=''] - initial state.
 * @param {string[]} [options.values=[]] - Array of valid strings.
 * @param {string} [options.fallback=''] - Fallback string if the new value is invalid.
 * @param {Function} [options.onUpdate] - Callback when the state is updated.
 * @returns {useStringReturn} - State and actions to manipulate the string state.
 */
export const useString = (options = {}) => {
  const { onUpdate, fallback = '', values = [], start = '' } = options
  const [string, setString] = useState(String(start))

  const set = useCallback(
    newValue => {
      const safeValue = String(newValue)
      const valid = !values.length || values.includes(safeValue)

      const validValue = valid
        ? safeValue
        : values[0] || fallback || start || ''

      setString(prev => {
        if (prev === validValue) return prev
        safeCall(onUpdate)(validValue)
        return validValue
      })
    },
    [values, fallback, onUpdate],
  )

  const reset = useCallback(() => {
    const validValue = values.includes(start) ? start : fallback
    setString(validValue)
    safeCall(onUpdate)(validValue)
  }, [start, values, fallback, onUpdate])

  const clear = useCallback(() => {
    setString('')
    safeCall(onUpdate)('')
  }, [onUpdate])

  const is = useCallback(
    (value, returnValue) => {
      const valueMatch = isArray(value)
        ? value.find(v => string === v)
        : string === value

      if (returnValue) {
        return isArray(value) ? valueMatch : (valueMatch && value) || ''
      }

      return Boolean(valueMatch)
    },
    [string],
  )

  return { state: string, values, set, is, reset, clear }
}

/**
 * @typedef {Object} UseNumberReturn
 * @property {number} state - The current number state.
 * @property {Function} set - Function to safely set the state.
 * @property {Function} add - Function to add the state by a given value.
 * @property {Function} sub - Function to decrement the state by a given value.
 * @property {Function} reset - Function to reset the state to the initial state.
 * @property {Function} clear - Function to clear the state to 'zero'.
 */

/**
 * Custom hook to manage number state with validation.
 *
 * @param {Object} [options={}] - Options for validation and callbacks.
 * @param {number} [options.start=0] - initial state.
 * @param {number} [options.zero=0] - The base zero value.
 * @param {number} [options.end] - The maximum value allowed.
 * @param {Function} [options.onUpdate] - Callback when the state is updated.
 * @param {Function} [options.onIncrease] - Callback when the state is added.
 * @param {Function} [options.onDecrease] - Callback when the state is decremented.
 * @param {number} [options.addStep] - The add step default value.
 * @param {number} [options.decrementStep] - The decrement step default value.
 * @param {number} [options.step=1] - The default global step value.
 * @param {boolean} [options.positiveOnly=false] - Enforce only positive numbers starting from 0.
 * @param {string} [options.applyMath] - Math method to apply ('round', 'floor', 'ceil').
 * @returns {UseNumberReturn} - State and actions to manipulate the number state.
 */
export const useNumber = (options = {}) => {
  const {
    onUpdate,
    onIncrease,
    onDecrease,
    positiveOnly,
    addStep,
    decrementStep,
    applyMath = '',
    zero = 0,
    step = 1,
    end = null,
    start,
  } = options

  const [number, setNumber] = useState(start ?? zero)
  useEffect(() => {
    safeCall(onUpdate)(number)
  }, [number])

  const withMath = (value, mathMethod) => {
    const method = !mathMethod ? applyMath : mathMethod

    if (method && Math[method]) {
      const valueWithMath = Math[method](value)
      return positiveOnly && valueWithMath < zero ? zero : valueWithMath
    }

    return positiveOnly && value < zero ? zero : value
  }

  const set = useCallback(
    (newValue, math) => {
      if (!Number(newValue)) return

      const validValue = withMath(Number(newValue), math)

      setNumber(prev => {
        const finalValue =
          Number.isFinite(end) && validValue > end ? end : validValue

        if (prev === finalValue) return prev
        safeCall(onUpdate)(finalValue)
        return finalValue
      })
    },
    [zero, onUpdate, positiveOnly, end],
  )

  const add = useCallback(
    (val, math = '') => {
      const value = Number(val) || addStep || step

      setNumber(prev => {
        const validValue = withMath(prev + Number(value), math)

        const finalValue =
          Number.isFinite(end) && validValue > end ? end : validValue

        safeCall(onIncrease)(finalValue)
        return positiveOnly && finalValue < zero ? zero : finalValue
      })
    },
    [zero, onUpdate, onIncrease, positiveOnly, end],
  )

  const sub = useCallback(
    (val, math = '') => {
      const value = Number(val) || decrementStep || step
      setNumber(prev => {
        const validValue = withMath(prev - Number(value), math)

        const finalValue =
          Number.isFinite(end) && validValue > end ? end : validValue

        safeCall(onDecrease)(finalValue)
        return finalValue
      })
    },
    [zero, onUpdate, onDecrease, positiveOnly, end],
  )

  const reset = useCallback(() => {
    const validValue = withMath(start)
    setNumber(validValue)
  }, [start, zero, onUpdate, positiveOnly])

  const clear = useCallback(() => {
    setNumber(zero)
  }, [zero, onUpdate])

  return {
    state: number,
    zero,
    step,
    positive: positiveOnly,
    set,
    reset,
    clear,
    add,
    sub,
  }
}

/**
 * @typedef {Object} UseArrayReturn
 * @property {Array} state - The current array state.
 * @property {Function} set - Function to set the state directly.
 * @property {Function} add - Function to add an item to the array.
 * @property {Function} remove - Function to remove an item from the array by index.
 * @property {Function} update - Function to update an item in the array by index.
 * @property {Function} reset - Function to reset the array to the initial state.
 * @property {Function} clear - Function to clear the array.
 */

/**
 * Custom hook to manage array state.
 *
 * @param {Array} [startState=[]] - initial state.
 * @param {Object} [options={}] - Options for callbacks.
 * @param {Function} [options.onAdd] - Callback when an item is added.
 * @param {Function} [options.onRemove] - Callback when an item is removed.
 * @param {Function} [options.onUpdate] - Callback when an item is updated.
 * @param {Function} [options.onClear] - Callback when the array is cleared.
 * @returns {UseArrayReturn} - State and actions to manipulate the array state.
 */
export const useArray = (startState = [], options = {}) => {
  const [array, setArray] = useState(startState)
  const { onAdd, onRemove, onUpdate, onClear } = options

  const set = useCallback(
    state => {
      if (Array.isArray(state)) setArray(state)
    },
    [array, onUpdate],
  )

  const add = useCallback(
    (item, index = 0) => {
      setArray(prev => {
        const safeIndex = Number(index) || 0

        const newArray =
          safeIndex === -1
            ? [...prev, item]
            : [...prev.slice(0, safeIndex), item, ...prev.slice(safeIndex)]

        safeCall(onAdd)(item)
        safeCall(onUpdate)(newArray, prev)
        return newArray
      })
    },
    [onAdd],
  )

  const remove = useCallback(
    index => {
      setArray(prev => {
        const newArray = prev.filter((_, i) => i !== index)
        safeCall(onRemove)(index)
        safeCall(onUpdate)(newArray, prev)
        return newArray
      })
    },
    [onRemove],
  )

  const update = useCallback(
    (index, newItem) => {
      setArray(prev => {
        const newArray = prev.map((item, i) => (i === index ? newItem : item))
        safeCall(onUpdate)(index, newItem)
        return newArray
      })
    },
    [onUpdate],
  )

  const reset = useCallback(() => {
    setArray(startState)
  }, [startState])

  const clear = useCallback(() => {
    setArray([])
    safeCall(onClear)()
  }, [onClear])

  return { state: array, set, add, remove, update, reset, clear }
}
