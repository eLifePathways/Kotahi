/* eslint-disable new-cap */

import { Service } from 'wax-prosemirror-core'
import AnyStyleTool from './AnyStyleTool'
import AnyStyleToolGroupService from './AnyStyleToolGroupService/AnyStyleToolGroupService'
import AnyStylePlaceHolderPlugin from './plugins/anystylePlaceHolderPlugin'
import './anyStyle.css'

class AnyStyleService extends Service {
  name = 'AnyStyleService'

  boot() {
    this.app.PmPlugins.add(
      'anyStylePlaceHolder',
      AnyStylePlaceHolderPlugin('anyStylePlaceHolder'),
    )
  }

  register() {
    this.container.bind('AnyStyleTool').to(AnyStyleTool)
  }

  dependencies = [new AnyStyleToolGroupService()]
}

export default AnyStyleService
