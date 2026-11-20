import { Service } from '../../../../../ui/wax/wax-prosemirror-core'
import JatsSideMenu from './JatsSideMenu'

class JatsSideMenuToolGroupService extends Service {
  register() {
    this.container.bind('JatsSideMenu').to(JatsSideMenu)
  }
}

export default JatsSideMenuToolGroupService
