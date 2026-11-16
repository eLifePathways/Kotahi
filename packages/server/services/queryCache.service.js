const { LRUCache } = require('lru-cache')

const { logger } = require('@coko/server')

const cache = new LRUCache({
  max: 500,
  ttl: 10000,
})

const queryFunctions = {
  userIsGM: async (userId, groupId) => {
    const User = require('../models/user/user.model')
    return User.hasRoleOnObject(userId, 'groupManager', groupId)
  },
  /** Gets the manuscript that owns a particular file, either directly or via one of its review objects.
   * Note that this will throw an exception for files  not owned by a manuscript,
   * such as CMS files.
   */
  msOfFile: async fileId => {
    const { File } = require('@coko/server')
    const Review = require('../models/review/review.model')
    const Manuscript = require('../models/manuscript/manuscript.model')

    const file = await File.findById(fileId, { throwIfNotFound: false })

    if (!file?.objectId) {
      logger.error('File without objectId encountered:', file)
      return null
    }

    // The file may belong to a review or directly to a manuscript
    const review = await Review.findById(file.objectId, {
      throwIfNotFound: false,
    })

    const manuscript = await Manuscript.findById(
      review ? review.manuscriptId : file.objectId,
      { throwIfNotFound: false },
    )

    return manuscript
  },
  userIsAdmin: async userId => {
    const User = require('../models/user/user.model')
    return User.hasGlobalRole(userId, 'admin')
  },
  userIsGroupAdmin: async (userId, groupId) => {
    const User = require('../models/user/user.model')
    return User.hasRoleOnObject(userId, 'groupAdmin', groupId)
  },
  userIsEditor: async (userId, manuscriptId) => {
    const User = require('../models/user/user.model')
    return User.isEditorOfManuscript(userId, manuscriptId)
  },
  userIsEditorOfAnyManuscript: async userId => {
    const User = require('../models/user/user.model')
    return User.isEditorOfAnyManuscript(userId)
  },
  userHasRoleInMsFamily: async (userId, manuscriptId) => {
    const Manuscript = require('../models/manuscript/manuscript.model')
    return Manuscript.userHasRoleInAnyVersion(userId, manuscriptId)
  },
  defaultIdentityOfUser: async userId => {
    const Identity = require('../models/identity/identity.model')
    return Identity.findOne({ userId, isDefault: true })
  },
  // TODO: rename this otherVersionsOfMs
  subVersionsOfMs: async manuscriptId => {
    const Manuscript = require('../models/manuscript/manuscript.model')
    return Manuscript.getOtherVersions(manuscriptId)
  },
  teamsForObject: async objectId => {
    const Team = require('../models/team/team.model')
    return (await Team.find({ objectId })).result
  },
  membersOfTeam: async teamId => {
    const TeamMember = require('../models/teamMember/teamMember.model')
    return (await TeamMember.find({ teamId })).result
  },
  userForTeamMember: async teamMemberId => {
    const TeamMember = require('../models/teamMember/teamMember.model')

    const teamMember = await TeamMember.findById(teamMemberId, {
      related: 'user',
      throwIfNotFound: false,
    })

    return teamMember?.user ?? undefined
  },
  submitterOfMs: async manuscriptId => {
    const Manuscript = require('../models/manuscript/manuscript.model')
    return Manuscript.getSubmitter(manuscriptId)
  },
  form: async (category, purpose, groupId) => {
    const Form = require('../models/form/form.model')
    const { result: form } = await Form.find({ category, purpose, groupId })
    if (!form || !form.length) throw new Error(`No form found for "${purpose}"`)
    return form[0]
  },
}

const pendingFetchPromises = {}

const fetchMethod = async key => {
  // lru-cache doesn't account for a second identical cache query arriving while the first is still unsettled.
  // The following logic prevents multiple simultaneous duplicate queries.
  const pendingPromise = pendingFetchPromises[key]
  if (pendingPromise) return pendingPromise // Another await on the same promise!

  const [queryType, ...params] = key.split(':')
  const queryFunction = queryFunctions[queryType]
  if (!queryFunction)
    throw new Error(`cachedGet called for unknown queryType '${queryType}'`)
  const promise = queryFunction(...params)
  pendingFetchPromises[key] = promise

  try {
    const result = await promise
    return result
  } finally {
    delete pendingFetchPromises[key]
  }
}

/** Get data from cache (if present) or else from DB. The cache evicts items that have remained in it
 * longer than 10 seconds, and also evicts least-recently-used items if maximum size is reached.
 * @param key A string containing the query function name and its parameters, separated by colons
 * e.g. 'userIsGM:ac9da7c9-f8ba-4b2e-9942-a7471adb64c0:b6c1c340-cbaf-4752-938b-2813c1828a06'
 */
const cachedGet = async key => {
  const cachedResult = cache.get(key)
  if (cachedResult !== undefined) return cachedResult

  const fetchResult = await fetchMethod(key)
  cache.set(key, fetchResult)
  return fetchResult
}

const evictFromCache = key => cache.delete(key)

/** Evict all entries from the cache whose keys start with the supplied prefix */
const evictFromCacheByPrefix = keyPrefix => {
  for (const key of cache.keys())
    if (key.startsWith(keyPrefix)) cache.delete(key)
}

module.exports = { cachedGet, evictFromCache, evictFromCacheByPrefix }
