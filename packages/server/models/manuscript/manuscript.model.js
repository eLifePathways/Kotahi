const omit = require('lodash/omit')
const omitBy = require('lodash/omitBy')
const pick = require('lodash/pick')
const { raw, ref } = require('objection')
const sortBy = require('lodash/sortBy')

const { BaseModel, config, useTransaction, uuid } = require('@coko/server')

// REFACTOR: models
const { evictFromCache } = require('../../services/queryCache.service')
const { remapImageFileIds } = require('../../utils/fileStorageUtils')

const {
  buildQueryForManuscriptSearchFilterAndOrder,
  buildSearchSnippets,
} = require('./manuscriptSearch')

const EDITOR_ROLES = ['editor', 'handlingEditor', 'seniorEditor']

const EDITOR_TEAM_DISPLAY_NAMES = ['Senior Editor', 'Handling Editor', 'Editor']

const VERSION_COPIED_TEAM_ROLES = [
  'author',
  'editor',
  'seniorEditor',
  'handlingEditor',
]

class Manuscript extends BaseModel {
  static get tableName() {
    return 'manuscripts'
  }

  constructor(properties) {
    super(properties)
    this.type = 'Manuscript'
  }

  static get modifiers() {
    return {
      orderByCreatedDesc(builder) {
        builder.orderBy('created', 'desc')
      },
      orderBy(query, sort) {
        if (!sort) {
          query.orderBy('created', 'desc')
        } else {
          const [sortName, sortDirection] = sort.split('_')

          if (sortName.includes('submission:')) {
            const fieldName = sortName.split(':')[1]
            const result = `LOWER(manuscripts.submission->>'${fieldName}') ${sortDirection}, id ${sortDirection}`
            query.orderByRaw(result)
          } else {
            const result = `${sortName} ${sortDirection}, id ${sortDirection}`
            query.orderByRaw(result)
          }
        }
      },
    }
  }

  async $afterUpdate(opt, queryContext) {
    await super.$afterUpdate(opt, queryContext)
    delete this.searchTsvector
  }

  async $afterInsert(opt, queryContext) {
    await super.$afterInsert(opt, queryContext)
    delete this.searchTsvector
  }

  async $afterFind(opt, queryContext) {
    await super.$afterFind(opt, queryContext)
    delete this.searchTsvector
  }

  static async getDecisions(manuscriptId, options = {}) {
    const Review = require('../review/review.model')

    return Review.query(options.trx).where({
      manuscriptId,
      isDecision: true,
    })
  }

  static async getReviews(manuscriptId, statuses = [], options = {}) {
    const Review = require('../review/review.model')

    const appliedStatuses = [].concat(statuses || [])

    const query = Review.query(options.trx).where({
      manuscriptId,
    })

    if (appliedStatuses.length === 0) return query

    return query
      .leftJoin('teams', 'teams.object_id', 'reviews.manuscript_id')

      .leftJoin('team_members', function () {
        this.on('team_members.team_id', '=', 'teams.id').andOn(
          'team_members.user_id',
          '=',
          'reviews.user_id',
        )
      })
      .where(outerBuilder => {
        outerBuilder
          .where(innerBuilder =>
            innerBuilder
              .where({ role: 'reviewer' })
              .whereIn('status', appliedStatuses),
          )
          .orWhere({ isImported: true })
      })
  }

  async getReviews(statuses = [], options = {}) {
    return Manuscript.getReviews(this.id, statuses, options)
  }

  async getDecisions(options = {}) {
    return Manuscript.getDecisions(this.id, options)
  }

  async getManuscriptAuthor(options = {}) {
    if (!this.id) {
      return null
    }

    const { trx } = options

    const manuscriptWithAuthors = await Manuscript.findById(this.id, {
      trx,
      related: 'teams(onlyAuthors).members(orderByCreatedDesc).user',
    })

    if (
      !manuscriptWithAuthors.teams.length ||
      !manuscriptWithAuthors.teams[0].members.length
    ) {
      return null
    }

    const authorTeam = manuscriptWithAuthors.teams[0]
    const author = authorTeam.members[0] // picking the author that has latest created date
    return author.user
  }

  async getManuscriptEditor(options = {}) {
    if (!this.id) {
      return null
    }

    const { trx } = options

    const manuscriptWithEditors = await Manuscript.findById(this.id, {
      trx,
      related: '[teams(onlyEditors).[members(orderByCreatedDesc).[user]]]',
    })

    if (
      !manuscriptWithEditors.teams.length ||
      !manuscriptWithEditors.teams[0].members.length
    ) {
      return null
    }

    const editorTeam = manuscriptWithEditors.teams[0]
    const editor = editorTeam.members[0] // picking the editor that has latest created date
    return editor.user
  }

