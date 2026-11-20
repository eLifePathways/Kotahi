// @ts-nocheck
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React from 'react'
import { isEmpty } from 'lodash'
import { uuid } from '@coko/client'
import { injectable } from 'inversify'
import { Commands, Tools } from '../../../wax-prosemirror-core'
import CreateTable from '../components/CreateTable'

@injectable()
export default class Table extends Tools {
  title = 'Insert table'
  icon = 'table'
  name = 'Table'

  get run() {
    return (colRows, state, dispatch) => {
      Commands.createTable(colRows, state, dispatch)
    }
  }

  select = activeView => {
    const {
      selection: { from },
    } = activeView.state
    if (from === null) return false
    const { disallowedTools } = activeView.props
    if (disallowedTools.includes('Tables')) return false
    return true
  }

  get enable() {
    return state => {
      return Commands.canInsert(state.config.schema.nodes.table)(state)
    }
  }

  renderTool(view) {
    if (isEmpty(view)) return null
    return this.isDisplayed() ? (
      <CreateTable item={this.toJSON()} key={uuid()} view={view} />
    ) : null
  }
}
