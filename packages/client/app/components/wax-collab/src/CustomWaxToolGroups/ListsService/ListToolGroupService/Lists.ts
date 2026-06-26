// @ts-nocheck

import { injectable, inject } from 'inversify'
import { ToolGroup } from 'wax-prosemirror-core'

@injectable()
class Lists extends ToolGroup {
  constructor(
    @inject('BlockQuote') blockQuote,
    @inject('OrderedList') orderedlist,
    @inject('BulletList') bulletlist,
    @inject('JoinUp') joinup,
    @inject('Lift') lift,
  ) {
    super()
    this._tools = [blockQuote, orderedlist, bulletlist, joinup, lift]
  }
}

export default Lists
