import { Service } from '../../../../../ui/wax/wax-prosemirror-core'
import KotahiBlockDropDown from './KotahiBlockDropDown'

class KotahiBlockDropDownToolGroupService extends Service {
  register() {
    this.container.bind('KotahiBlockDropDown').to(KotahiBlockDropDown)
  }
}

export default KotahiBlockDropDownToolGroupService
