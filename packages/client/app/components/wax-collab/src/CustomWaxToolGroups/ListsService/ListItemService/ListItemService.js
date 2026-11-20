import { Service } from '../../../../../../ui/wax/wax-prosemirror-core'
import listItemNode from './schema/listItemNode'

class ListItemService extends Service {
  register() {
    const createNode = this.container.get('CreateNode')
    createNode(
      {
        list_item: listItemNode,
      },
      { toWaxSchema: true },
    )
  }
}

export default ListItemService
