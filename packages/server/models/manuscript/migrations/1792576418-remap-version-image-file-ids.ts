import { type Db } from '@coko/server'
import {
  getImageFileIdsInSource,
  remapImageFileIds,
  // Migrations are loaded as ES modules, which need the extension
  // eslint-disable-next-line import/extensions
} from '../../../utils/fileStorageUtils.js'

type StoredObject = { type: string; key: string }
type FileRow = { id: string; storedObjects: StoredObject[] | null }

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const originalKey = (file: FileRow): string | undefined =>
  (file.storedObjects || []).find(
    storedObject => storedObject.type === 'original',
  )?.key

/**
 * createNewVersion used to copy a manuscript's files with new ids but leave the
 * copied source's data-fileid pointing at the previous version's files. Point
 * them at the version's own copies instead, matched by storage key (copies
 * share their S3 objects). Ids with no matching copy are left alone.
 */
export async function up(db: Db): Promise<void> {
  return db.transaction(async trx => {
    const versions: { id: string; meta: { source: string } }[] = await trx(
      'manuscripts',
    )
      .select('id', 'meta')
      .whereNotNull('parentId')
      .whereRaw("meta->>'source' LIKE '%data-fileid%'")

    // Sequentially, to keep the load on the database down
    for (const version of versions) {
      const { source } = version.meta
      const referencedIds: Set<string> = getImageFileIdsInSource(source)

      // eslint-disable-next-line no-await-in-loop
      const ownFiles: FileRow[] = await trx('files')
        .select('id', 'storedObjects')
        .where({ objectId: version.id })

      const ownIds = new Set(ownFiles.map(file => file.id))

      const foreignIds = [...referencedIds].filter(
        id => !ownIds.has(id) && UUID_REGEX.test(id),
      )

      if (!foreignIds.length) continue

      // eslint-disable-next-line no-await-in-loop
      const foreignFiles: FileRow[] = await trx('files')
        .select('id', 'storedObjects')
        .whereIn('id', foreignIds)

      const ownIdsByKey = new Map<string, string>()

      ownFiles.forEach(file => {
        const key = originalKey(file)
        if (key && !ownIdsByKey.has(key)) ownIdsByKey.set(key, file.id)
      })

      const idMap = new Map<string, string>()

      foreignFiles.forEach(file => {
        const key = originalKey(file)
        const ownId = key && ownIdsByKey.get(key)
        if (ownId) idMap.set(file.id, ownId)
      })

      if (!idMap.size) continue

      // Only replace meta.source, leaving the rest of meta as it is
      // eslint-disable-next-line no-await-in-loop
      await trx('manuscripts')
        .where({ id: version.id })
        .update({
          meta: trx.raw("jsonb_set(meta, '{source}', to_jsonb(?::text))", [
            remapImageFileIds(source, idMap),
          ]),
        })
    }
  })
}

/**
 * No rollback: the old ids pointed at the previous version's files, and the
 * new ones point at copies of the same images.
 */
export async function down(): Promise<void> {}
