// @ts-nocheck
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { injectable } from 'inversify'
import { isEmpty } from 'lodash'
import { uuid } from '@coko/client'
import { Tools } from '../../../wax-prosemirror-core'
import EditingSuggestingDropDown from './components/EditingSuggestingDropDown'

@injectable()
export default class EditingSuggesting extends Tools {
  title = ''
  label = ''
  name = 'EditingSuggesting'

  get run() {
    return () => {
      return true
    }
  }

  get enable() {
    return () => {
      return true
    }
  }

  renderTool(view) {
    if (isEmpty(view)) return null
    return this.isDisplayed() ? (
      <EditingSuggestingDropDown
        enabled={this.config.enabled}
        item={this.toJSON()}
        key={uuid()}
        view={view}
      />
    ) : null
  }
}
