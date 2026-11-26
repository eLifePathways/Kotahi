const { config, logger } = require('@coko/server')
const map = require('lib0/map')
// const Y = require('yjs')
const { WebSocket, WebSocketServer } = require('ws')

const WSSharedDoc = require('./wsSharedDoc')
const utils = require('./utils')
const { authoriseConnection } = require('./access')

const pingTimeout = 30000

// Application-defined close code (4000–4999) for refused connections
const UNAUTHORISED_CLOSE_CODE = 4401

const messageListener = (conn, doc, message) => {
  try {
    const encoder = utils.encoding.createEncoder()
    const decoder = utils.decoding.createDecoder(message)
    const messageType = utils.decoding.readVarUint(decoder)

    switch (messageType) {
      case utils.messageSync:
        utils.encoding.writeVarUint(encoder, utils.messageSync)
        utils.syncProtocol.readSyncMessage(decoder, encoder, doc, null)
        // console.log(doc)

        if (utils.encoding.length(encoder) > 1) {
          utils.send(doc, conn, utils.encoding.toUint8Array(encoder))
        }

        break
      case utils.messageAwareness:
        utils.awarenessProtocol.applyAwarenessUpdate(
          doc.awareness,
          utils.decoding.readVarUint8Array(decoder),
          conn,
        )
        break
    }
  } catch (error) {
    logger.error(error)
    doc.emit('error', [error])
  }
}

module.exports = ({ port = config.get('wsYjsServerPort') } = {}) => {
  try {
    const WSServer = new WebSocketServer({
      port,
      clientTracking: true,
    })

    WSServer.on('connection', async (injectedWS, request) => {
      injectedWS.binaryType = 'arraybuffer'

      // The client starts syncing as soon as the socket opens, so hold on to
      // anything that arrives while access is being checked
      const pendingMessages = []
      const queueMessage = message => pendingMessages.push(message)
      injectedWS.on('message', queueMessage)

      let access = null

      try {
        access = await authoriseConnection(request.url)
      } catch (error) {
        logger.error('Yjs connection: access check failed', error)
      }

      if (!access) {
        injectedWS.close(UNAUTHORISED_CLOSE_CODE, 'Unauthorised')
        return
      }

      if (injectedWS.readyState !== WebSocket.OPEN) return

      const { docName, userId, extraData } = access
      const doc = getYDoc(docName, userId, extraData)

      doc.conns.set(injectedWS, new Set())

      injectedWS.off('message', queueMessage)

      injectedWS.on('message', message =>
        messageListener(injectedWS, doc, new Uint8Array(message)),
      )

      pendingMessages.forEach(message =>
        messageListener(injectedWS, doc, new Uint8Array(message)),
      )

      let pingReceived = true

      const pingInterval = setInterval(() => {
        if (!pingReceived) {
          if (doc.conns.has(injectedWS)) {
            utils.closeConn(doc, injectedWS)
          }

          clearInterval(pingInterval)
        } else if (doc.conns.has(injectedWS)) {
          pingReceived = false

          try {
            injectedWS.ping()
            /* eslint-disable-next-line  */
          } catch (error) {
            utils.closeConn(doc, injectedWS)
            clearInterval(pingInterval)
          }
        }
      }, pingTimeout)

      injectedWS.on('close', () => {
        utils.closeConn(doc, injectedWS)
        clearInterval(pingInterval)
      })

      injectedWS.on('ping', () => {
        pingReceived = true
      })

      {
        const encoder = utils.encoding.createEncoder()
        utils.encoding.writeVarUint(encoder, utils.messageSync)
        utils.syncProtocol.writeSyncStep1(encoder, doc)
        utils.send(doc, injectedWS, utils.encoding.toUint8Array(encoder))
        const awarenessStates = doc.awareness.getStates()

        if (awarenessStates.size > 0) {
          const encoder1 = utils.encoding.createEncoder()
          utils.encoding.writeVarUint(encoder1, utils.messageAwareness)
          utils.encoding.writeVarUint8Array(
            encoder1,
            utils.awarenessProtocol.encodeAwarenessUpdate(
              doc.awareness,
              Array.from(awarenessStates.keys()),
            ),
          )
          utils.send(doc, injectedWS, utils.encoding.toUint8Array(encoder1))
        }
      }
    })

    const getYDoc = (docName, userId, extraData) =>
      map.setIfUndefined(utils.docs, docName, () => {
        const doc = new WSSharedDoc(docName, userId, extraData)
        doc.gc = true

        if (utils.persistence !== null) {
          utils.persistence.bindState(docName, doc)
        }

        utils.docs.set(docName, doc)
        return doc
      })

    return WSServer
  } catch (error) {
    throw new Error(error)
  }
}
