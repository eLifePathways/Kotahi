const { Manuscript } = require('../models')

const generateMovingAverages = require('../utils/movingAverages')

/** Get date string in the form yyyy-mm-dd */
const getIsoDateString = date => (date ? date.toISOString().slice(0, 10) : null)

/** Find the first element that meets the startCondition function, and return the subarray starting at that index.
 * If no element meets startCondition, return an empty array
 */
const trim = (array, startCondition) => {
  const start = array.findIndex(element => startCondition(element))
  if (start < 0) return []
  return array.slice(start)
}

const day = 24 * 60 * 60 * 1000
const week = day * 7

/** Return the datetime of the most recent midnight in the given timezone */
const getLastMidnightInTimeZone = timeZoneOffset => {
  const transposedDate = new Date(Date.now() + timeZoneOffset * 60000)
  transposedDate.setUTCHours(0)
  transposedDate.setUTCMinutes(0)
  transposedDate.setUTCSeconds(0)
  transposedDate.setUTCMilliseconds(0)
  return new Date(transposedDate.getTime() - timeZoneOffset * 60000)
}

const getVersionsAsArray = manuscript => {
  if (manuscript.manuscriptVersions)
    return [manuscript, ...manuscript.manuscriptVersions]
  return [manuscript]
}

/** Find the latest manuscript version providing non-falsey result for func; return that result. Otherwise null.
 * func should expect as its single parameter a manuscript version.
 * Assumes versions are already date-ordered.
 */
const seekFromLatestVersion = (m, func) => {
  const manuscripts = getVersionsAsArray(m)

  for (let i = manuscripts.length - 1; i >= 0; i -= 1) {
    const result = func(manuscripts[i])
    if (result) return result
  }

  return null
}

/** Get the last manuscript version. Assumes the versions are already date ordered. */
const getLastVersion = m => {
  if (!m.manuscriptVersions || m.manuscriptVersions.length <= 0) return m
  return m.manuscriptVersions[m.manuscriptVersions.length - 1]
}

const getFinalStatus = m => getLastVersion(m).status

const getLastPublishedDate = manuscript =>
  seekFromLatestVersion(manuscript, m => m.published)

const getDateRangeSummaryStats = async (startDate, endDate, groupId) => {
  return Manuscript.getSummaryStatsForDateRange(groupId, startDate, endDate)
}

const getPublishedTodayCount = async (groupId, timeZoneOffset) => {
  const midnight = getLastMidnightInTimeZone(timeZoneOffset)

  return Manuscript.countPublishedSince(groupId, midnight)
}

const getRevisingNowCount = async groupId => {
  return Manuscript.countRevisingNow(groupId)
}

const getDurationsTraces = async (startDate, endDate, groupId) => {
  const windowSizeForAvg = week
  const smoothingSize = day
  const dataStart = startDate - windowSizeForAvg / 2

  const rows = await Manuscript.getReviewAndCompletionDurations(
    groupId,
    dataStart,
    endDate,
  )

  const durations = rows.map(r => ({
    date: Number(r.submitted_ms),
    reviewDuration:
      r.review_duration_days === null ? null : Number(r.review_duration_days),
    fullDuration:
      r.full_duration_days === null ? null : Number(r.full_duration_days),
  }))

  const [reviewAvgs, completionAvgs] = generateMovingAverages(
    durations,
    windowSizeForAvg,
    smoothingSize,
  )

  return {
    durationsData: trim(durations, d => d.date >= startDate),
    reviewAvgsTrace: reviewAvgs,
    completionAvgsTrace: completionAvgs,
  }
}

const getDailyAverageStats = async (startDate, endDate, groupId) => {
  const dataStart = startDate - 365 * day // TODO: any better way to ensure we get all manuscripts still in progress during this date range?

  const manuscripts = await Manuscript.findFirstVersionsWithCompletedDate(
    groupId,
    dataStart,
    endDate,
  )

  const orderedSubmissionDates = manuscripts
    .map(m => m.submittedDate)
    .filter(Boolean)
    .sort((a, b) => new Date(a) - new Date(b))

  const orderedCompletionDates = manuscripts
    .map(m => m.completedDate ?? m.completeddate)
    .filter(Boolean)
    .sort((a, b) => new Date(a) - new Date(b))

  const publishedTotal = manuscripts.filter(m => {
    return m.published && m.published >= startDate
  }).length

  let submI = 0
  let compI = 0
  let inProgressCount = 0

  let dailyInProgressTotal = 0

  for (let d = startDate + day; d < endDate; d += day) {
    while (
      submI < orderedSubmissionDates.length &&
      orderedSubmissionDates[submI] <= d
    ) {
      inProgressCount += 1
      submI += 1
    }

    while (
      compI < orderedCompletionDates.length &&
      orderedCompletionDates[compI] <= d
    ) {
      inProgressCount -= 1
      compI += 1
    }

    dailyInProgressTotal += inProgressCount
  }

  const durationDays = (endDate - startDate) / day

  return {
    avgPublishedDailyCount: publishedTotal / durationDays,
    avgInProgressDailyCount: dailyInProgressTotal / durationDays,
  }
}

