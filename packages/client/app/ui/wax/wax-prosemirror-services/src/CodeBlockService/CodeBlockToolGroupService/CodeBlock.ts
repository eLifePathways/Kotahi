// @ts-nocheck
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { injectable, inject } from 'inversify'
import { ToolGroup } from '../../../../wax-prosemirror-core'

@injectable()
class CodeBlock extends ToolGroup {
  tools = []
  constructor(@inject('CodeBlockTool') codeblock) {
    super()
    this.tools = [codeblock]
  }
}

export default CodeBlock
