// @ts-nocheck
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { ToolGroup } from '../../../../wax-prosemirror-core'

class ToggleAi extends ToolGroup {
  static inject = ['ToggleAiTool']

  tools = []

  constructor(toggleAiTool) {
    super()
    this.tools = [toggleAiTool]
  }
}

export default ToggleAi
