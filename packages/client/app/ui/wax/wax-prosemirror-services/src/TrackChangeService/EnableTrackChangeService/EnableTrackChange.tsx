// @ts-nocheck
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { isEmpty } from 'lodash'
import { uuid } from '@coko/client'
import { Tools } from '../../../../wax-prosemirror-core'
import TrackChangeEnable from '../../CommentsService/components/ui/trackChanges/TrackChangeEnable'

export default class EnableTrackChange extends Tools {
  title = 'Toggle Track Changes'
  label = 'Track Changes'
  name = 'EnableTrackChange'

  get run() {
    return () => {
      this.config.enabled = !this.config.enabled
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
      <TrackChangeEnable
        enabled={this.config.enabled}
        item={this.toJSON()}
        key={uuid()}
        view={view}
      />
    ) : null
  }
}
