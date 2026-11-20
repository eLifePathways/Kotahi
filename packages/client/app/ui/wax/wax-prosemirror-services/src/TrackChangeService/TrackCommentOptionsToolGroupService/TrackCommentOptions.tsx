// @ts-nocheck
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-underscore-dangle */
import { useMemo } from 'react'
import { isEmpty } from 'lodash'
import { uuid } from '@coko/client'
import { ToolGroup } from '../../../../wax-prosemirror-core'
import TrackChangeOptionsTool from '../components/TrackChangeOptionsTool'

class TrackCommentOptions extends ToolGroup {
  static inject = ['TrackOptions']

  tools = []
  toolGroups = []

  constructor(trackOptions) {
    super()
    this.toolGroups = [
      {
        groups: [trackOptions],
      },
    ]
  }

  renderTools(view) {
    if (isEmpty(view)) return null

    const MemorizedComponent = useMemo(
      () => (
        <TrackChangeOptionsTool
          groups={this._toolGroups[0].groups.map(group => ({
            //   groupName: group.title.props.title,
            items: group._tools,
          }))}
          key={uuid()}
          view={view}
        />
      ),
      [],
    )
    return MemorizedComponent
  }
}

export default TrackCommentOptions
