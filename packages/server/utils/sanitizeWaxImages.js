const crypto = require('crypto')
const cheerio = require('cheerio')

const { createFile, request, logger } = require('@coko/server')

const { getExtensionFromMimetype, isValidURL } = require('./generic')

class WaxImageSanitizerError extends Error {
  constructor(message) {
    super(message)

    this.message = `Wax Image Sanitizer: ${this.message}`
    this.name = 'WaxImageSanitizerError'
  }
}

/**
 * Find images in content and
 * - capture src urls without a file id (ie. pasted images from url)
 * - capture base64 images without a file id
 *
 * Captured images are uploaded to s3 and a new file is created.
 * The new file id is stored on the image.
 *
 * Src urls are considered ephemeral and are deleted.
 * New src urls will be created on read from s3.
 */

const sanitizeWaxImages = async (content, manuscriptId) => {
  if (!content) return content

  if (typeof content !== 'string') {
    throw new WaxImageSanitizerError('Content needs to be an HTML string!')
  }

  const $ = cheerio.load(content)
  const images = []

  $('img').each((i, elem) => {
    if ($(elem).attr('alt') === 'Broken image') return

    images.push({
      element: $(elem),
      src: $(elem).attr('src'),
      fileId: $(elem).attr('data-fileid'),
    })
  })

  await Promise.all(
    images.map(async image => {
      const { fileId, src, element } = image

      const base64Match = src.match(/[^:]\w+\/[\w\-+.]+(?=;base64,)/)
      const isBase64 = !!base64Match
      const isURL = isValidURL(src)

      if (!fileId && !isURL && !isBase64) {
        throw new WaxImageSanitizerError(`Invalid src ${src}`)
      }

      // where src is a url, most likely pasted
      if (src && isURL && !isBase64 && !fileId) {
        logger.info(`Wax image sanitizer: Downloading image from url: ${src}`)

        let fileStream, extension

        try {
          const response = await request({
            url: src,
            responseType: 'stream',
          })

          fileStream = response.data

          const mimetype = response.headers.get('Content-Type').split(';')[0]
          const isImage = mimetype.match(/^image\//)

          if (!isImage) {
            throw new WaxImageSanitizerError(
              `Attempted to create image file from src ${src}, but mimetype is ${mimetype}`,
            )
          }

          extension = getExtensionFromMimetype(mimetype)
        } catch (e) {
          throw new WaxImageSanitizerError(
            `Failed to download image from ${src}: ${e.message}`,
          )
        }

        const raw = await crypto.randomBytes(16)
        const filename = `${raw.toString('hex')}.${extension}`

        const createdFile = await createFile(fileStream, filename, {
          tags: ['manuscriptImage'],
          objectId: manuscriptId,
        })

        element.attr('data-fileid', createdFile.id)
      }

      if (isBase64 && !fileId) {
        const raw = await crypto.randomBytes(16)
        const extension = base64Match[0].split('/')[1]
        const filename = `${raw.toString('hex')}.${extension}`

        const createdFile = await createFile(src, filename, {
          tags: ['manuscriptImage'],
          objectId: manuscriptId,
        })

        element.attr('data-fileid', createdFile.id)
      }

      element.removeAttr('src')
    }),
  )

  return $.html()
}

module.exports = sanitizeWaxImages
