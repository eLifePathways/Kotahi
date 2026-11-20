// @ts-nocheck
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { injectable } from 'inversify'

@injectable()
export default class PmPlugins {
  _plugins = new Map()
  add(key, plugin) {
    this._plugins.set(key, plugin)
  }

  getAll() {
    return [...this._plugins.values()]
  }

  replace(key, plugin) {
    this._plugins.delete(key)
    this.add(key, plugin)
  }

  get(key) {
    return this._plugins.get(key)
  }
}
