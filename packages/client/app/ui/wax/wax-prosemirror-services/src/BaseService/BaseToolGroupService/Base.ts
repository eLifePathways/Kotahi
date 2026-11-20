// @ts-nocheck
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { injectable, inject } from 'inversify'
import { ToolGroup } from '../../../../wax-prosemirror-core'

@injectable()
class Base extends ToolGroup {
  tools = []
  constructor(@inject('Undo') undo, @inject('Redo') redo) {
    super()
    this.tools = [undo, redo]
  }
}

export default Base
