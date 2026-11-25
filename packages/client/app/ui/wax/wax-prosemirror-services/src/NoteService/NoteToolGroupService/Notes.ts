// @ts-nocheck
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { injectable, inject } from 'inversify'
import { ToolGroup } from '../../../../wax-prosemirror-core'

@injectable()
class Notes extends ToolGroup {
  tools = []
  constructor(@inject('Note') note) {
    super()
    this.tools = [note]
  }
}

export default Notes
