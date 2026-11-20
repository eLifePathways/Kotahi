// @ts-nocheck
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { uuid } from '@coko/client'
import { isEmpty } from 'lodash'
import Button from '../../components/Button'

class Tools {
  static inject = ['Config', 'PmPlugins']

  title = 'title'
  _isDisplayed = true
  _isHiddenInToolGroup = false
  _showLabel = true
  config = {}
  pmplugins = {}
  name = 'name'

  constructor(config, pmplugins) {
    this.config = config
    this.pmplugins = pmplugins
  }

  static get id() {
    return this.name
  }

  get run() {
    return true
  }

  get enable() {
    return () => true
  }

  select() {
    return () => true
  }

  get active() {
    return () => false
  }

  toJSON() {
    return {
      title: this.title,
      icon: this.icon,
      label: this._showLabel ? this.label : undefined,
      active: this.active,
      run: this.run,
      enable: this.enable,
      select: this.select,
      id: this.id,
    }
  }

  renderTool(view) {
    if (isEmpty(view)) return null

    return this._isDisplayed ? (
      <Button item={this.toJSON()} key={uuid()} view={view} />
    ) : null
  }

  displayTool() {
    this._isDisplayed = true
  }

  hideTool() {
    this._isDisplayed = false
  }

  isDisplayed() {
    return this._isDisplayed
  }

  displayInToolGroup() {
    this._isHiddenInToolGroup = false
  }

  hideInToolGroup() {
    this._isHiddenInToolGroup = true
  }

  isIntoMoreSection() {
    return this._isHiddenInToolGroup
  }

  showLabel() {
    this._showLabel = true
  }

  hideLabel() {
    this._showLabel = false
  }
}

export default Tools
