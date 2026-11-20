// @ts-nocheck
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { uuid } from '@coko/client'
import { injectable } from 'inversify'
import { Commands, Tools } from '../../../wax-prosemirror-core'
import ExternalApiComponent from './components/ExternalApiComponent'

@injectable()
class ExternalAPIContentTool extends Tools {
  title = 'ChatGPT'
  name = 'ChatGPT'
  label = 'ChatGPT'

  get run() {
    return true
  }

  get enable() {
    return state => {
      return Commands.isOnSameTextBlock(state)
    }
  }

  select = state => {
    return Commands.isOnSameTextBlock(state)
  }

  renderTool(view) {
    return (
      <ExternalApiComponent
        config={this.config}
        displayed={this.isDisplayed()}
        item={this}
        key={uuid()}
        pmplugins={this.pmplugins}
        view={view}
      />
    )
  }
}

export default ExternalAPIContentTool
