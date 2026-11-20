// @ts-nocheck
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useMemo } from 'react'
import { injectable, inject } from 'inversify'
import { isEmpty } from 'lodash'
import { uuid } from '@coko/client'
import { ToolGroup, ToolGroupComponent } from '../../../../wax-prosemirror-core'

@injectable()
class Annotations extends ToolGroup {
  tools = []
  constructor(
    @inject('Code') code,
    @inject('Emphasis') emphasis,
    @inject('Link') link,
    @inject('StrikeThrough') strikethrough,
    @inject('Strong') strong,
    @inject('Subscript') subscript,
    @inject('Superscript') superscript,
    @inject('Underline') underline,
    @inject('SmallCaps') smallcaps,
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
