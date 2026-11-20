// @ts-nocheck
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { injectable, inject } from 'inversify'
import { ToolGroup } from '../../../../wax-prosemirror-core'

@injectable()
class ToggleAi extends ToolGroup {
  tools = []

  constructor(@inject('ToggleAiTool') toggleAiTool) {
    super()
    this.tools = [toggleAiTool]
  }
}

export default ToggleAi
