const http = require('http')

const { logger } = require('@coko/server')

const CALLBACK_URL = {
  hostname: 'localhost',
  port: '3000',
  path: 'callback',
}

const CALLBACK_TIMEOUT = 5000
const CALLBACK_OBJECTS = '{"prosemirror":"XMLFragment"}'
const CALLBACK_DEBOUNCE_WAIT = 2000
const CALLBACK_DEBOUNCE_MAXWAIT = 10000

const isCallbackSet = !!CALLBACK_URL

const callbackHandler = (update, origin, doc) => {
  const room = doc.name

  const dataToSend = {
    room,
    data: {},
  }

  const sharedObjectList = Object.keys(CALLBACK_OBJECTS)
  sharedObjectList.forEach(sharedObjectName => {
    const sharedObjectType = CALLBACK_OBJECTS[sharedObjectName]
    dataToSend.data[sharedObjectName] = {
      type: sharedObjectType,
      content: doc.getText(sharedObjectName),
    }
  })
  callbackRequest(CALLBACK_URL, CALLBACK_TIMEOUT, dataToSend)
}

const callbackRequest = (url, timeout, data) => {
  const dataToSend = JSON.stringify(data)

  const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.path,
    timeout,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': dataToSend.length,
    },
  }

  const req = http.request(options)
  req.on('timeout', () => {
    logger.warn('Callback request timed out.')
    req.abort()
  })
  req.on('error', e => {
    logger.error('Callback request error.', e)
    req.abort()
  })
  req.write(dataToSend)
  req.end()
}

const getContent = (objName, objType, doc) => {
  switch (objType) {
    case 'Array':
      return doc.getArray(objName)
    case 'Map':
      return doc.getMap(objName)
    case 'Text':
      return doc.getText(objName)
    case 'XMLFragment':
      return doc.getXmlFragment(objName)
    case 'XmlElement':
      return doc.getXmlElement(objName)
    default:
      return {}
  }
}

module.exports = {
  isCallbackSet,
  callbackHandler,
  callbackRequest,
  getContent,
  CALLBACK_DEBOUNCE_WAIT,
  CALLBACK_DEBOUNCE_MAXWAIT,
}
