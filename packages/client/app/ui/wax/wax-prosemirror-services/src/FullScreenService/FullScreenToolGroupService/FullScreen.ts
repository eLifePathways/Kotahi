// @ts-nocheck
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { ToolGroup } from '../../../../wax-prosemirror-core'

class FullScreen extends ToolGroup {
  static inject = ['FullScreenTool']

  tools = []
  constructor(fullScreenTool) {
    super()
    this.tools = [fullScreenTool]
  }
}

export default FullScreen
