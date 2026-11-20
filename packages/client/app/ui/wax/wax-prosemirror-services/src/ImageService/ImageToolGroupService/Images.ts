// @ts-nocheck
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { ToolGroup } from '../../../../wax-prosemirror-core'

class Images extends ToolGroup {
  static inject = ['Image']

  tools = []
  constructor(image) {
    super()
    this.tools = [image]
  }
}

export default Images
