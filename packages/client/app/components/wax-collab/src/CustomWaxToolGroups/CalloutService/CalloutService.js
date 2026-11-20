import { Service } from '../../../../../ui/wax/wax-prosemirror-core'
import CalloutTool from './CalloutTool'
import calloutDefinition from './schema/callout'
import calloutPlugin from './plugins/calloutPlugin'
import CalloutContainerNodeView from './CalloutContainerNodeView'
import CalloutComponent from './components/CalloutComponent'

class CalloutService extends Service {
  name = 'CalloutService'

  boot() {
    this.app.PmPlugins.add(
      'calloutPlugin',
      calloutPlugin('calloutPlugin', this.config),
    )
  }

  register() {
    this.container.bind('Callout').to(CalloutTool)
    const createNode = this.container.get('CreateNode')
    const addPortal = this.container.get('AddPortal')
    // console.log(this.config) // check to make sure that config is coming through
    createNode(
      {
        callout: calloutDefinition,
      },
      { toWaxSchema: true },
    )

    addPortal({
      nodeView: CalloutContainerNodeView,
      component: CalloutComponent,
      context: this.app,
    })
  }
}

export default CalloutService
