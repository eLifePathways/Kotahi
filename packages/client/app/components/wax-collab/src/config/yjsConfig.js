// import { YjsService } from 'wax-prosemirror-services'
import YjsService from './YjsService'

export default (config, { wsProvider, ydoc, yjsType }) => {
  if (wsProvider && ydoc) {
    config.YjsService = {
      provider: () => wsProvider,
      ydoc: () => ydoc,
      yjsType,
      cursorBuilder: user => {
        if (user) {
          const cursor = document.createElement('span')
          cursor.classList.add('ProseMirror-yjs-cursor')
          cursor.setAttribute('style', `border-color: ${user.color}`)
          const userDiv = document.createElement('div')
          userDiv.setAttribute('style', `background-color: ${user.color}`)
          userDiv.insertBefore(document.createTextNode(user.displayName), null)
          cursor.insertBefore(userDiv, null)
          return cursor
        }

        return ''
      },
    }

    config.services = [new YjsService(), ...config.services]
  }

  return config
}
