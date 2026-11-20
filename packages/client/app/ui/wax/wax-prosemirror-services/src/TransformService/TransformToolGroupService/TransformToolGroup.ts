// @ts-nocheck
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { ToolGroup } from '../../../../wax-prosemirror-core'

class TransformToolGroup extends ToolGroup {
  static inject = ['TransformTool']

  tools = []

  constructor(transformCase) {
    super()
    this.tools = [transformCase]
  }
}

export default TransformToolGroup
