// @ts-nocheck
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { injectable, inject } from 'inversify'
import { ToolGroup } from '../../../../wax-prosemirror-core'

@injectable()
class SpecialCharacters extends ToolGroup {
  tools = []
  constructor(@inject('SpecialCharactersTool') specialCharactersTool) {
    super()
    this.tools = [specialCharactersTool]
  }
}

export default SpecialCharacters
