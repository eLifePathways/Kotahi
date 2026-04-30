import { isFunction } from 'lodash'
import { callOn, onEntries, safeCall } from '../shared/generalUtils'
import createHandlebarsState from '../components/component-email-templates/src/handlebarsAutocomplete/config'

const { defineProperty, keys } = Object

/**
 * Class representing a state manager.
 */
class GlobalState {
  #stored = {}
  #events = {}
  #config = {}

  static #instances = {}

  /**
   * Create instances of GlobalState with the provided states.
   * @param {Object} instances - An object where keys are instance names and values are functions that return the state objects.
   * The functions receive the instance as an argument. This allows the use of the instance beforehand.
   */
  static create(instances) {
    onEntries(instances, (name, states) => {
      if (!GlobalState.#instances[name]) {
        const instance = new GlobalState()
        instance.store(states)
        GlobalState.#instances[name] = instance
      }
    })
    return GlobalState
  }

  /**
   * Get an instance of GlobalState by name.
   * @param {string} name - The name of the instance.
   * @returns {GlobalState} The instance of GlobalState.
   */
  static get(name) {
    if (!GlobalState.#instances[name]) {
      console.warn(`Instance "${name}" not found. returning all instances`)
      return GlobalState.#instances
    }

    return GlobalState.#instances[name]
  }

  static get statesList() {
    return keys(GlobalState.#instances)
  }

  /**
   * Get the stored states.
   * @returns {Object} The stored states.
   */
  get stored() {
    return this.#stored
  }

  /**
   * Get the registered events.
   * @returns {Object} The registered events.
   */
  get events() {
    return this.#events
  }

  setConfig(config) {
    if (keys(this.#config).length > 0) {
      console.warn('Config already set')
      return this
    }

    const configType = typeof config

    const newConfig = callOn(configType, {
      object: () => config,
      function: () => config(this),
      default: () => false,
    })

    if (!newConfig) {
      console.warn(
        'Config must be an object or a function that returns an object',
      )
      return this
    }

    this.#config = config
    return this
  }

  /**
   * Store a new state or update an existing state.
   * @param {Object} entry - The state entry to store.
   */
  store(entry) {
    const { emitOnStateSet } = this.#config

    const states = callOn(typeof entry, {
      object: () => !Array.isArray(entry) && entry,
      function: () => entry(this),
      default: () => false,
    })

    if (states) {
      onEntries(states, (k, v) => {
        const prev = this.#stored[k]
        this.#stored[k] = v
        if (emitOnStateSet) this.emit(`${k}`, prev, v, this)
      })
    } else {
      console.warn(
        'The state entry must be an object or a function that returns an object',
      )
    }

    return this
  }

  /**
   * Safely stores the given entry in the global state.
   *
   * @param {Object|Function} entry - The entry to store. It can be an object or a function.
   *   - If it's an object, it should not be an array.
   *   - If it's a function, it will be called with the current instance (`this`) as its argument.
   *
   * @returns {GlobalState} The current instance of the GlobalState class.
   *
   * The method processes the entry based on its type:
   * - If the entry is an object, it will be used directly.
   * - If the entry is a function, it will be called with the current instance and the result will be used.
   * - If the entry is neither an object nor a function, the method will return the current instance without making any changes.
   *
   * For each key-value pair in the processed entry:
   * - The `state` property of the value will be stored in the global state.
   * - A getter and setter will be defined on the `#stored` property of the instance:
   *   - The getter will return the value from the `#stored` property, optionally processed by the `get` function.
   *   - The setter will update the value in the global state, optionally processed by the `set` function.
   *   - If the `set` function returns an object with a `safe` property set to `true`, the `state` property of the returned object will be stored in the global state.
   */
  define(entry) {
    const states = callOn(typeof entry, {
      object: () => !Array.isArray(entry) && entry,
      function: () => entry(this),
      default: () => false,
    })

    if (!states) return this
    onEntries(states, (k, v) => {
      const { state, get, set, ...rest } = v
      defineProperty(this.#stored, k, {
        value: state,
        get: () => {
          const value = this.#stored[k]
          return safeCall(get, () => value)(this, k, value)
        },
        set: newValue => {
          const defaultSet = () => ({ state: newValue, safe: true })
          const value = safeCall(set, defaultSet)(k, newValue)
          if (value?.safe) this.store({ [k]: value.state })
        },
        enumerable: true,
        configurable: true,
        ...rest,
      })
    })
    return this
  }

  read(key) {
    return this.#stored[key]
  }

  /**
   * Register an event listener.
   * @param {string} eventName - The name of the event.
   * @param {Function} listener - The event listener function.
   * @param {boolean} [overwrite=true] - Whether to overwrite existing listeners.
   * @returns {GlobalState} The current instance for chaining.
   */
  on(eventName, listener, overwrite = false) {
    if (!isFunction(listener)) return this
    if (!this.#events[eventName]) this.#events[eventName] = []

    if (overwrite && this.#events[eventName].length > 0) {
      this.#events[eventName][0] = { cb: listener }
    } else {
      this.#events[eventName].push({ cb: listener })
    }

    return this
  }

  /**
   * Emit an event, triggering all registered listeners.
   * @param {string} eventName - The name of the event.
   * @param {...*} args - The arguments to pass to the event listeners.
   */
  emit(eventName, ...args) {
    if (this.#events[eventName]) {
      this.#events[eventName].forEach(listener => listener.cb(...args))
    }
  }

  /**
   * Remove a specific event listener.
   * @param {string} eventName - The name of the event.
   * @param {Function} listener - The event listener function to remove.
   */
  off(eventName, listener) {
    if (this.#events[eventName]) {
      this.#events[eventName] = this.#events[eventName].filter(
        l => l.cb !== listener,
      )
    }
  }

  /**
   * Clear all listeners for a specific event.
   * @param {string} eventName - The name of the event.
   */
  clear(eventName) {
    if (this.#events[eventName]) {
      delete this.#events[eventName]
    }
  }
}

// Create the global states
GlobalState.create({
  handlebars: createHandlebarsState,
})

export default GlobalState
