import React from 'react'
import { uuid } from '@coko/client'
import { Tools } from '../../../../wax-prosemirror-core'
import CustomTagInlineComponent from '../components/CustomTagInlineComponent'

class CustomTagInLineTool extends Tools {
  title = 'Custom Tag Inline'
  icon = 'cutomInline'
  name = 'CustomTagInline'

  renderTool(view) {
    return (
      <CustomTagInlineComponent item={this.toJSON()} key={uuid()} view={view} />
    )
  }
}

export default CustomTagInLineTool
