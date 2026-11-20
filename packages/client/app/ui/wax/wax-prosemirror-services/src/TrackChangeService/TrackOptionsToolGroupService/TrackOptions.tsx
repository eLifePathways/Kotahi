// @ts-nocheck
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useMemo } from 'react'
import { isEmpty } from 'lodash'
import { uuid } from '@coko/client'
import { ToolGroup, ToolGroupComponent } from '../../../../wax-prosemirror-core'

class TrackOptions extends ToolGroup {
  static inject = [
    'ShowHideTrackChange',
    'AcceptTrackChange',
    'RejectTrackChange',
  ]

  tools = []
  constructor(showHideTrackChange, acceptTrackChange, rejectTrackChange) {
    super()
    this.tools = [showHideTrackChange, acceptTrackChange, rejectTrackChange]
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

export default TrackOptions
