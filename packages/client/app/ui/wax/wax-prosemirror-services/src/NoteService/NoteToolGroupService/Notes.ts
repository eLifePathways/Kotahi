// @ts-nocheck
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { ToolGroup } from '../../../../wax-prosemirror-core'

class Notes extends ToolGroup {
  static inject = ['Note']

  tools = []
  constructor(note) {
    super()
    this.tools = [note]
  }
}

export default Notes