  static async userIsReviewerOfAnyVersion(manuscriptId, userId, options = {}) {
    const { trx } = options

    const manuscript = await Manuscript.query(trx)
      .findById(manuscriptId)
      .select('parentId')

    const rootId = manuscript?.parentId || manuscriptId

    const reviewerStatuses = await Manuscript.query(trx)
      .where(builder =>
        builder.where('manuscripts.id', rootId).orWhere({ parentId: rootId }),
      )
      .joinRelated('teams')
      .join('team_members', 'team_members.teamId', 'teams.id') // joinRelated doesn't automate the 'teams.members' relation well, so we do it manually
      .whereIn('teams.role', ['reviewer', 'collaborativeReviewer'])
      .where('team_members.userId', userId)
      .select('team_members.status')

    return !!reviewerStatuses.length
  }

  static async getOtherVersions(manuscriptId, options = {}) {
    const { trx } = options

    const manuscript = await Manuscript.query(trx)
      .findById(manuscriptId)
      .select('parentId')

    if (!manuscript.parentId)
      return Manuscript.relatedQuery('manuscriptVersions', trx)
        .for(manuscriptId)
        .modify('orderByCreatedDesc')

    const parent = await Manuscript.findById(manuscript.parentId, { trx })

    const children = await Manuscript.relatedQuery('manuscriptVersions', trx)
      .for(parent.id)
      .modify('orderByCreatedDesc')

    return [...children.filter(v => v.id !== manuscriptId), parent]
  }

  static async getSubmitter(manuscriptId, options = {}) {
    return Manuscript.relatedQuery('submitter', options.trx)
      .for(manuscriptId)
      .first()
  }

  static async getDoisInGroup(groupId, isHidden, options = {}) {
    const rows = await Manuscript.query(options.trx)
      .select(raw("submission->>'$doi'").as('doi'))
      .whereRaw("submission->>'$doi' <> ''")
      .where({ groupId, isHidden })

    return rows.map(row => row.doi)
  }

  static async clearSubmitter(userId, options = {}) {
    return Manuscript.query(options.trx)
      .patch({ submitterId: null })
      .where({ submitterId: userId })
  }

  static async clearSubmitterInGroup(userId, groupId, options = {}) {
    return Manuscript.query(options.trx)
      .patch({ submitterId: null })
      .where({ submitterId: userId, groupId })
  }

  static async getLatestVersion(manuscriptId, options = {}) {
    return Manuscript.query(options.trx)
      .where({ parentId: manuscriptId })
      .orWhere({ id: manuscriptId })
      .orderBy('created', 'desc')
      .first()
  }

  static async getFirstVersionId(versionId, options = {}) {
    return (
      (
        await Manuscript.query(options.trx)
          .select('parentId')
          .findById(versionId)
      )?.parentId || versionId
    )
  }

  static async getLatestVersionId(versionId, options = {}) {
    const { trx } = options

    const firstVersionId = await Manuscript.getFirstVersionId(versionId, {
      trx,
    })

    return (
      await Manuscript.query(trx)
        .select('id')
        .where({ parentId: firstVersionId })
        .orWhere({ id: firstVersionId })
        .orderBy('created', 'desc')
        .limit(1)
    )[0].id
  }

  static async isActive(manuscriptId, options = {}) {
    const { trx } = options

    const manuscript = await Manuscript.query(trx)
      .select('isHidden')
      .findById(manuscriptId)

    if (!manuscript) return false
    if (manuscript.isHidden) return false

    const latestVersionId = await Manuscript.getLatestVersionId(manuscriptId, {
      trx,
    })

    return manuscriptId === latestVersionId
  }

  static async archiveNewUnlabelledCreatedBefore(
    groupId,
    cutoffDate,
    options = {},
  ) {
    return Manuscript.query(options.trx)
      .patch({ isHidden: true })
      .where('created', '<', cutoffDate)
      .where('status', 'new')
      .where('groupId', groupId)
      .whereNot('isHidden', true)
      .where(function subcondition() {
        this.whereRaw(`submission->>'$customStatus' = ''`).orWhereRaw(
          `submission->>'$customStatus' IS NULL`,
        )
      })
  }

  static async findByDoi(groupId, doi, options = {}) {
    return Manuscript.query(options.trx)
      .where({ groupId })
      .where(builder =>
        builder
          .whereRaw("submission->>'$doi' = ?", [doi])
          .orWhereRaw("submission->>'doi' = ?", [doi]),
      )
      .first()
  }

  static async findBySourceUri(groupId, uri, options = {}) {
    return Manuscript.query(options.trx)
      .where({ groupId })
      .where(builder =>
        builder
          .whereRaw("submission->>'$sourceUri' = ?", [uri])
          .orWhereRaw("submission->>'link' = ?", [uri]),
      )
      .first()
  }

  static async getGroupId(manuscriptId, options = {}) {
    return (
      await Manuscript.query(options.trx)
        .findById(manuscriptId)
        .select('groupId')
    ).groupId
  }

  static async getFirstVersionIds(ids, options = {}) {
    const manuscripts = await Manuscript.query(options.trx)
      .select('parentId', 'id')
      .whereIn('id', ids)

    return manuscripts.map(m => m.parentId || m.id)
  }

