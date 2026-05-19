const { FileStorageConstructor } = require('@coko/server')

const cheerio = require('cheerio')
const find = require('lodash/find')

/* Get files with temporary, time-limited URLs generated */
const getFilesWithUrl = async (files, options = {}) => {
  const { s3: globalS3 } = options

  const filesWithUrl = await Promise.all(
    files.map(async file => {
      file.storedObjects = await Promise.all(
        file.storedObjects.map(async storedObject => {
          const url = await new FileStorageConstructor(
            file.s3 || globalS3,
          ).getURL(storedObject.key)

          return { ...storedObject, url }
        }),
      )
      return file
    }),
  )

  return filesWithUrl
}

/* Get file with temporary, time-limited URL generated */
const getFileWithUrl = async (file, options = {}) => {
  const { s3 } = options

  file.storedObjects = await Promise.all(
    file.storedObjects.map(async storedObject => {
      const url = await new FileStorageConstructor(s3).getURL(storedObject.key)
      return { ...storedObject, url }
    }),
  )
  return file
}

/* Set Url for file */
const setFileUrls = async (storedObjects, options = {}) => {
  const { s3 } = options

  const updatedStoredObjects = await Promise.all(
    Object.keys(storedObjects).map(async key => {
      const storedObject = storedObjects[key]
      storedObject.url = await new FileStorageConstructor(s3).getURL(
        storedObject.key,
      )
      return storedObject
    }),
  )

  return updatedStoredObjects
}

/** Replace file URLs in source html with regenerated URLs to files of specified size */
const replaceImageSrc = async (source, files, size) => {
  const $ = cheerio.load(source)
  const fileIds = []

  $('img').each((i, elem) => {
    const $elem = $(elem)
    const fileId = $elem.attr('data-fileid')

    if (fileId && fileId !== 'null') {
      fileIds.push(fileId)
    }
  })

  $('img').each((i, elem) => {
    const $elem = $(elem)
    const fileId = $elem.attr('data-fileid')

    const correspondingFile = find(files, { id: fileId })

    if (correspondingFile) {
      const { url } = correspondingFile.storedObjects.find(
        storedObject => storedObject.type === size,
      )

      $elem.attr('src', url)

      if (correspondingFile.alt) {
        $elem.attr('alt', correspondingFile.alt)
      }
    }
  })

  return $.html()
}

const replaceImageFromNunjucksTemplate = (source, files, size) => {
  // const imageRegex = /<img[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*\bdata-id\s*=\s*["']([^"']+)["'][^>]*>/g

  const imageRegex = /<img[^>]+data-id=["']([^"']+)["'][^>]*>/g

  // Replace src attribute of each image tag with new src based on data-id property
  return source.replace(imageRegex, (match, dataId) => {
    const correspondingFile = find(files, { id: dataId })

    if (correspondingFile) {
      const { url } = correspondingFile.storedObjects.find(
        storedObject => storedObject.type === size,
      )

      return match.replace(/src=["'][^"']*["']/, `src="${url}"`)
    }

    return match
  })
}

/** Replace file URLs in source html with regenerated URLs to files of specified size */
const updateSrcUrl = async (source, files, size) => {
  const $ = cheerio.load(source)

  $('script[data-fileid], img[data-fileid], link[data-fileid]').each(
    (i, elem) => {
      const $elem = $(elem)
      const fileId = $elem.attr('data-fileid')

      const correspondingFile = find(files, { id: fileId })

      if (correspondingFile) {
        const { url } =
          correspondingFile.storedObjects.find(
            storedObject =>
              storedObject.type === size &&
              storedObject.mimetype.includes('image/'),
          ) || correspondingFile.storedObjects[0]

        if ($elem.is('script, img')) {
          $elem.attr('src', url)
        }

        // Update the 'href' attribute for link tags
        if ($elem.is('link')) {
          $elem.attr('href', url)
        }

        if (correspondingFile.alt) {
          $elem.attr('alt', correspondingFile.alt)
        }
      }
    },
  )

  return $.html()
}

/** Replace file URLs in source html with regenerated URLs to files of specified size,
 * plus attributes data-low-def, data-standard-def and data-hi-def with URIs of other
 * sized files.
 */
const replaceImageSrcResponsive = async (source, files) => {
  const $ = cheerio.load(source)
  const fileIds = []

  $('img').each((i, elem) => {
    const $elem = $(elem)
    const fileId = $elem.attr('data-fileid')

    if (fileId && fileId !== 'null') {
      fileIds.push(fileId)
    }
  })

  $('img').each((i, elem) => {
    const $elem = $(elem)
    const fileId = $elem.attr('data-fileid')

    const correspondingFile = find(files, { id: fileId })

    if (correspondingFile) {
      const { url } = correspondingFile.storedObjects.find(
        storedObject => storedObject.type === 'medium',
      )

      $elem.attr('src', url) // medium sized image url for frontend representation
      $elem.attr(
        'data-low-def',
        correspondingFile.storedObjects.find(
          storedObject => storedObject.type === 'small',
        ).url,
      ) // small sized image url as data-low-def
      $elem.attr('data-standard-def', url) // medium sized image url as data-standard-def
      $elem.attr(
        'data-hi-def',
        correspondingFile.storedObjects.find(
          storedObject => storedObject.type === 'original',
        ).url,
      ) // original image url as data-hi-def

      if (correspondingFile.alt) {
        $elem.attr('alt', correspondingFile.alt)
      }
    }
  })

  return $.html()
}

const imageFinder = (source, fileId) => {
  let found = false

  if (source && source.length > 0) {
    const $ = cheerio.load(source)

    $('img').each((i, elem) => {
      const $elem = $(elem)
      const fileIdAttribute = $elem.attr('data-fileid')

      if (fileIdAttribute === fileId) {
        found = true
      }
    })
  }

  return found
}

module.exports = {
  getFilesWithUrl,
  getFileWithUrl,
  replaceImageSrc,
  updateSrcUrl,
  replaceImageSrcResponsive,
  replaceImageFromNunjucksTemplate,
  imageFinder,
  setFileUrls,
}
