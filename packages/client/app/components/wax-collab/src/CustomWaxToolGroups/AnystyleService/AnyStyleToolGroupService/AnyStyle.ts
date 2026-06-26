// @ts-nocheck

import { injectable, inject } from 'inversify'
import { ToolGroup } from 'wax-prosemirror-core'

@injectable()
class Anystyle extends ToolGroup {
  constructor(@inject('AnyStyleTool') anyStyleTool) {
    super()
    this._tools = [anyStyleTool]
  }
}

export default Anystyle
