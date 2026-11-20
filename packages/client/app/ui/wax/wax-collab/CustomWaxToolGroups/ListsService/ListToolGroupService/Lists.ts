// @ts-nocheck

import { ToolGroup } from '../../../../wax-prosemirror-core'

class Lists extends ToolGroup {
  static inject = ['BlockQuote', 'OrderedList', 'BulletList', 'JoinUp', 'Lift']

  constructor(blockQuote, orderedlist, bulletlist, joinup, lift) {
    super()
    this._tools = [blockQuote, orderedlist, bulletlist, joinup, lift]
  }
}

export default Lists
