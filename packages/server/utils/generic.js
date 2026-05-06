const isValidURL = string => {
  try {
    /* eslint-disable-next-line no-new */
    new URL(string)
    return true
    /* eslint-disable-next-line */
  } catch (error) {
    return false
  }
}

const getExtensionFromMimetype = mimeType => {
  const mimeMap = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/bmp': '.bmp',
    'image/tiff': '.tiff',
    'image/x-icon': '.ico',
    'application/pdf': '.pdf',
    'application/zip': '.zip',
    'text/html': '.html',
    'text/css': '.css',
    'text/javascript': '.js',
    'audio/mpeg': '.mp3',
    'audio/wav': '.wav',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
  }

  return mimeMap[mimeType] || null
}

module.exports = { isValidURL, getExtensionFromMimetype }
