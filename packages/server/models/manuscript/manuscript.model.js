const omit = require('lodash/omit')
const omitBy = require('lodash/omitBy')
const pick = require('lodash/pick')
const { raw } = require('objection')
const sortBy = require('lodash/sortBy')

const { BaseModel, config, useTransaction, uuid } = require('@coko/server')

// REFACTOR: models
const { evictFromCache } = require('../../services/queryCache.service')
const { remapImageFileIds } = require('../../utils/fileStorageUtils')

const EDITOR_ROLES = ['editor', 'handlingEditor', 'seniorEditor']

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

    const manuscriptWithAuthors = await Manuscript.query(trx)
      .findById(this.id)
      .withGraphFetched('teams(onlyAuthors).members(orderByCreatedDesc).user')

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

    const manuscriptWithEditors = await Manuscript.query(trx)
      .findById(this.id)
      .withGraphFetched(
        '[teams(onlyEditors).[members(orderByCreatedDesc).[user]]]',
      )

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

    return useTransaction(
      async trx => {
        const team = await Team.findTeamByRoleAndObject(role, manuscriptId, {
          trx,
        })

        return Team.addMember(team.id, userId, { trx, status: options.status })
      },
      { trx: options.trx },
    )
  }

  static async removeRole(userId, manuscriptId, role, options = {}) {
    const Team = require('../team/team.model')

    return useTransaction(
      async trx => {
        const team = await Team.findTeamByRoleAndObject(role, manuscriptId, {
          trx,
        })

        return Team.removeMember(team.id, userId, { trx })
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

    const firstManuscript = await Manuscript.query()
      .findById(id)
      .withGraphFetched(
        '[invitations.[user], teams.members, reviews.user, files, tasks(orderBySequence).[assignee, emailNotifications(orderByCreated)]]',
      )

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
    const TeamMember = require('../teamMember/teamMember.model')
    const Team = require('../team/team.model')

    return useTransaction(async trx => {
      const manuscript = await Manuscript.query(trx).findById(manuscriptId)
      const status = invitationId ? 'accepted' : 'invited'

      const team = isCollaborative
        ? {
            role: 'collaborativeReviewer',
            displayName: 'Collaborative Reviewers',
          }
        : { role: 'reviewer', displayName: 'Reviewers' }

      let invitationData

      if (invitationId) {
        invitationData = await Invitation.query(trx).findById(invitationId)
      }

      const existingTeam = await manuscript
        .$relatedQuery('teams', trx)
        .where('role', team.role)
        .first()

      // Add the reviewer to the existing team of reviewers
      if (existingTeam) {
        const reviewerExists =
          (await existingTeam
            .$relatedQuery('users', trx)
            .where('users.id', userId)
            .resultSize()) > 0

        if (!reviewerExists) {
          await TeamMember.query(trx).insert({
            teamId: existingTeam.id,
            status,
            userId,
            isShared: invitationData ? invitationData.isShared : null,
          })
        }

        return existingTeam.$query(trx)
      }

      // Create a new team of reviewers if it doesn't exist

      const newTeam = await Team.query(trx).insert({
        objectId: manuscriptId,
        objectType: 'manuscript',
        role: team.role,
        displayName: team.displayName,
      })

      await TeamMember.query(trx).insert({
        userId,
        teamId: newTeam.id,
        status,
      })

      return newTeam
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
