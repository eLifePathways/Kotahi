// @ts-nocheck
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { ToolGroup } from '../../../../wax-prosemirror-core'

class FindAndReplaceTool extends ToolGroup {
  static inject = ['FindAndReplace']

  tools = []
  constructor(findAndReplace) {
    super()
    this.tools = [findAndReplace]
  }
}

export default FindAndReplaceTool
