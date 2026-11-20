// @ts-nocheck
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useMemo } from 'react'
import { isEmpty } from 'lodash'
import { uuid } from '@coko/client'
import { ToolGroup, ToolGroupComponent } from '../../../../wax-prosemirror-core'

class Annotations extends ToolGroup {
  static inject = [
    'Code',
    'Emphasis',
    'Link',
    'StrikeThrough',
    'Strong',
    'Subscript',
    'Superscript',
    'Underline',
    'SmallCaps',
  ]

  tools = []
  constructor(
    code,
    emphasis,
    link,
    strikethrough,
    strong,
    subscript,
    superscript,
    underline,
    smallcaps,
  ) {
    super()
    this.tools = [
      strong,
      emphasis,
      code,
      link,
      strikethrough,
      underline,
      subscript,
      superscript,
      smallcaps,
    ]
  }

  renderTools(view) {
    if (isEmpty(view)) return null

    const { name } = this.constructor

    const MemorizedToolGroupComponent = useMemo(
      () => (
        <ToolGroupComponent
          key={uuid()}
          name={name}
          title={this.title}
          tools={this._tools}
          view={view}
        />
      ),
      [view],
    )

    return MemorizedToolGroupComponent
  }
}

export default Annotations
