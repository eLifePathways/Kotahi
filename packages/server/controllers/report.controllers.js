const { Manuscript } = require('../models')

const generateMovingAverages = require('../utils/movingAverages')

const editorTeams = ['Senior Editor', 'Handling Editor', 'Editor']

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
  const formattedStartDate = new Date(startDate)
  const formattedEndDate = new Date(endDate)

  const query = Manuscript.query()
    .with('all_versions', qb =>
      qb
        .select('*', Manuscript.raw('COALESCE(parent_id, id) AS root_id'))
        .from('manuscripts')
        .where('group_id', groupId)
        .whereNot('is_hidden', true),
    )
    .with('root_manuscripts', qb =>
      qb
        .select('*')
        .from('all_versions')
        .whereNull('parent_id')
        .whereBetween('created', [formattedStartDate, formattedEndDate]),
    )
    .with('latest_versions', qb =>
      qb
        .distinctOn('root_id')
        .select('*')
        .from('all_versions')
        .orderBy('root_id')
        .orderBy('created', 'desc'),
    )

  const stats = await query
    .from('root_manuscripts as r')
    .leftJoin('latest_versions as lv', 'lv.root_id', 'r.id')
    .select(
      Manuscript.raw(`
      COUNT(*) FILTER (
        WHERE r.status IS NOT NULL
		AND r.status <> 'new'
      ) AS "submittedCount",

      COUNT(*) FILTER (
        WHERE r.status IS NULL
        OR r.status = 'new'
      ) AS "unsubmittedCount",

      COUNT(*) FILTER (
        WHERE EXISTS (
          SELECT 1 FROM all_versions v
            WHERE v.root_id = r.id
            AND v.status IS NOT NULL
            AND v.status <> 'new'
          )
          AND NOT EXISTS (
            SELECT 1 FROM all_versions v
            JOIN teams t ON t.object_id = v.id
            WHERE v.root_id = r.id
            AND t.display_name IN ('Editor', 'Senior Editor', 'Handling Editor')
          )
      ) AS "unassignedCount",

      COUNT(*) FILTER (
        WHERE EXISTS (
          SELECT 1 FROM all_versions v
          JOIN teams t ON t.object_id = v.id
          WHERE v.root_id = r.id
            AND t.display_name = 'Reviewers'
        )
      ) AS "reviewInvitedCount",

      COUNT(*) FILTER (
        WHERE EXISTS (
          SELECT 1 FROM all_versions v
          JOIN reviews rev ON rev.manuscript_id = v.id
          WHERE v.root_id = r.id
            AND rev.is_decision = false
        )
      ) AS "reviewInviteAcceptedCount",

      COUNT(*) FILTER (
        WHERE EXISTS (
          SELECT 1 FROM all_versions v
          JOIN reviews rev ON rev.manuscript_id = v.id
          WHERE v.root_id = r.id
            AND rev.is_decision = false
            AND rev.json_data->>'$verdict' IS NOT NULL
        )
      ) AS "reviewedCount",

      COUNT(*) FILTER (WHERE lv.status = 'rejected') AS "rejectedCount",
      COUNT(*) FILTER (WHERE lv.status IN ('revise','revising')) AS "revisingCount",
      COUNT(*) FILTER (WHERE lv.status IN ('accepted','published')) AS "acceptedCount",

      COUNT(*) FILTER (
        WHERE EXISTS (
          SELECT 1 FROM all_versions v
          WHERE v.root_id = r.id
            AND v.published IS NOT NULL
        )
      ) AS "publishedCount",

      COALESCE(AVG(
        EXTRACT(EPOCH FROM (
          (
            SELECT MAX(rev.updated)
            FROM all_versions v
            JOIN reviews rev ON rev.manuscript_id = v.id
            WHERE v.root_id = r.id
              AND rev.is_decision = false
          ) -
          (
            SELECT MIN(t.created)
            FROM all_versions v
            JOIN teams t ON t.object_id = v.id
            WHERE v.root_id = r.id
              AND t.display_name = 'Reviewers'
          )
        ))
      ) / 86400, 0) AS "avgReviewTimeDays",

      COALESCE(AVG(
        EXTRACT(EPOCH FROM (
          (
            SELECT MAX(v.published)
            FROM all_versions v
            WHERE v.root_id = r.id
          ) -
          COALESCE(r.submitted_date, r.created)
        ))
      ) / 86400, 0) AS "avgPublishTimeDays"
    `),
    )
    .first()

  return stats
}

