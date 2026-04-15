const {
  getFilesWithUrl,
  replaceImageSrc,
} = require('../../utils/fileStorageUtils')

const Manuscript = require('./manuscript.model')

const metaSourceLoader = async (manuscriptMetas, options = {}) => {
  const { trx } = options

  const results = new Array(manuscriptMetas.length).fill(null)

  const withSource = manuscriptMetas
    .map((m, index) => ({ m, index }))
    .filter(({ m }) => typeof m.source === 'string')

  if (!withSource.length) return results

  const needFiles = withSource.filter(
    ({ m }) => !Array.isArray(m.manuscriptFiles),
  )

  let filesByManuscriptId = new Map()

  if (needFiles.length) {
    const ids = needFiles.map(({ m }) => m.manuscriptId)
    const rows = await Manuscript.relatedQuery('files', trx).for(ids)

    filesByManuscriptId = rows.reduce((acc, file) => {
      if (!acc.has(file.manuscriptId)) acc.set(file.manuscriptId, [])
      acc.get(file.manuscriptId).push(file)
      return acc
    }, new Map())
  }

  await Promise.all(
    withSource.map(async ({ m, index }) => {
      const files =
        m.manuscriptFiles || filesByManuscriptId.get(m.manuscriptId) || []

      const filesWithUrl = await getFilesWithUrl(files)
      results[index] = await replaceImageSrc(m.source, filesWithUrl, 'medium')
    }),
  )

  return results
}

module.exports = { metaSourceLoader }
