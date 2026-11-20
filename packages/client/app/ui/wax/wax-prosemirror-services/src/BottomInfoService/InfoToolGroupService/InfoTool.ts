// @ts-nocheck
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { ToolGroup } from '../../../../wax-prosemirror-core'

class InfoToolGroup extends ToolGroup {
  static inject = ['CounterInfoTool']

  tools = []
  constructor(counterinfotool) {
    super()
    this.tools = [counterinfotool]
  }
}

export default InfoToolGroup
