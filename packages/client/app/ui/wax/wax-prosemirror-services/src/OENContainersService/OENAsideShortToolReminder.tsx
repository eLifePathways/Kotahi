// @ts-nocheck
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { uuid } from '@coko/client'
import { isEmpty } from 'lodash'
import { injectable } from 'inversify'
import { Tools } from '../../../wax-prosemirror-core'
import OENAsideButton from './components/OENAsideButton'

@injectable()
export default class OENAsideShortToolReminder extends Tools {
  title = 'Reminder'
  label = 'Reminder'
  name = 'OENAsideShortToolReminder'

  select = (state, activeViewId) => {
    if (activeViewId !== 'main') return false
    return true
  }

  get enable() {
    return state => {
      return true
    }
  }

  get active() {
    return state => {
      const { from, to } = state.selection
      let active = false
      state.doc.nodesBetween(from, to, node => {
        if (node.type.name === 'oen_aside') {
          if (node.attrs.class.includes('reminder')) active = true
        }
      })
      return active
    }
  }

  renderTool(view) {
    if (isEmpty(view)) return null

    return (
      <OENAsideButton
        item={this.toJSON()}
        key={uuid()}
        type="short reminder"
        view={view}
      />
    )
  }
}
