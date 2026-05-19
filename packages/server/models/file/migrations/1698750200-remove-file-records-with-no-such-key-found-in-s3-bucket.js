const fs = require('fs-extra')
const path = require('path')

const {
  fileStorage,
  File,
  logger,
  tempFolderPath,
  useTransaction,
} = require('@coko/server')

exports.up = async () => {
  return useTransaction(async trx => {
    const files = await File.query(trx)

    // logger.info(`Total file records in table: ${files.length}`)

    const filesWithNoSuchKeyFound = []

    await Promise.all(
      files.map(async file => {
        const { key } = file.storedObjects.find(
          storedObject => storedObject.type === 'original',
        )

        const tempPath = path.join(tempFolderPath, `${file.id}_${key}`)

        try {
          await fileStorage.download(key, tempPath)
        } catch (error) {
          if (error.message === 'The specified key does not exist.') {
            filesWithNoSuchKeyFound.push(file)
          } else {
            logger.info(error.message, key)
            throw new Error(error)
          }
        }

        fs.unlinkSync(tempPath)
      }),
    )
    // .then(async res => {
    // logger.info(
    //   `Number of file records to be removed: ${filesWithNoSuchKeyFound.length}`,
    // )

    // const affectedRows = await Promise.all(
    //   filesWithNoSuchKeyFound.map(async f =>
    //     File.query(trx).deleteById(f.id),
    //   ),
    // )

    // logger.info(`Number of removed file records: ${affectedRows.length}`)
    // })
  })
}
