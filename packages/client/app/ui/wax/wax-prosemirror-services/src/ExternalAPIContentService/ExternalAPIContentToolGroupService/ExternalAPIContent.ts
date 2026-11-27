// @ts-nocheck
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { injectable, inject } from 'inversify'
import { ToolGroup } from '../../../../wax-prosemirror-core'

@injectable()
class ExternalAPIContent extends ToolGroup {
  tools = []
  constructor(@inject('ExternalAPIContentTool') ExternalAPIContentTool) {
    super()
    this.tools = [ExternalAPIContentTool]
  }
}

export default ExternalAPIContent
