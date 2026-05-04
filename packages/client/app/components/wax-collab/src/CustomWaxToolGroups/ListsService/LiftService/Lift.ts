// @ts-nocheck

/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { lift } from 'prosemirror-commands'
import { injectable } from 'inversify'
import { Tools } from 'wax-prosemirror-core'

@injectable()
export default class Lift extends Tools {
  title = 'Lift out of enclosing block'
  icon = 'indentDecrease'
  name = 'Lift'

  select = (state, activeViewId, activeView) => {
    const { disallowedTools } = activeView.props
    if (disallowedTools.includes('lift')) return false
    return lift(state)
  }

  get run() {
    return lift
  }

  get enable() {
    return lift
  }
}
