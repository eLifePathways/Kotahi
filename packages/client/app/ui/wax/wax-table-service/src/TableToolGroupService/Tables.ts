// @ts-nocheck
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { injectable, inject } from 'inversify'
import { ToolGroup } from '../../../wax-prosemirror-core'

@injectable()
class Tables extends ToolGroup {
  tools = []
  constructor(
    @inject('Table') table,
    @inject('TableDropDownOptions') tableDropDownOptions,
  ) {
    super()
    this.tools = [table, tableDropDownOptions]
  }
}

export default Tables