  /** Sets isHidden on the given first versions and all their child versions.
   * Returns the IDs of the updated manuscripts. */
  static async setIsHiddenOnAllVersions(
    firstVersionIds,
    isHidden,
    options = {},
  ) {
    const updated = await Manuscript.query(options.trx)
      .returning('id')
      .patch({ isHidden })
      .whereIn('id', firstVersionIds)
      .orWhereIn('parentId', firstVersionIds)

    return updated.map(m => m.id)
  }

  static async findFilesOfManuscripts(manuscriptIds, options = {}) {
    return Manuscript.relatedQuery('files', options.trx).for(manuscriptIds)
  }

  /** Sets created without touching updated. Only for tests.
   * This writes to the table directly: a patch would work for created (only
   * $beforeInsert stamps it), but BaseModel's $beforeUpdate would also set
   * updated to the current time. */
  static async backdateCreated(manuscriptId, created, options = {}) {
    return (options.trx || Manuscript.knex())('manuscripts')
      .where({ id: manuscriptId })
      .update({ created })
  }

  static async getSupplementaryFiles(manuscriptId, options = {}) {
    return Manuscript.relatedQuery('files', options.trx)
      .for(manuscriptId)
      .where('tags', '@>', JSON.stringify(['supplementary']))
  }

  static async getChannels(manuscriptId, options = {}) {
    return Manuscript.relatedQuery('channels', options.trx).for(manuscriptId)
  }

  static async findEditorialDiscussionChannel(manuscriptId, options = {}) {
    return Manuscript.relatedQuery('channels', options.trx)
      .for(manuscriptId)
      .findOne({ topic: 'Editorial discussion' })
  }

  static async findNonHiddenFirstVersions(options = {}) {
    return Manuscript.query(options.trx)
      .where({ parentId: null })
      .whereNot({ isHidden: true })
      .orderBy('created', 'desc')
  }

  /** Latest versions of published manuscripts in the group, most recently published first.
   * Each row includes a totalCount of all matching rows. */
  static async findPublishedLatestVersions(groupId, params = {}, options = {}) {
    const { startDate, limit, offset } = params
    const { trx } = options

    const subQuery = Manuscript.query(trx)
      .select('short_id')
      .max('created as latest_created')
      .where('group_id', groupId)
      .groupBy('short_id')

    const query = Manuscript.query(trx)
      .select('m.*', raw('count(*) over () as totalCount'))
      .from(Manuscript.query(trx).as('m'))
      .innerJoin(subQuery.as('sub'), 'm.short_id', 'sub.short_id')
      .andWhere('m.created', '=', raw('sub.latest_created'))
      .whereNotNull('m.published')
      .where('m.group_id', groupId)
      .orderBy('m.published', 'desc')

    if (startDate) query.where('m.published', '>=', new Date(startDate))
    if (limit) query.limit(limit)
    if (offset) query.offset(offset)

    return query
  }

  static async findPublishedInGroup(groupId, params = {}, options = {}) {
    const { sort, limit, offset } = params

    const query = Manuscript.query(options.trx)
      .where({ groupId })
      .whereNotNull('published')

    const totalCount = await query.resultSize()

    if (sort) {
      const [sortName, sortDirection] = sort.split('_')
      query.orderBy(ref(sortName), sortDirection)
    }

    if (limit) query.limit(limit)
    if (offset) query.offset(offset)
    const manuscripts = await query

    return { totalCount, manuscripts }
  }

  static async findByIdWithTeamUsersAndChannels(id, options = {}) {
    return Manuscript.query(options.trx)
      .findById(id)
      .withGraphJoined('[teams.members.user.defaultIdentity, channels]')
  }

  static async findReadyToEvaluate(groupId, options = {}) {
    return Manuscript.query(options.trx)
      .where({ status: 'new', groupId })
      .whereRaw(`submission->>'$customStatus' = 'readyToEvaluate'`)
  }

  /** Reports: summary counts and averages for first versions created in the date range */
  static async getSummaryStatsForDateRange(
    groupId,
    startDate,
    endDate,
    options = {},
  ) {
    const formattedStartDate = new Date(startDate)
    const formattedEndDate = new Date(endDate)

    const query = Manuscript.query(options.trx)
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

    return query
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
  }

  /** Reports: number of manuscript versions published since the given date */
  static async countPublishedSince(groupId, since, options = {}) {
    return Manuscript.query(options.trx)
      .where({ groupId })
      .whereNot({ isHidden: true })
      .where('published', '>=', since) // TODO this will double-count manuscripts republished twice today
      .resultSize()
  }

