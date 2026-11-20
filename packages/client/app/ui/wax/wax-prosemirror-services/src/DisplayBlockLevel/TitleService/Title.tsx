// @ts-nocheck
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { isEmpty } from 'lodash'
import {
  Commands,
  DocumentHelpers,
  Tools,
} from '../../../../wax-prosemirror-core'
import TitleButton from './components/TitleButton'

export default class Title extends Tools {
  title = 'Change to Title'
  label = 'Title'
  name = 'Title'

  get run() {
    return (state, dispatch) => {
      Commands.setBlockType(state.config.schema.nodes.title, { level: 1 })(
        state,
        dispatch,
      )
    }
  }

  get active() {
    return state => {
      return Commands.blockActive(state.config.schema.nodes.title)(state)
    }
  }

  select = (state, activeViewId) => {
    const {
      selection: { $from, $to },
    } = state

    const titleCounter = DocumentHelpers.findChildrenByType(
      state.doc,
      state.config.schema.nodes.title,
      true,
    )

    if (
      activeViewId !== 'main' ||
      $from.parent !== $to.parent ||
      titleCounter.length === 1
    )
      return false

    return true
  }

  get enable() {
    return state => {
      return Commands.setBlockType(state.config.schema.nodes.title)(state)
    }
  }

  renderTool(view) {
    if (isEmpty(view)) return null
    return this.isDisplayed() ? (
      <TitleButton item={this.toJSON()} key="Title" view={view} />
    ) : null
  }
}
