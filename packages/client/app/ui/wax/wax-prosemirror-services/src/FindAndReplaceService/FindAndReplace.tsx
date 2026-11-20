// @ts-nocheck
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { isEmpty } from 'lodash'
import { uuid } from '@coko/client'
import { Tools } from '../../../wax-prosemirror-core'
import FindAndReplaceTool from './components/FindAndReplaceTool'

export default class FindAndReplace extends Tools {
  title = 'Find And Replace'
  icon = 'findAndReplace'
  name = 'find'

  get enable() {
    return () => {
      return true
    }
  }

  renderTool(view) {
    if (isEmpty(view)) return null

    return this.isDisplayed() ? (
      <FindAndReplaceTool item={this.toJSON()} key={uuid()} view={view} />
    ) : null
  }
}
