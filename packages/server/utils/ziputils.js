const path = require('path')
const archiver = require('archiver')
const crypto = require('crypto')
const list = require('list-contents')
const fs = require('fs-extra')

const dirContents = async pathString =>
  new Promise((resolve, reject) => {
    list(pathString, o => {
      if (o.error) reject(o.error)
      resolve(o.files)
    })
  })

const zipper = async dirPath => {
  try {
    const tempPath = path.join(
      `${process.cwd()}`,
      'tmp',
      `${crypto.randomBytes(32).toString('hex')}`,
    )

    await fs.ensureDir(tempPath)
    const contents = await dirContents(dirPath)
    return new Promise((resolve, reject) => {
      const destination = path.join(
        tempPath,
        `${crypto.randomBytes(32).toString('hex')}.zip`,
      )

      const output = fs.createWriteStream(destination)
      const archive = archiver('zip')
      // pipe archive data to the file
      archive.pipe(output)

      contents.forEach(item => {
        const absoluteFilePath = path.join(dirPath, item)
        archive.append(fs.createReadStream(absoluteFilePath), { name: item })
      })
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
