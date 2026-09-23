const { uuid } = require('@coko/server')

const PublishedArtifact = require('../../models/publishedArtifact/publishedArtifact.model')

const upsertArtifact = async artifact => {
  let priorArtifact = null

  if (artifact.externalId) {
    priorArtifact = await PublishedArtifact.query().select('id').findOne({
      manuscriptId: artifact.manuscriptId,
      externalId: artifact.externalId,
    })
  }

  const artifactId = priorArtifact ? priorArtifact.id : uuid()

  if (priorArtifact) {
    await PublishedArtifact.patchById(artifactId, {
      ...artifact,
      id: artifactId,
    })
  } else {
    await PublishedArtifact.query().insert({
      ...artifact,
      id: artifactId,
    })
  }

  return artifactId
}

const deleteArtifact = async (manuscriptId, externalId) => {
  await PublishedArtifact.query().delete().where({
    manuscriptId,
    externalId,
  })
}

module.exports = { upsertArtifact, deleteArtifact }
