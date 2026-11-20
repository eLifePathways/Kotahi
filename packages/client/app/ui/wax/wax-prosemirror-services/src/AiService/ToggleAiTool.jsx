import { uuid } from '@coko/client'
import { Tools } from '../../../wax-prosemirror-core'
import ToggleAiComponent from './components/ToggleAiComponent'

class ToggleAiTool extends Tools {
  title = 'Toggle Ai'
  icon = 'ai'
  name = 'ToggleAi'

  renderTool(view) {
    return <ToggleAiComponent item={this.toJSON()} key={uuid()} view={view} />
  }
}

export default ToggleAiTool