  /** Reports: number of manuscripts whose latest version is being revised */
  static async countRevisingNow(groupId, options = {}) {
    return Manuscript.query(options.trx)
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

  /** Reports: review and full durations of first versions submitted in the date range */
  static async getReviewAndCompletionDurations(
    groupId,
    dataStart,
    endDate,
    options = {},
  ) {
    const rows = await (options.trx || Manuscript.knex()).raw(
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

    return rows.rows
  }

  /** Reports: first versions created in the date range, with submitted, published and completed dates */
  static async findFirstVersionsWithCompletedDate(
    groupId,
    dataStart,
    endDate,
    options = {},
  ) {
    return Manuscript.query(options.trx)
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
  }

  /** Reports: activity per first version created in the date range */
  static async getActivityByManuscript(
    groupId,
    startDate,
    endDate,
    options = {},
  ) {
    const rows = await (options.trx || Manuscript.knex()).raw(
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

    return rows.rows
  }

  /** Reports: activity per editor, for first versions created in the date range */
  static async getActivityByEditor(groupId, startDate, endDate, options = {}) {
    const { rows } = await (options.trx || Manuscript.knex()).raw(
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
      [groupId, startDate, endDate, EDITOR_TEAM_DISPLAY_NAMES],
    )

    return rows
  }

  /** Reports: activity per reviewer, for first versions created in the date range */
  static async getActivityByReviewer(
    groupId,
    startDate,
    endDate,
    options = {},
  ) {
    const rows = await (options.trx || Manuscript.knex()).raw(
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

    return rows.rows
  }

  /** Reports: first versions created in the date range, with team users of all versions */
  static async findFirstVersionsWithTeamUsers(
    groupId,
    startDate,
    endDate,
    options = {},
  ) {
    return Manuscript.query(options.trx)
      .withGraphFetched(
        '[teams.[users.[defaultIdentity]], manuscriptVersions(orderByCreatedDesc).[teams.[users.[defaultIdentity]]]]',
      )
      .where('created', '>=', new Date(startDate))
      .where('created', '<', new Date(endDate))
      .where({ parentId: null, groupId })
      .whereNot({ isHidden: true })
      .orderBy('created')
  }

  static async findPublishedById(id, options = {}) {
    return Manuscript.query(options.trx).findById(id).whereNotNull('published')
  }

  static async getFirstVersionCreated(manuscript, options = {}) {
    if (manuscript.created && !manuscript.parentId) return manuscript.created
    const id = manuscript.parentId || manuscript.id

    const record = await Manuscript.query(options.trx)
      .findById(id)
      .select('created')

    return record.created
  }

  /** Returns a list of user IDs for editors, handlingEditors and seniorEditors. */
  static async getEditorIds(manuscriptId, options = {}) {
    const Team = require('../team/team.model')

    const { trx } = options

    const roleOrder = ['editor', 'handlingEditor', 'seniorEditor']

    const teams = await Team.query(trx)
      .where({ objectId: manuscriptId })
      .whereIn('role', roleOrder)
      .withGraphFetched('members')

    const sortedTeams = teams.sort((a, b) => {
      return roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role)
    })

    return [
      ...new Set(sortedTeams.map(t => t.members.map(m => m.userId)).flat()),
    ]
  }

  static async createTeams(manuscriptId, options = {}) {
    const Team = require('../team/team.model')

    const teamDefinitions = config
      .get('teams.nonGlobal')
      .filter(team => team.objectType === 'manuscript')

    return Team.insert(
      teamDefinitions.map(({ role, displayName, objectType }) => ({
        role,
        displayName,
        objectId: manuscriptId,
        objectType,
      })),
      { trx: options.trx },
    )
  }

  static async assignRole(userId, manuscriptId, role, options = {}) {
    const Team = require('../team/team.model')
    const TeamMember = require('../teamMember/teamMember.model')
    const { status, isShared, throwIfAssigned = false } = options

    return useTransaction(
      async trx => {
        const team = await Team.findTeamByRoleAndObject(role, manuscriptId, {
          trx,
        })

        const member = await TeamMember.query(trx).findOne({
          teamId: team.id,
          userId,
        })

        if (member && throwIfAssigned) {
          throw new Error(
            `User ${userId} already has the ${role} role on manuscript ${manuscriptId}`,
          )
        }

        if (!member) {
          await TeamMember.query(trx).insert({
            teamId: team.id,
            userId,
            status,
            isShared,
          })
        }

        return team
      },
      { trx: options.trx },
    )
  }

  static async removeRole(userId, manuscriptId, role, options = {}) {
    const Team = require('../team/team.model')
    const TeamMember = require('../teamMember/teamMember.model')
    const { throwIfNotAssigned = false } = options

    return useTransaction(
      async trx => {
        const team = await Team.findTeamByRoleAndObject(role, manuscriptId, {
          trx,
        })

        const removed = await TeamMember.query(trx)
          .delete()
          .where({ teamId: team.id, userId })

        if (!removed && throwIfNotAssigned) {
          throw new Error(
            `User ${userId} does not have the ${role} role on manuscript ${manuscriptId}`,
          )
        }

        return team
      },
      { trx: options.trx },
    )
  }

  static async createChannels(manuscriptId, groupId, options = {}) {
    const Channel = require('../channel/channel.model')

    return Channel.insert(
      [
        {
          topic: 'Manuscript discussion',
          type: 'all',
          manuscriptId,
          groupId,
        },
        {
          topic: 'Editorial discussion',
          type: 'editorial',
          manuscriptId,
          groupId,
        },
      ],
      { trx: options.trx },
    )
  }

  static async createNewManuscript(data, options = {}) {
    const ChannelMember = require('../channelMember/channelMember.model')
    const { assignSubmitter = true } = options

    return useTransaction(
      async trx => {
        const manuscript = await Manuscript.insert(data, { trx })
        const { groupId, parentId, submitterId } = manuscript

        await Manuscript.createTeams(manuscript.id, { trx })

        const channels = parentId
          ? []
          : await Manuscript.createChannels(manuscript.id, groupId, { trx })

        if (submitterId && assignSubmitter) {
          await Manuscript.assignRole(submitterId, manuscript.id, 'author', {
            trx,
          })

          const discussionChannel = channels.find(
            channel => channel.type === 'all',
          )

          if (discussionChannel) {
            await ChannelMember.insert(
              { channelId: discussionChannel.id, userId: submitterId },
              { trx },
            )
          }
        }

        return manuscript
      },
      { trx: options.trx },
    )
  }

  async createNewVersion() {
    const { File } = require('@coko/server')
    const Config = require('../config/config.model')
    const Form = require('../form/form.model')
    const Review = require('../review/review.model')
    const Task = require('../task/task.model')
    const TaskAlert = require('../taskAlert/taskAlert.model')
    const TeamMember = require('../teamMember/teamMember.model')

    const manuscript = await useTransaction(async trx => {
      // Members of these teams carry over to the new version
      const copiedMembers = await TeamMember.query(trx)
        .join('teams', 'teams.id', 'team_members.teamId')
        .where('teams.objectId', this.id)
        .whereIn('teams.role', VERSION_COPIED_TEAM_ROLES)
        .select('team_members.userId', 'team_members.status', 'teams.role')

      const files = await this.$relatedQuery('files', trx)

      const decisions = await this.$relatedQuery('reviews', trx).where({
        isDecision: true,
      })

      const decisionForm = await Form.query(trx).findOne({
        category: 'decision',
        purpose: 'decision',
        groupId: this.groupId,
      })

      const threadedDiscussionFieldNames = decisionForm
        ? decisionForm.structure.children
            .filter(field => field.component === 'ThreadedDiscussion')
            .map(field => field.name)
        : []

      const activeConfig = await Config.getActive(this.groupId, { trx })

      // Copied files get new ids that the copied source can point at
      const fileIdMap = new Map(files.map(file => [file.id, uuid()]))

      const newVersion = await Manuscript.insert(
        {
          ...omit(this, ['id', 'created', 'updated', 'decision']),
          // All versions should be linked to one parent, original manuscript
          parentId: this.parentId || this.id,
          status:
            activeConfig.formData.submission.allowAuthorsSubmitNewVersion ||
            this.status === 'revise'
              ? 'revising'
              : this.status,
          authorFeedback: {},
          meta: this.meta?.source
            ? {
                ...this.meta,
                source: remapImageFileIds(this.meta.source, fileIdMap),
              }
            : this.meta,
          // remove existing ADA data from submission
          submission: omitBy(
            this.submission,
            (value, key) =>
              value &&
              [
                'adaState',
                'adaProcessStatus',
                'adaId',
                'adaJobId',
                'adaJobDetails',
                'jobStatus',
              ].includes(key),
          ),
        },
        { trx },
      )

      await Manuscript.createTeams(newVersion.id, { trx })

      await Promise.all(
        copiedMembers.map(member =>
          Manuscript.assignRole(member.userId, newVersion.id, member.role, {
            trx,
            status: member.status,
          }),
        ),
      )

      if (files.length) {
        await File.insert(
          files.map(file => ({
            ...omit(file, ['created', 'updated']),
            id: fileIdMap.get(file.id),
            objectId: newVersion.id,
          })),
          { trx },
        )
      }

      if (decisions.length) {
        await Review.insert(
          decisions.map(decision => ({
            ...omit(decision, ['id', 'created', 'updated']),
            manuscriptId: newVersion.id,
            jsonData: pick(decision.jsonData, threadedDiscussionFieldNames),
          })),
          { trx },
        )
      }

      return newVersion
    })

    // Every version caches its own list of other versions, so evict the whole family.
    // This must happen after the insert, or a concurrent read could re-cache the stale list.
    const familyIds = [
      manuscript.parentId,
      ...(
        await Manuscript.query()
          .where({ parentId: manuscript.parentId })
          .select('id')
      ).map(version => version.id),
    ]

    familyIds.forEach(id => evictFromCache(`subVersionsOfMs:${id}`))

    await TaskAlert.query()
      .delete()
      .whereIn(
        'taskId',
        Task.query().select('id').where({ manuscriptId: this.id }),
      )

    return manuscript
  }

  async getManuscriptVersions() {
    const id = this.parentId || this.id

    const manuscripts = await Manuscript.query()
      .where('parent_id', id)
      .withGraphFetched(
        '[invitations.[user], teams.members, reviews.user, files, tasks(orderBySequence).[assignee, emailNotifications(orderByCreated)]]',
      )

    const firstManuscript = await Manuscript.findById(id, {
      related:
        '[invitations.[user], teams.members, reviews.user, files, tasks(orderBySequence).[assignee, emailNotifications(orderByCreated)]]',
    })

    manuscripts.push(firstManuscript)

    const manuscriptVersionsArray = manuscripts.filter(
      manuscript => this.id !== manuscript.id,
    )

    const manuscriptVersions = sortBy(
      manuscriptVersionsArray,
      manuscript => -manuscript.created,
    )

    return manuscriptVersions
  }

  static async search(
    {
      sort,
      offset,
      limit,
      filters,
      archived,
      submissionForm,
      timezoneOffsetMinutes,
      manuscriptIds = null,
      groupId = null,
    },
    options = {},
  ) {
    const [query, params] = buildQueryForManuscriptSearchFilterAndOrder(
      sort,
      offset,
      limit,
      filters,
      archived,
      submissionForm,
      timezoneOffsetMinutes,
      manuscriptIds,
      groupId,
    )

    const { rows } = await (options.trx || Manuscript.knex()).raw(query, params)

    return {
      totalCount: rows.length ? parseInt(rows[0].full_count, 10) : 0,
      results: rows.map(row => ({
        id: row.id,
        searchRank: row.rank,
        searchSnippets: buildSearchSnippets(row, submissionForm),
      })),
    }
  }

  /** Find all manuscripts (any version) for which the user serves in any role as a
   * team-member, and return the IDs of the first versions of those manuscripts.
   * E.g. If the given user was invited as a reviewer of the second version of a
   * manuscript, the first version of that manuscript will be included in the results.
   */
  static async getFirstVersionIdsOfManuscriptsUserHasARoleIn(userId, groupId) {
    const records = await Manuscript.query()
      .select(
        raw('coalesce(manuscripts.parent_id, manuscripts.id) AS top_level_id'),
      )
      .join('teams', 'manuscripts.id', '=', 'teams.object_id')
      .join('team_members', 'teams.id', '=', 'team_members.team_id')
      .where('team_members.user_id', userId)
      .where('is_hidden', false)
      .where('group_id', groupId)
      .distinct()

    return records.map(r => r.topLevelId)
  }

  /** Find the editor image previously created for this manuscript from the same
   * source (base64 data or URL), identified by the hash sanitizeWaxImages stores
   * in the file's meta. Returns undefined if there is none.
   */
  static async findImageFileBySourceHash(
    manuscriptId,
    sourceHash,
    options = {},
  ) {
    const { trx } = options

    return this.relatedQuery('files', trx)
      .for(manuscriptId)
      .whereJsonSupersetOf('tags', ['manuscriptImage'])
      .where(raw("meta->>'sourceHash'"), sourceHash)
      .orderBy('created')
      .first()
  }

  /** Does the user hold a role (author, reviewer or editor) on any version of
   * the manuscript? Reviewers who declined their invitation don't count.
   */
  static async userHasRoleInAnyVersion(userId, manuscriptId, options = {}) {
    const { trx } = options

    const manuscript = await this.query(trx)
      .findById(manuscriptId)
      .select('id', 'parentId')

    if (!manuscript) return false
    const firstVersionId = manuscript.parentId || manuscript.id

    const record = await this.query(trx)
      .select('manuscripts.id')
      .join('teams', 'manuscripts.id', '=', 'teams.object_id')
      .join('team_members', 'teams.id', '=', 'team_members.team_id')
      .where(builder =>
        builder
          .where('manuscripts.id', firstVersionId)
          .orWhere('manuscripts.parent_id', firstVersionId),
      )
      .where('team_members.user_id', userId)
      .whereIn('teams.role', [
        'author',
        'reviewer',
        'collaborativeReviewer',
        'editor',
        'handlingEditor',
        'seniorEditor',
        'managingEditor',
      ])
      .where(builder =>
        builder
          .whereNull('team_members.status')
          .orWhereNot('team_members.status', 'rejected'),
      )
      .first()

    return !!record
  }

  /**
   * For each manuscript where the user has one of the given roles on any
   * version, returns that manuscript's latest version - one row per
   * manuscript, not one per version.
   */
  static async getLatestVersionsOfManuscriptsUserHasRolesIn(
    userId,
    groupId,
    roles,
    options = {},
  ) {
    const { trx } = options

    const matchingVersions = await Manuscript.query(trx)
      .select('manuscripts.id', 'manuscripts.parent_id')
      .join('teams', 'manuscripts.id', '=', 'teams.object_id')
      .join('team_members', 'teams.id', '=', 'team_members.team_id')
      .where('team_members.user_id', userId)
      .where('teams.object_type', 'manuscript')
      .whereIn('teams.role', roles)
      .where('is_hidden', false)
      .where('group_id', groupId)
      .distinct()

    if (matchingVersions.length === 0) return []

    const topLevelIds = [
      ...new Set(matchingVersions.map(m => m.parentId || m.id)),
    ]

    const topLevelManuscripts = await Manuscript.query(trx)
      .whereIn('id', topLevelIds)
      .withGraphFetched('manuscriptVersions(orderByCreatedDesc)')

    return topLevelManuscripts.map(
      manuscript => manuscript.manuscriptVersions[0] || manuscript,
    )
  }

  static async findManuscriptsWithOverdueTasksForUser(
    userId,
    groupId,
    options = {},
  ) {
    const { trx, dueBefore = new Date() } = options
    const Team = require('../team/team.model')

    const editorOfTaskManuscriptSubquery = Team.query(trx)
      .join('teamMembers', 'teamMembers.teamId', 'teams.id')
      .whereColumn('teams.objectId', 'tasks.manuscriptId')
      .where({ 'teams.objectType': 'manuscript' })
      .whereIn('teams.role', EDITOR_ROLES)
      .where('teamMembers.userId', userId)

    return Manuscript.query(trx)
      .select('manuscripts.*')
      .min('tasks.dueDate as nextTaskDueDate')
      .groupBy('manuscripts.id')
      .join('tasks', 'tasks.manuscriptId', 'manuscripts.id')
      .where('tasks.groupId', groupId)
      .where('tasks.status', 'In progress')
      .whereNotNull('tasks.dueDate')
      .where('tasks.dueDate', '<', dueBefore)
      .whereNotExists(
        // latest manuscript versions only
        Manuscript.query(trx)
          .from('manuscripts as later_versions')
          .whereRaw(
            'coalesce(later_versions.parent_id, later_versions.id) = coalesce(manuscripts.parent_id, manuscripts.id)',
          )
          .whereRaw('later_versions.created > manuscripts.created'),
      )
      .where(builder => {
        // where user is either the assignee or an editor
        builder
          .where('tasks.assigneeUserId', userId)
          .orWhereExists(editorOfTaskManuscriptSubquery)
      })
  }

  static async addReviewer(
    manuscriptId,
    userId,
    invitationId,
    isCollaborative,
    options = {},
  ) {
    const Invitation = require('../invitation/invitation.model')

    return useTransaction(async trx => {
      const invitation = invitationId
        ? await Invitation.findById(invitationId, {
            trx,
            throwIfNotFound: false,
          })
        : null

      return Manuscript.assignRole(
        userId,
        manuscriptId,
        isCollaborative ? 'collaborativeReviewer' : 'reviewer',
        {
          trx,
          status: invitationId ? 'accepted' : 'invited',
          isShared: invitation ? invitation.isShared : null,
        },
      )
    }, options)
  }

  static get relationMappings() {
    const { File } = require('@coko/server')

    const Channel = require('../channel/channel.model')
    const User = require('../user/user.model')
    const Review = require('../review/review.model')
    const Team = require('../team/team.model')
    const Task = require('../task/task.model')
    const Invitation = require('../invitation/invitation.model')
    const PublishedArtifact = require('../publishedArtifact/publishedArtifact.model')
    const ThreadedDiscussion = require('../threadedDiscussion/threadedDiscussion.model')
    const Group = require('../group/group.model')

    return {
      submitter: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'manuscripts.submitterId',
          to: 'users.id',
        },
      },
      channels: {
        relation: BaseModel.HasManyRelation,
        modelClass: Channel,
        join: {
          from: 'manuscripts.id',
          to: 'channels.manuscriptId',
        },
        onBuildKnex: (knexBuilder, builder) => {
          // Modify the join condition based on manuscripts.parent_id
          if (builder.parentModel().parent_id !== null) {
            knexBuilder.on(
              'manuscripts.parent_id',
              '=',
              'channels.manuscriptId',
            )
          }
        },
      },
      tasks: {
        relation: BaseModel.HasManyRelation,
        modelClass: Task,
        join: {
          from: 'manuscripts.id',
          to: 'tasks.manuscriptId',
        },
      },
      teams: {
        relation: BaseModel.HasManyRelation,
        modelClass: Team,
        join: {
          from: 'manuscripts.id',
          to: 'teams.objectId',
        },
      },
      files: {
        relation: BaseModel.HasManyRelation,
        modelClass: File,
        join: {
          from: 'manuscripts.id',
          to: 'files.objectId',
        },
      },
      reviews: {
        relation: BaseModel.HasManyRelation,
        modelClass: Review,
        join: {
          from: 'manuscripts.id',
          to: 'reviews.manuscriptId',
        },
      },
      publishedArtifacts: {
        relation: BaseModel.HasManyRelation,
        modelClass: PublishedArtifact,
        join: {
          from: 'manuscripts.id',
          to: 'published_artifacts.manuscriptId',
        },
      },
      parent: {
        relation: BaseModel.HasOneRelation,
        modelClass: Manuscript,
        join: {
          from: 'manuscripts.id',
          to: 'manuscripts.parentId',
        },
      },
      manuscriptVersions: {
        relation: BaseModel.HasManyRelation,
        modelClass: Manuscript,
        join: {
          from: 'manuscripts.id',
          to: 'manuscripts.parentId',
        },
      },
      invitations: {
        relation: BaseModel.HasManyRelation,
        modelClass: Invitation,
        join: {
          from: 'manuscripts.id',
          to: 'invitations.manuscriptId',
        },
      },
      threadedDiscussions: {
        relation: BaseModel.HasManyRelation,
        modelClass: ThreadedDiscussion,
      },
      group: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Group,
        join: {
          from: 'manuscripts.groupId',
          to: 'groups.id',
        },
      },
    }
  }

