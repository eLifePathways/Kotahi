// @ts-nocheck
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { isEmpty } from 'lodash'
import { uuid } from '@coko/client'
import { injectable } from 'inversify'
import { Tools } from '../../../wax-prosemirror-core'
import SpecialCharactersTool from './components/SpecialCharactersTool'

@injectable()
export default class SpecialCharacters extends Tools {
  title = 'Special Characters'
  icon = 'specialCharacters'
  name = 'specialCharacters'

  get enable() {
    return () => {
      return true
    }
  }

  renderTool(view) {
    if (isEmpty(view)) return null

    return this.isDisplayed() ? (
      <SpecialCharactersTool item={this.toJSON()} key={uuid()} view={view} />
    ) : null
  }
}