/** Get all users that are members of the given team or teams. teamNameOrNames may be a string or array of strings. */
const getTeamUsers = (manuscript, teamNameOrNames) => {
  const teamNames = Array.isArray(teamNameOrNames)
    ? teamNameOrNames
    : [teamNameOrNames]

  const users = []
  const manuscripts = getVersionsAsArray(manuscript)
  manuscripts.forEach(m => {
    m.teams
      .filter(t => teamNames.includes(t.displayName))
      .forEach(team => {
        team.users.forEach(user => {
          if (!users.some(u => u.id === user.id)) users.push(user)
        })
      })
  })

  return users
}

const getManuscriptsActivity = async (startDate, endDate, groupId) => {
  const rows = await Manuscript.getActivityByManuscript(
    groupId,
    startDate,
    endDate,
  )

  return rows.map(r => ({
    shortId: r.short_id.toString(),
    entryDate: getIsoDateString(r.entry_date),
    title: r.title,
    authors: r.authors || [],
    editors: r.editors || [],
    reviewers: r.reviewers || [],
    status: r.status,
    publishedDate: getIsoDateString(r.published_date),
    versionReviewDurations: [], // unchanged – still derived elsewhere
  }))
}

const getEditorsActivity = async (startDate, endDate, groupId) => {
  return Manuscript.getActivityByEditor(groupId, startDate, endDate)
}

const getReviewersActivity = async (startDate, endDate, groupId) => {
  const rows = await Manuscript.getActivityByReviewer(
    groupId,
    startDate,
    endDate,
  )

  return rows.map(r => ({
    name: r.name,
    invitesCount: Number(r.invitesCount),
    declinedCount: Number(r.declinedCount),
    reviewsCompletedCount: Number(r.reviewsCompletedCount),
    avgReviewDuration:
      r.avgReviewDuration === null ? null : Number(r.avgReviewDuration),
    reccReviseCount: Number(r.reccReviseCount),
    reccAcceptCount: Number(r.reccAcceptCount),
    reccRejectCount: Number(r.reccRejectCount),
  }))
}

const getAuthorsActivity = async (startDate, endDate, groupId) => {
  const manuscripts = await Manuscript.findFirstVersionsWithTeamUsers(
    groupId,
    startDate,
    endDate,
  )

  const authorsData = {} // Map by user id

  manuscripts.forEach(m => {
    getTeamUsers(m, 'Author').forEach(a => {
      let authorData = authorsData[a.id]

      if (!authorData) {
        authorData = {
          name: a.username || a.email || a.defaultIdentity.identifier,
          unsubmittedCount: 0,
          submittedCount: 0,
          rejectedCount: 0,
          revisionCount: 0,
          acceptedCount: 0,
          publishedCount: 0,
        }
        authorsData[a.id] = authorData
      }

      if (!m.status || m.status === 'new') authorData.unsubmittedCount += 1
      else authorData.submittedCount += 1
      const finalStatus = getFinalStatus(m)
      const wasPublished = !!getLastPublishedDate(m)
      if (finalStatus === 'rejected') authorData.rejectedCount += 1
      if (finalStatus === 'revise' || m.manuscriptVersions.length > 0)
        authorData.revisionCount += 1
      if (wasPublished || finalStatus === 'accepted')
        authorData.acceptedCount += 1
      if (wasPublished) authorData.publishedCount += 1
    })
  })

  return Object.values(authorsData)
}

module.exports = {
  getAuthorsActivity,
  getDailyAverageStats,
  getDateRangeSummaryStats,
  getDurationsTraces,
  getEditorsActivity,
  getManuscriptsActivity,
  getPublishedTodayCount,
  getReviewersActivity,
  getRevisingNowCount,
}
