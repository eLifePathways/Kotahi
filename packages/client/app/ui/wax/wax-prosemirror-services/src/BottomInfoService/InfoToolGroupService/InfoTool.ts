// @ts-nocheck
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { injectable, inject } from 'inversify'
import { ToolGroup } from '../../../../wax-prosemirror-core'

@injectable()
class InfoToolGroup extends ToolGroup {
  tools = []
  constructor(@inject('CounterInfoTool') counterinfotool) {
    super()
    this.tools = [counterinfotool]
  }
}

export default InfoToolGroup
