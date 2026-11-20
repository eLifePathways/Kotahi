// @ts-nocheck
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { ToolGroup } from '../../../../wax-prosemirror-core'

class Base extends ToolGroup {
  static inject = ['Undo', 'Redo']

  tools = []
  constructor(undo, redo) {
    super()
    this.tools = [undo, redo]
  }
}

export default Base
