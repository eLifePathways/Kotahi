// @ts-nocheck
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { ToolGroup } from '../../../../wax-prosemirror-core'

class SpecialCharacters extends ToolGroup {
  static inject = ['SpecialCharactersTool']

  tools = []
  constructor(specialCharactersTool) {
    super()
    this.tools = [specialCharactersTool]
  }
}

export default SpecialCharacters
