const Manuscript = require('../../models/manuscript/manuscript.model')
const Config = require('../../models/config/config.model')

const { getUserRolesInManuscript } = require('../user.controllers')

const getManuscriptLink = async (appUrl, userId, manuscriptId) => {
  const roles = manuscriptId
    ? await getUserRolesInManuscript(userId, manuscriptId)
    : {}

  let manuscriptPageUrl = `${appUrl}/versions/${manuscriptId}`

  if (roles?.groupManager || roles?.anyEditor) {
    manuscriptPageUrl += '/decision?tab=decision'
  } else if (roles?.reviewer || roles?.collaborativeReviewer) {
    manuscriptPageUrl += '/review'
  } else if (roles?.author) {
    manuscriptPageUrl += '/submit'
  } else {
    manuscriptPageUrl = `${appUrl}/dashboard`
  }

  return manuscriptPageUrl
}

const isLatestVersionOfManuscript = async (versionId, options = {}) => {
  const { trx } = options

  const latestVersionId = await Manuscript.getLatestVersionId(versionId, {
    trx,
  })

  return versionId === latestVersionId
}

const archiveOldManuscripts = async groupId => {
  const activeConfig = await Config.getCached(groupId)

  const { archivePeriodDays } = activeConfig.formData.manuscript
  if (
    typeof archivePeriodDays !== 'number' ||
    Number.isNaN(archivePeriodDays) ||
    archivePeriodDays < 1
  ) {
    return
  }

  const cutoffDate = new Date(
    new Date().valueOf() - archivePeriodDays * 86400000, // subtracting milliseconds of ARCHIVE_PERIOD_DAYS
  )

  const archivedCount = await Manuscript.archiveNewUnlabelledCreatedBefore(
    groupId,
    cutoffDate,
  )

  // eslint-disable-next-line no-console
  console.info(
    `Automatically archived ${archivedCount} new, unlabelled manuscripts older than ${archivePeriodDays} days.`,
  )
}

/** Populates hasOverdueTasksForUser field of each manuscript IN PLACE.
 * A task is overdue for the current user if the user is an editor of the manuscript, or the task's assignee. */
const manuscriptHasOverdueTasksForUser = (manuscript, userId) => {
  const now = Date.now()

  const isEditor = manuscript.teams
    .filter(t => ['editor', 'handlingEditor', 'seniorEditor'].includes(t.role))
    .some(t => t.members.some(m => m.userId === userId))

  for (let i = 0; i < manuscript.tasks.length; i += 1) {
    const task = manuscript.tasks[i]

    if (
      (isEditor || task.assigneeUserId === userId) &&
      task.status === 'In progress' &&
      task.dueDate &&
      new Date(task.dueDate) < now
    ) {
      return true
    }
  }

  return false
}

module.exports = {
  archiveOldManuscripts,
  manuscriptHasOverdueTasksForUser,
  isLatestVersionOfManuscript,
  getManuscriptLink,
}
