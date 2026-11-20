// @ts-nocheck
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-underscore-dangle */
import { useMemo } from 'react'
import { injectable, inject } from 'inversify'
import { isEmpty } from 'lodash'
import { uuid } from '@coko/client'
import { ToolGroup } from '../../../../wax-prosemirror-core'
import TrackChangeOptionsTool from '../components/TrackChangeOptionsTool'

@injectable()
class TrackCommentOptions extends ToolGroup {
  tools = []
  toolGroups = []

  constructor(@inject('TrackOptions') trackOptions) {
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
