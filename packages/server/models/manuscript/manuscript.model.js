const omit = require('lodash/omit')
const cloneDeep = require('lodash/cloneDeep')
const { raw } = require('objection')
const sortBy = require('lodash/sortBy')

const { BaseModel, useTransaction } = require('@coko/server')

// REFACTOR: models
const { evictFromCache } = require('../../services/queryCache.service')

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

  async createNewVersion() {
    const Config = require('../config/config.model')
    const Form = require('../form/form.model')
    const Task = require('../task/task.model')
    const TaskAlert = require('../taskAlert/taskAlert.model')

    // Copy authors and editors to the new version
    const teams = await this.$relatedQuery('teams')
      .whereIn('role', ['author', 'editor', 'seniorEditor', 'handlingEditor'])
      .withGraphFetched('members')

    teams.forEach(t => {
      delete t.id

      t.members.forEach(tm => delete tm.id)
    })

    // Copy files as well
    const files = await this.$relatedQuery('files')

    files.forEach(f => delete f.id)

    const decisions = await this.$relatedQuery('reviews').where({
      isDecision: true,
    })

    const decisionForm = await Form.query().findOne({
      category: 'decision',
      purpose: 'decision',
      groupId: this.groupId,
    })

    const threadedDiscussionFieldNames = decisionForm
      ? decisionForm.structure.children
          .filter(field => field.component === 'ThreadedDiscussion')
          .map(field => field.name)
      : []

    const clonedDecisions = decisions.map(decision => {
      const clonedDecision = cloneDeep(decision)
      delete clonedDecision.id
      clonedDecision.jsonData = {}

      Object.entries(decision.jsonData)
        .filter(([key]) => threadedDiscussionFieldNames.includes(key))
        .forEach(([key, value]) => {
          clonedDecision.jsonData[key] = value
        })

      return clonedDecision
    })

    const newVersion = cloneDeep(this)
    newVersion.teams = teams

    newVersion.reviews = clonedDecisions
    newVersion.files = files

    const activeConfig = await Config.getCached(this.groupId)

    if (
      activeConfig.formData.submission.allowAuthorsSubmitNewVersion ||
      this.status === 'revise'
    ) {
      newVersion.status = 'revising'
    }

    // All versions should be linked to one parent, original manuscript
    newVersion.parentId = this.parentId || this.id

    newVersion.authorFeedback = {}

    // remove existing ADA data from submission
    if (newVersion.submission.adaState) delete newVersion.submission.adaState
    if (newVersion.submission.adaProcessStatus)
      delete newVersion.submission.adaProcessStatus
    if (newVersion.submission.adaId) delete newVersion.submission.adaId
    if (newVersion.submission.adaJobId) delete newVersion.submission.adaJobId
    if (newVersion.submission.adaJobDetails)
      delete newVersion.submission.adaJobDetails
    if (newVersion.submission.jobStatus) delete newVersion.submission.jobStatus

    evictFromCache(`subVersionsOfMs:${newVersion.parentId}`)

    const manuscript = await Manuscript.query().insertGraphAndFetch(
      omit(cloneDeep(newVersion), ['id', 'created', 'updated', 'decision']),
    )

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
