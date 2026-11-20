// @ts-nocheck
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { isEmpty } from 'lodash'
import { Tools } from '../../../../wax-prosemirror-core'
import EditorInfoTool from './components/EditorInfoTool'

class CounterInfoTool extends Tools {
  title = 'Counter Info'
  name = 'CounterInfo'

  get run() {
    return () => true
  }

  get enable() {
    return () => {
      return true
    }
  }

  renderTool(view) {
    if (isEmpty(view)) return null
    return this.isDisplayed() ? (
      <EditorInfoTool item={this.toJSON()} key="CounterInfo" view={view} />
    ) : null
  }
}

export default CounterInfoTool
