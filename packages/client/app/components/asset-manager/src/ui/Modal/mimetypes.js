import indexOf from 'lodash/indexOf'

const CSS = 'text/css'
const OTF = 'font/otf'
const TTF = 'font/ttf'
const WOFF = 'font/woff'
const WOFF2 = 'font/woff2'
const PNG = 'image/png'
const JPEG = 'image/jpeg'
const SVG = 'image/svg+xml'
const TIFF = 'image/tiff'
const BMP = 'image/bmp'
const images = [PNG, JPEG, SVG, TIFF, BMP]
const fonts = [OTF, TTF, WOFF, WOFF2]
const template = [OTF, TTF, WOFF, WOFF2, CSS]
const templateThumbnail = [PNG, JPEG]
const all = [OTF, TTF, WOFF, WOFF2, PNG, JPEG, SVG, TIFF, BMP, CSS]

const imageExtensions = [
  '.png',
  '.jpg',
  '.jpeg',
  '.svg',
  '.tiff',
  '.tif',
  '.bmp',
]

const templateFileExtensions = '.css, .otf, .woff, .woff2, .ttf'
const templateThumbnailExtensions = '.png, .jpg, .jpeg'
const assetManagerFileExtensions = '.png, .jpg, .jpeg, .svg, .tiff, .tif, .bmp'

const isSupportedAsset = (mimetype, scope = undefined) => {
  if (scope === 'images') {
    return indexOf(images, mimetype) !== -1
  }

  if (scope === 'fonts') {
    return indexOf(fonts, mimetype) !== -1
  }

  if (scope === 'templates') {
    return indexOf(template, mimetype) !== -1
  }

  // Should be deleted as thumbnails in Templates are useless
  if (scope === 'templateThumbnails') {
    return indexOf(templateThumbnail, mimetype) !== -1
  }

  return indexOf(all, mimetype) !== -1
}

export default {
  CSS,
  OTF,
  TTF,
  WOFF,
  WOFF2,
  PNG,
  JPEG,
  SVG,
  TIFF,
  BMP,
  all,
  supportedImages: images,
  supportedFonts: fonts,
  imageExtensions,
  templateFileExtensions,
  templateThumbnailExtensions,
  isSupportedAsset,
  assetManagerFileExtensions,
}
