const path = require('path')
const archiver = require('archiver')
const crypto = require('crypto')
const fs = require('fs')
const { mkdir } = require('fs/promises')

const zipper = async dirPath => {
  try {
    const tempPath = path.join(
      `${process.cwd()}`,
      'tmp',
      `${crypto.randomBytes(32).toString('hex')}`,
    )

    await mkdir(tempPath, { recursive: true })
    return new Promise((resolve, reject) => {
      const destination = path.join(
        tempPath,
        `${crypto.randomBytes(32).toString('hex')}.zip`,
      )

      const output = fs.createWriteStream(destination)
      const archive = archiver('zip')
      // pipe archive data to the file
      archive.pipe(output)

      archive.directory(dirPath, false)
      archive.finalize()

      output.on('close', () => {
        resolve(destination)
      })
      archive.on('error', err => reject(err))
    })
  } catch (e) {
    throw new Error(e)
  }
}

const makeZip = async uploadsDir => {
  const zipPath = await zipper(path.join(`${process.cwd()}`, uploadsDir))
  return zipPath
}

module.exports = makeZip
