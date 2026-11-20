// @ts-nocheck
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { ToolGroup } from '../../../wax-prosemirror-core'

class Tables extends ToolGroup {
  static inject = ['Table', 'TableDropDownOptions']

  tools = []
  constructor(table, tableDropDownOptions) {
    super()
    this.tools = [table, tableDropDownOptions]
  }
}

export default Tables
