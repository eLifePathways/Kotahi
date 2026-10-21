const { raw } = require('objection')
const { File, useTransaction } = require('@coko/server')

const Manuscript = require('../manuscript.model')

const {
  getImageFileIdsInSource,
  remapImageFileIds,
} = require('../../../utils/fileStorageUtils')

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const originalKey = file =>
  (file.storedObjects || []).find(
    storedObject => storedObject.type === 'original',
  )?.key

/**
 * createNewVersion used to copy a manuscript's files with new ids but leave the
 * copied source's data-fileid pointing at the previous version's files. Point
 * them at the version's own copies instead, matched by storage key (copies
 * share their S3 objects). Ids with no matching copy are left alone.
 */
exports.up = async () => {
  await useTransaction(async trx => {
    const versions = await Manuscript.query(trx)
      .select('id', 'meta')
      .whereNotNull('parentId')
      .where(raw("meta->>'source' LIKE '%data-fileid%'"))

    // Sequentially, to keep the load on the database down
    for (const version of versions) {
      const { source } = version.meta
      const referencedIds = getImageFileIdsInSource(source)

      // eslint-disable-next-line no-await-in-loop
      const ownFiles = await File.query(trx).where({ objectId: version.id })
      const ownIds = new Set(ownFiles.map(file => file.id))

      const foreignIds = [...referencedIds].filter(
        id => !ownIds.has(id) && UUID_REGEX.test(id),
      )

      if (!foreignIds.length) continue

      // eslint-disable-next-line no-await-in-loop
      const foreignFiles = await File.query(trx).whereIn('id', foreignIds)

      const ownIdsByKey = new Map()

      ownFiles.forEach(file => {
        const key = originalKey(file)
        if (key && !ownIdsByKey.has(key)) ownIdsByKey.set(key, file.id)
      })

      const idMap = new Map()

      foreignFiles.forEach(file => {
        const ownId = ownIdsByKey.get(originalKey(file))
        if (ownId) idMap.set(file.id, ownId)
      })

      if (!idMap.size) continue

      // eslint-disable-next-line no-await-in-loop
      await Manuscript.query(trx)
        .findById(version.id)
        .patch({
          meta: { ...version.meta, source: remapImageFileIds(source, idMap) },
        })
    }
  })
}

exports.down = async () => {
  // No rollback: the old ids pointed at the previous version's files, and the
  // new ones point at copies of the same images.
}
