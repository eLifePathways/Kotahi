/* eslint-disable no-console */
import { yCursorPlugin, ySyncPlugin, yUndoPlugin } from 'y-prosemirror'
import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs'
import { Service } from '../../wax-prosemirror-core'

class YjsService extends Service {
  name = 'YjsService'
  boot() {
    const {
      connectionUrl,
      docIdentifier,
      cursorBuilder,
      provider: configProvider,
      ydoc: configYdoc,
      yjsType,
    } = this.config

    let provider = configProvider ? configProvider() : null
    let ydoc = configYdoc ? configYdoc() : null

    if (!configProvider || !configYdoc) {
      ydoc = new Y.Doc()
      provider = new WebsocketProvider(connectionUrl, docIdentifier, ydoc)
      //   this.app.context.setOption({ currentYdoc: ydoc })
    }

    // Without this the review page is crashing locally!
    this.app.context.setOption({ currentYdoc: ydoc })

    provider.on('sync', args => {
      console.log({ sync: args })
    })
    provider.on('status', args => {
      console.log({ status: args })
    })
    provider.on('connection-close', args => {
      console.log({ connectioClose: args })
    })
    provider.on('connection-error', args => {
      console.log({ connectioError: args })
    })

    const type = ydoc.getXmlFragment(yjsType || 'prosemirror')

    this.app.PmPlugins.add('ySyncPlugin', ySyncPlugin(type))

    if (cursorBuilder) {
      // this.app.PmPlugins.add(
      //   'yCursorPlugin',
      //   yCursorPlugin(provider.awareness, { cursorBuilder }),
      // )
    } else {
      this.app.PmPlugins.add('yCursorPlugin', yCursorPlugin(provider.awareness))
    }

    this.app.PmPlugins.add('yUndoPlugin', yUndoPlugin())
  }
}

export default YjsService
