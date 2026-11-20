// @ts-nocheck
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { injectable } from 'inversify'
import { Commands, Tools } from '../../../wax-prosemirror-core'
import { uuid } from '@coko/client'

import ImageUploadComponent from './components/ImageUploadComponent'

@injectable()
export default class Image extends Tools {
  title = 'Upload Image'
  icon = 'image'
  name = 'Image'

  get run() {
    return true
  }

  select = activeView => {
    const {
      selection: { from },
    } = activeView.state
    if (from === null) return false
    const { disallowedTools } = activeView.props
    if (disallowedTools.includes('Images')) return false
    return true
  }

  get enable() {
    return state => {
      return Commands.canInsert(state.config.schema.nodes.image)(state)
    }
  }

  renderTool(view) {
    return (
      <ImageUploadComponent
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