  static get schema() {
    return {
      type: 'object',
      properties: {
        shortId: { type: 'integer' },
        parentId: {
          anyOf: [
            {
              type: 'string',
              format: 'uuid',
            },
            {
              type: 'null',
            },
          ],
        },
        manuscriptVersions: { type: ['object', 'null'] },
        files: {
          items: { type: 'object' },
          type: ['array', 'null'],
        },
        teams: {
          items: { type: 'object' },
          type: ['array', 'null'],
        },
        tasks: {
          items: { type: 'object' },
          type: ['array', 'null'],
        },
        reviews: {
          items: { type: 'object' },
          type: ['array', 'null'],
        },
        status: { type: ['string', 'null'] },
        decision: { type: ['string', 'null'] },
        authors: {
          items: { type: 'object' },
          type: ['array', 'null'],
        },
        meta: {
          type: 'object',
          properties: {
            title: { type: 'string' }, // TODO DEPRECATED. Remove once we clean up old migrations.
            abstract: { type: ['string', 'null'] }, // TODO DEPRECATED. Remove once we clean up old migrations.
            source: { type: 'string' },
            comments: {
              anyOf: [
                {
                  type: 'array',
                  items: {
                    type: 'object',
                  },
                },
                {
                  type: 'null',
                },
              ],
            },
            history: {
              items: { type: 'object' },
              type: ['array', 'null'],
            },
            previousVersions: {
              items: { type: 'object' },
              type: ['array', 'null'],
            },
          },
        },
        submission: {},
        submittedDate: {
          anyOf: [
            {
              type: 'string',
              format: 'date-time',
            },
            {
              type: 'object',
            },
            {
              type: 'null',
            },
          ],
        },
        submitterId: {
          anyOf: [
            {
              type: 'string',
              format: 'uuid',
            },
            {
              type: 'null',
            },
          ],
        },
        published: {
          anyOf: [
            {
              type: 'string',
              format: 'date-time',
            },
            {
              type: 'object',
            },
            {
              type: 'null',
            },
          ],
        },
        evaluationsHypothesisMap: {},
        isImported: { type: ['boolean', 'null'] },
        importSource: {
          anyOf: [
            {
              type: 'string',
              format: 'uuid',
            },
            {
              type: 'null',
            },
          ],
        },
        importSourceServer: { type: ['string', 'null'] },
        isHidden: { type: ['boolean', 'null'] },
        formFieldsToPublish: { type: 'array' },
        doi: { type: ['string', 'null'] },
        searchableText: { type: 'string' },
        groupId: {
          anyOf: [
            {
              type: 'string',
              format: 'uuid',
            },
            {
              type: 'null',
            },
          ],
        },
        authorFeedback: {
          anyOf: [
            {
              type: 'object',
              properties: {
                text: { type: 'string' },
                fileIds: { type: 'array' },
                submitterId: {
                  anyOf: [
                    {
                      type: 'string',
                      format: 'uuid',
                    },
                    {
                      type: 'null',
                    },
                  ],
                },
                edited: {
                  anyOf: [
                    {
                      type: 'string',
                      format: 'date-time',
                    },
                    {
                      type: 'object',
                    },
                    {
                      type: 'null',
                    },
                  ],
                },
                submitted: {
                  anyOf: [
                    {
                      type: 'string',
                      format: 'date-time',
                    },
                    {
                      type: 'object',
                    },
                    {
                      type: 'null',
                    },
                  ],
                },
                assignedAuthors: {
                  items: { type: 'object' },
                  type: ['array'],
                },
                previousSubmissions: {
                  items: { type: 'object' },
                  type: ['array'],
                },
              },
            },
            { type: 'null' },
          ],
        },
      },
    }
  }
}

Manuscript.type = 'Manuscript'
module.exports = Manuscript