const getPublishedTodayCount = async (groupId, timeZoneOffset) => {
  const midnight = getLastMidnightInTimeZone(timeZoneOffset)

  const query = Manuscript.query()
    .where({ groupId })
    .whereNot({ isHidden: true })
    .where('published', '>=', midnight) // TODO this will double-count manuscripts republished twice today

  return query.resultSize()
}

const getRevisingNowCount = async groupId => {
  return Manuscript.query()
    .where({ parentId: null, groupId })
    .whereNot({ isHidden: true })
    .whereRaw(
      `
        COALESCE(
          (
            SELECT status 
            FROM manuscripts AS versions
            WHERE versions.parent_id = manuscripts.id
            ORDER BY versions.created DESC, versions.id DESC
            LIMIT 1
          ),
          manuscripts.status
        ) IN ('revise', 'revising')
	`,
    )
    .resultSize()
}

const getDurationsTraces = async (startDate, endDate, groupId) => {
  const windowSizeForAvg = week
  const smoothingSize = day
  const dataStart = startDate - windowSizeForAvg / 2

  const rows = await Manuscript.knex().raw(
    `
    WITH all_versions AS (
      SELECT
        m.*,
        COALESCE(m.parent_id, m.id) AS root_id
      FROM manuscripts m
      WHERE m.group_id = :groupId
        AND m.is_hidden IS NOT TRUE
    ),
    root_manuscripts AS (
      SELECT *
      FROM all_versions
      WHERE parent_id IS NULL
        AND created >= to_timestamp(:dataStart / 1000.0)
        AND created <  to_timestamp(:endDate / 1000.0)
    ),
    review_bounds AS (
      SELECT
        v.root_id,
        MIN(t.created) FILTER (WHERE t.display_name = 'Reviewers') AS review_start,
        MAX(r.updated) FILTER (WHERE r.is_decision = false) AS review_end
      FROM all_versions v
      LEFT JOIN teams t ON t.object_id = v.id
      LEFT JOIN reviews r ON r.manuscript_id = v.id
      GROUP BY v.root_id
    ),
    completion_dates AS (
      SELECT
        v.root_id,
        MAX(v.published) AS published_date,
        MAX(r.updated) FILTER (
          WHERE r.is_decision = true
            AND r.json_data->>'$verdict' = 'reject'
        ) AS rejected_date
      FROM all_versions v
      LEFT JOIN reviews r ON r.manuscript_id = v.id
      GROUP BY v.root_id
    )
    SELECT
      EXTRACT(EPOCH FROM rm.submitted_date) * 1000 AS submitted_ms,
      EXTRACT(
        EPOCH FROM (
          rb.review_end - rb.review_start
        )
      ) / 86400 AS review_duration_days,
      EXTRACT(
        EPOCH FROM (
          COALESCE(cd.published_date, cd.rejected_date) - rm.submitted_date
        )
      ) / 86400 AS full_duration_days
    FROM root_manuscripts rm
    LEFT JOIN review_bounds rb ON rb.root_id = rm.id
    LEFT JOIN completion_dates cd ON cd.root_id = rm.id
    WHERE rm.submitted_date IS NOT NULL
      AND rm.submitted_date < to_timestamp(:endDate / 1000.0)
    ORDER BY rm.submitted_date ASC
    `,
    {
      groupId,
      dataStart,
      endDate,
    },
  )

  const durations = rows.rows.map(r => ({
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

  const manuscripts = await Manuscript.query()
    .select([
      'manuscripts.id',
      'manuscripts.submittedDate',
      'manuscripts.published',
      Manuscript.raw(`
      COALESCE(
        manuscripts.published,
        (
          SELECT r.created
          FROM reviews r
          WHERE r.manuscript_id = manuscripts.id
            AND r.is_decision = true
            AND r.json_data->>'$verdict' = 'reject'
          ORDER BY r.created DESC
          LIMIT 1
        )
      ) AS "completedDate"
    `),
    ])
    .where('manuscripts.created', '>=', new Date(dataStart))
    .where('manuscripts.created', '<', new Date(endDate))
    .where({ parentId: null, groupId })
    .whereNot({ isHidden: true })
    .orderBy('manuscripts.created')

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
  const rows = await Manuscript.knex().raw(
    `
    WITH all_versions AS (
      SELECT
        m.*,
        COALESCE(m.parent_id, m.id) AS root_id
      FROM manuscripts m
      WHERE m.group_id = ?
        AND m.is_hidden IS NOT TRUE
    ),

    root_manuscripts AS (
      SELECT *
      FROM all_versions
      WHERE parent_id IS NULL
        AND created >= to_timestamp(? / 1000.0)
        AND created <  to_timestamp(? / 1000.0)
    ),

    latest_versions AS (
      SELECT DISTINCT ON (root_id)
        *
      FROM all_versions
      ORDER BY root_id, created DESC
    ),

    team_users AS (
      SELECT
        t.object_id AS manuscript_id,
        t.display_name,
        json_agg(
          json_build_object(
            'id', u.id,
            'name', COALESCE(u.username, u.email, di.identifier, u.id::text),
            'status', tm.status,
			'username', u.username,
			'email', u.email
          )
          ORDER BY tm.created
        ) AS users
      FROM teams t
      JOIN team_members tm ON tm.team_id = t.id
      JOIN users u ON u.id = tm.user_id
      LEFT JOIN identities di
        ON di.user_id = u.id
       AND di.is_default = true
      GROUP BY t.object_id, t.display_name
    )

    SELECT
      r.short_id,
      r.created AS entry_date,
      lv.submission->>'$title' AS title,

      CASE
        WHEN lv.published IS NOT NULL
          AND lv.status IN ('accepted','published')
          THEN 'published'
        WHEN lv.published IS NOT NULL
          THEN 'published, ' || lv.status
        ELSE lv.status
      END AS status,

      lv.published AS published_date,

      json_agg(tu.users) FILTER (WHERE tu.display_name = 'Author') -> 0 AS authors,
		json_agg(tu.users) FILTER (
		WHERE tu.display_name IN ('Editor','Senior Editor','Handling Editor')
		) -> 0 AS editors,
		json_agg(tu.users) FILTER (WHERE tu.display_name = 'Reviewers') -> 0 AS reviewers

    FROM root_manuscripts r
    JOIN latest_versions lv ON lv.root_id = r.id
    LEFT JOIN team_users tu ON tu.manuscript_id = lv.id

    GROUP BY
      r.id,
      r.short_id,
      r.created,
      lv.status,
      lv.published,
      lv.submission

    ORDER BY r.created;
    `,
    [groupId, startDate, endDate],
  )

  return rows.rows.map(r => ({
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
  const { rows } = await Manuscript.knex().raw(
    `
    WITH root_manuscripts AS (
      SELECT m.*
      FROM manuscripts m
      WHERE m.parent_id IS NULL
        AND m.group_id = ?
        AND m.is_hidden IS NOT TRUE
        AND m.created >= to_timestamp(? / 1000.0)
        AND m.created <  to_timestamp(? / 1000.0)
    ),

    all_versions AS (
      SELECT
        m.id,
        COALESCE(m.parent_id, m.id) AS root_id,
        m.status,
        m.published,
        m.created
      FROM manuscripts m
      JOIN root_manuscripts rm
        ON rm.id = COALESCE(m.parent_id, m.id)
    ),

    latest_status AS (
      SELECT DISTINCT ON (root_id)
        root_id,
        status,
        published
      FROM all_versions
      ORDER BY root_id, created DESC
    ),

    revision_flags AS (
      SELECT
        parent_id AS root_id,
        TRUE AS was_revised
      FROM manuscripts
      WHERE parent_id IS NOT NULL
      GROUP BY parent_id
    ),

    reviewer_flags AS (
      SELECT DISTINCT
        v.root_id,
        TRUE AS given_to_reviewers
      FROM all_versions v
      JOIN teams t
        ON t.object_id = v.id
       AND t.display_name = 'Reviewers'
    ),

    editor_assignments AS (
      SELECT
        rm.id AS root_id,
        tm.user_id
      FROM root_manuscripts rm
      JOIN teams t
        ON t.object_id = rm.id
       AND t.display_name = ANY (?)
      JOIN team_members tm
        ON tm.team_id = t.id
    ),

    editor_names AS (
      SELECT
        u.id AS user_id,
        COALESCE(
          u.username,
          u.email,
          di.identifier,
          u.id::text
        ) AS name
      FROM users u
      LEFT JOIN identities di
        ON di.user_id = u.id
       AND di.is_default = TRUE
    )

    SELECT
      en.name,
      COUNT(*) AS "assignedCount",
      COUNT(*) FILTER (WHERE rf.given_to_reviewers) AS "givenToReviewersCount",
      COUNT(*) FILTER (WHERE rv.was_revised) AS "revisedCount",
      COUNT(*) FILTER (WHERE ls.status = 'rejected') AS "rejectedCount",
      COUNT(*) FILTER (
        WHERE ls.status = 'accepted' OR ls.published IS NOT NULL
      ) AS "acceptedCount",
      COUNT(*) FILTER (WHERE ls.published IS NOT NULL) AS "publishedCount"
    FROM editor_assignments ea
    JOIN editor_names en
      ON en.user_id = ea.user_id
    LEFT JOIN latest_status ls
      ON ls.root_id = ea.root_id
    LEFT JOIN reviewer_flags rf
      ON rf.root_id = ea.root_id
    LEFT JOIN revision_flags rv
      ON rv.root_id = ea.root_id
    GROUP BY en.name
    ORDER BY en.name
    `,
    [
      groupId,
      startDate,
      endDate,
      editorTeams, // array of editor team display names
    ],
  )

  return rows
}

const getReviewersActivity = async (startDate, endDate, groupId) => {
  const rows = await Manuscript.knex().raw(
    `
    WITH all_versions AS (
      SELECT
        m.*,
        COALESCE(m.parent_id, m.id) AS root_id
      FROM manuscripts m
      WHERE m.group_id = :groupId
        AND m.is_hidden IS NOT TRUE
    ),
    root_manuscripts AS (
      SELECT *
      FROM all_versions
      WHERE parent_id IS NULL
        AND created >= to_timestamp(:startDate / 1000.0)
        AND created <  to_timestamp(:endDate / 1000.0)
    ),
    reviewer_events AS (
      SELECT
        tm.user_id,
        tm.status AS invite_status,
        tm.created AS invite_date,
        r.updated AS review_updated,
        r.json_data->>'$verdict' AS verdict
      FROM all_versions v
      JOIN root_manuscripts rm ON rm.id = v.root_id
      JOIN teams t ON t.object_id = v.id
        AND t.display_name = 'Reviewers'
      JOIN team_members tm ON tm.team_id = t.id
      JOIN reviews r
        ON r.manuscript_id = v.id
       AND r.user_id = tm.user_id
       AND r.is_decision = false
    ),
    reviewer_names AS (
      SELECT
        u.id AS user_id,
        COALESCE(
          u.username,
          u.email,
          di.identifier,
          u.id::text
        ) AS name
      FROM users u
      LEFT JOIN identities di
        ON di.user_id = u.id
       AND di.is_default = true
    )
    SELECT
      rn.name,
      COUNT(*) AS "invitesCount",
      COUNT(*) FILTER (WHERE re.invite_status = 'declined') AS "declinedCount",
      COUNT(*) FILTER (WHERE re.invite_status = 'completed') AS "reviewsCompletedCount",
      AVG(EXTRACT(EPOCH FROM (re.review_updated - re.invite_date)) / 86400)
        AS "avgReviewDuration",
      COUNT(*) FILTER (WHERE re.verdict = 'revise') AS "reccReviseCount",
      COUNT(*) FILTER (WHERE re.verdict = 'accept') AS "reccAcceptCount",
      COUNT(*) FILTER (WHERE re.verdict = 'reject') AS "reccRejectCount"
    FROM reviewer_events re
    LEFT JOIN reviewer_names rn ON rn.user_id = re.user_id
    GROUP BY rn.name
    ORDER BY rn.name
    `,
    {
      groupId,
      startDate,
      endDate,
    },
  )

  return rows.rows.map(r => ({
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
  const query = Manuscript.query()
    .withGraphFetched(
      '[teams.[users.[defaultIdentity]], manuscriptVersions(orderByCreatedDesc).[teams.[users.[defaultIdentity]]]]',
    )
    .where('created', '>=', new Date(startDate))
    .where('created', '<', new Date(endDate))
    .where({ parentId: null, groupId })
    .whereNot({ isHidden: true })
    .orderBy('created')

  const manuscripts = await query

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
