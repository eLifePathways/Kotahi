// @ts-nocheck
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { uuid } from '@coko/client'
import { isEmpty } from 'lodash'
import { Commands, Tools } from '../../../wax-prosemirror-core'
import TableDropDown from '../components/TableDropDown'

export default class TableDropDownOptions extends Tools {
  title = 'Select Options'
  content = 'table'
  name = 'TableDropDownOptions'

  get run() {
    return (state, dispatch, tableFn) => {
      tableFn(state, dispatch)
    }
  }

  get enable() {
    return state => {
      return Commands.canInsert(state.config.schema.nodes.table)(state)
    }
  }

  select(state) {
    return Commands.isInTable(state)
  }

  renderTool(view) {
    if (isEmpty(view)) return null
    return this.isDisplayed() ? (
      <TableDropDown item={this.toJSON()} key={uuid()} view={view} />
    ) : null
  }
}
