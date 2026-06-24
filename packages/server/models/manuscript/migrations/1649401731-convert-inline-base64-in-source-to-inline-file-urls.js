const cheerio = require('cheerio')
const { map } = require('lodash')
const atob = require('atob')
const { Duplex } = require('stream')

const { useTransaction, createFile } = require('@coko/server')

const {
  // Blob,
  getFilesWithUrl,
} = require('../../../utils/fileStorageUtils')

const Manuscript = require('../manuscript.model')

// Based on https://github.com/tmpvar/jsdom/blob/aa85b2abf07766ff7bf5c1f6daafb3726f2f2db5/lib/jsdom/living/blob.js
// (MIT licensed)
// Also based on https://github.com/modulesio/window-fetch/blob/master/src/blob.js

const TYPE = Symbol('type')
const CLOSED = Symbol('closed')

class Blob {
  constructor() {
    Object.defineProperty(this, Symbol.toStringTag, {
      value: 'Blob',
      writable: false,
      enumerable: false,
      configurable: true,
    })

    this[CLOSED] = false
    this[TYPE] = ''

    const blobParts = arguments[0]
    const options = arguments[1]

    const buffers = []

    if (blobParts) {
      const a = blobParts
      const length = Number(a.length)

      for (let i = 0; i < length; i += 1) {
        const element = a[i]
        let buffer

        if (element instanceof Buffer) {
          buffer = element
        } else if (ArrayBuffer.isView(element)) {
          buffer = Buffer.from(
            element.buffer,
            element.byteOffset,
            element.byteLength,
          )
        } else if (element instanceof ArrayBuffer) {
          buffer = Buffer.from(element)
        } else if (element instanceof Blob) {
          buffer = element.buffer
        } else {
          buffer = Buffer.from(
            typeof element === 'string' ? element : String(element),
          )
        }

        buffers.push(buffer)
      }
    }

    this.buffer = Buffer.concat(buffers)

    const type =
      options &&
      options.type !== undefined &&
      String(options.type).toLowerCase()

    if (type && !/[^\u0020-\u007E]/.test(type)) {
      this[TYPE] = type
    }
  }

  get size() {
    return this[CLOSED] ? 0 : this.buffer.length
  }

  get type() {
    return this[TYPE]
  }

  get isClosed() {
    return this[CLOSED]
  }

  slice() {
    const { size } = this

    const start = arguments[0]
    const end = arguments[1]
    let relativeStart, relativeEnd

    if (start === undefined) {
      relativeStart = 0
    } else if (start < 0) {
      relativeStart = Math.max(size + start, 0)
    } else {
      relativeStart = Math.min(start, size)
    }

    if (end === undefined) {
      relativeEnd = size
    } else if (end < 0) {
      relativeEnd = Math.max(size + end, 0)
    } else {
      relativeEnd = Math.min(end, size)
    }

    const span = Math.max(relativeEnd - relativeStart, 0)

    const { buffer } = this

    const slicedBuffer = buffer.slice(relativeStart, relativeStart + span)

    const blob = new Blob([], { type: arguments[2] })
    blob.buffer = slicedBuffer
    blob[CLOSED] = this[CLOSED]
    return blob
  }

  close() {
    this[CLOSED] = true
  }
}

Object.defineProperty(Blob.prototype, Symbol.toStringTag, {
  value: 'BlobPrototype',
  writable: false,
  enumerable: false,
  configurable: true,
})

const bufferToStream = myBuffer => {
  const tmp = new Duplex()
  tmp.push(myBuffer)
  tmp.push(null)
  return tmp
}

const base64toBlob = (base64Data, contentType) => {
  const sliceSize = 1024
  const arr = base64Data.split(',')
  const byteCharacters = atob(arr[1])
  const bytesLength = byteCharacters.length
  const slicesCount = Math.ceil(bytesLength / sliceSize)
  const byteArrays = new Array(slicesCount)

  for (let sliceIndex = 0; sliceIndex < slicesCount; sliceIndex += 1) {
    const begin = sliceIndex * sliceSize
    const end = Math.min(begin + sliceSize, bytesLength)

    const bytes = new Array(end - begin)

    for (let offset = begin, i = 0; offset < end; i += 1, offset += 1) {
      bytes[i] = byteCharacters[offset].charCodeAt(0)
    }

    byteArrays[sliceIndex] = new Uint8Array(bytes)
  }

  return new Blob(byteArrays, { type: contentType || '' })
}

const base64Images = source => {
  const $ = cheerio.load(source)

  const images = []

  $('img').each((i, elem) => {
    const $elem = $(elem)

    const src = $elem.attr('src')
    const base64Match = src.match(/[^:]\w+\/[\w\-+.]+(?=;base64,)/)

    if (base64Match) {
      const mimeType = base64Match[0]
      const blob = base64toBlob(src, mimeType)
      const mimeTypeSplit = mimeType.split('/')
      const extFileName = mimeTypeSplit[1]

      images.push({
        blob,
        dataSrc: src,
        filename: `Image${i + 1}.${extFileName}`,
        index: i,
      })
    }
  })

  return images
}

const uploadImage = async (image, manuscriptId) => {
  const { blob, filename } = image

  const fileStream = bufferToStream(Buffer.from(blob.buffer, 'binary'))

  const createdFile = await createFile(fileStream, filename, {
    tags: ['manuscriptImage'],
    objectId: manuscriptId,
  })

  return createdFile
}

exports.up = async () => {
  try {
    return useTransaction(async trx => {
      const manuscripts = await Manuscript.query(trx)

      return Promise.all(
        manuscripts.map(async manuscript => {
          const { source } = manuscript.meta

          if (typeof source === 'string') {
            const images = base64Images(source)

            if (images.length > 0) {
              const uploadedImages = []

              await Promise.all(
                map(images, async image => {
                  if (image.blob) {
                    const uploadedImage = await uploadImage(
                      image,
                      manuscript.id,
                    )

                    uploadedImages.push(uploadedImage)
                  }
                }),
              )

              const uploadedImagesWithUrl =
                await getFilesWithUrl(uploadedImages)

              const $ = cheerio.load(source)

              map(images, (image, index) => {
                const elem = $('img').get(image.index)
                const $elem = $(elem)
                $elem.attr('data-fileid', uploadedImagesWithUrl[index].id)
                $elem.attr('alt', uploadedImagesWithUrl[index].name)
                $elem.attr(
                  'src',
                  uploadedImagesWithUrl[index].storedObjects.find(
                    storedObject => storedObject.type === 'medium',
                  ).url,
                )
              })

              manuscript.meta.source = $.html()

              await Manuscript.query().updateAndFetchById(
                manuscript.id,
                manuscript,
              )
            }
          }
        }),
      )
    })
  } catch (error) {
    throw new Error(error)
  }
}
