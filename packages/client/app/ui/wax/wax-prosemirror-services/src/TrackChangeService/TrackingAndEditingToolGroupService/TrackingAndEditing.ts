// @ts-nocheck
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { ToolGroup } from '../../../../wax-prosemirror-core'

class TrackingAndEditing extends ToolGroup {
  static inject = ['EditingSuggesting']

  tools = []
  constructor(editingSuggesting) {
    super()
    this.tools = [editingSuggesting]
  }
}

export default TrackingAndEditing
