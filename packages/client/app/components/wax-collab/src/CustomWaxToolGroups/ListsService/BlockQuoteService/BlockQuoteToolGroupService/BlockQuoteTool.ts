// @ts-nocheck

import { injectable, inject } from 'inversify'
import { ToolGroup } from 'wax-prosemirror-core'

@injectable()
class BlockQuoteTool extends ToolGroup {
  title = ''

  constructor(@inject('BlockQuote') blockQuote, @inject('Lift') lift) {
    super()
    this._tools = [blockQuote, lift]
  }
}

export default BlockQuoteTool
