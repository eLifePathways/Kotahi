const { File } = require('@coko/server')

const filesLoader = async fileIds => {
  const files = await File.findByIds(fileIds, { throwIfNotFound: false })

  const byId = new Map(files.map(f => [f.id, f]))
  return fileIds.map(id => byId.get(id) ?? null)
}

module.exports = {
  filesLoader,
}
