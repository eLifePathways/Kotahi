const { randomUUID } = require('crypto')
const { Readable } = require('stream')
const {
  useTransaction,
  db,
  createFile,
  deleteFiles,
  File,
} = require('@coko/server')
const merge = require('lodash/merge')

const Group = require('../../../models/group/group.model')
const Config = require('../../../models/config/config.model')
const Team = require('../../../models/team/team.model')
const TeamMember = require('../../../models/teamMember/teamMember.model')
const User = require('../../../models/user/user.model')
const Identity = require('../../../models/identity/identity.model')
const Channel = require('../../../models/channel/channel.model')
const ChannelMember = require('../../../models/channelMember/channelMember.model')
const Form = require('../../../models/form/form.model')
const Manuscript = require('../../../models/manuscript/manuscript.model')
const Review = require('../../../models/review/review.model')
const ThreadedDiscussion = require('../../../models/threadedDiscussion/threadedDiscussion.model')
const seedForms = require('../../../scripts/seedForms')
const { seedNotifications } = require('../../../scripts/seedNotifications')
const EmailTemplate = require('../../../models/emailTemplate/emailTemplate.model')
const Notification = require('../../../models/notification/notification.model')
const defaultEmailTemplates = require('../../../config/defaultEmailTemplates')
const eventsSource = require('../../../services/notification/eventsSource')

// Mirrors scripts/seedConfig.js's default: every event active out of the box.
const defaultEventsConfig = Object.keys(eventsSource).reduce((acc, key) => {
  acc[key] = { active: true }
  return acc
}, {})

const GENERIC_USER_COUNT = 5

const ASSIGNABLE_MANUSCRIPT_ROLES = {
  reviewer: 'Reviewers',
  seniorEditor: 'Senior Editor',
  handlingEditor: 'Handling Editor',
  editor: 'Editor',
  managingEditor: 'Managing Editor',
}

// Shared across every test-created group in every suite - created once
// (idempotently) and reused, rather than one throwaway set per group. Treat
// these as read-only identities: only group-scoped data (teams, manuscripts,
// config) should ever be test-specific. Do not mutate a shared user's own
// fields in a test, since that would leak across parallel tests/suites.
const SHARED_USERS = {
  admin: 'pw-admin',
  groupAdmin: 'pw-group-admin',
  groupManager: 'pw-group-manager',
  // Fixed, never-changing ORCID identity - safe to share, unlike mutating an
  // existing shared user's own fields.
  userWithOrcid: 'pw-user-with-orcid',
  generic: Array.from(
    { length: GENERIC_USER_COUNT },
    (_, index) => `pw-user-${index + 1}`,
  ),
}

const TEST_ORCID = '0000-0001-2345-6789'

const findOrCreate = async (Model, findQuery, insertData) => {
  const existing = await Model.findOne(findQuery)
  if (existing) return existing

  try {
    return await Model.insert(insertData)
  } catch (err) {
    const existingAfterRace = await Model.findOne(findQuery)
    if (existingAfterRace) return existingAfterRace
    throw err
  }
}

const deleteAllMatching = async (Model, rowsOrFilter, trx) => {
  const rows = Array.isArray(rowsOrFilter)
    ? rowsOrFilter
    : (await Model.find(rowsOrFilter, { trx })).result

  if (rows.length === 0) return

  await Model.deleteByIds(
    rows.map(row => row.id),
    { trx },
  )
}

const ensureSharedUsers = async () => {
  const adminTeam = await Team.findOne({ global: true, role: 'admin' })

  const ensureUser = async username =>
    findOrCreate(
      User,
      { username },
      { username, email: `${username}@example.com` },
    )

  const [
    adminUser,
    groupAdminUser,
    groupManagerUser,
    userWithOrcid,
    ...genericUsers
  ] = await Promise.all([
    ensureUser(SHARED_USERS.admin),
    ensureUser(SHARED_USERS.groupAdmin),
    ensureUser(SHARED_USERS.groupManager),
    ensureUser(SHARED_USERS.userWithOrcid),
    ...SHARED_USERS.generic.map(ensureUser),
  ])

  // Add admin user to the admin group
  await findOrCreate(
    TeamMember,
    { userId: adminUser.id, teamId: adminTeam.id },
    { userId: adminUser.id, teamId: adminTeam.id },
  )

  await findOrCreate(
    Identity,
    { userId: userWithOrcid.id, isDefault: true },
    {
      userId: userWithOrcid.id,
      isDefault: true,
      type: 'orcid',
      identifier: TEST_ORCID,
    },
  )

  return {
    adminUser,
    groupAdminUser,
    groupManagerUser,
    userWithOrcid,
    genericUsers,
  }
}

const deleteGroupData = async (group, trx) => {
  const { result: manuscripts } = await Manuscript.find(
    { groupId: group.id },
    { trx },
  )

  await Promise.all(
    manuscripts.map(manuscript =>
      deleteAllMatching(Team, { objectId: manuscript.id }, trx),
    ),
  )

  // files.object_id has no FK to manuscripts, so these would otherwise be orphaned
  if (manuscripts.length > 0) {
    const files = await File.query(trx).whereIn(
      'objectId',
      manuscripts.map(manuscript => manuscript.id),
    )

    if (files.length > 0)
      await deleteFiles(
        files.map(file => file.id),
        { trx },
      )
  }

  const { result: channels } = await Channel.find(
    { groupId: group.id },
    { trx },
  )

  if (channels.length > 0) {
    await ChannelMember.query(trx)
      .delete()
      .whereIn(
        'channelId',
        channels.map(channel => channel.id),
      )
  }

  await deleteAllMatching(Manuscript, { groupId: group.id }, trx)
  // Users made by createGroupUser
  await deleteAllMatching(
    User,
    await User.findByUsernamePrefix(`${group.name}-`, { trx }),
    trx,
  )
  await deleteAllMatching(Team, { objectId: group.id }, trx)
  await deleteAllMatching(Config, { groupId: group.id }, trx)
  await deleteAllMatching(Channel, { groupId: group.id }, trx)
  await deleteAllMatching(Form, { groupId: group.id }, trx)
  await deleteAllMatching(EmailTemplate, { groupId: group.id }, trx)
  await deleteAllMatching(Notification, { groupId: group.id }, trx)
  await Group.deleteById(group.id, { trx })
}

const deleteGroup = async groupName =>
  useTransaction(async trx => {
    const group = await Group.findOne({ name: groupName }, { trx })
    if (group) await deleteGroupData(group, trx)
  })

const deleteGroupsByPrefix = async prefix =>
  useTransaction(async trx => {
    const groups = await Group.query(trx).where('name', 'like', `${prefix}%`)

    for (const group of groups) {
      // eslint-disable-next-line no-await-in-loop
      await deleteGroupData(group, trx)
    }

    return { deletedGroups: groups.length }
  })

const createGroup = async groupName => {
  const {
    adminUser,
    groupAdminUser,
    groupManagerUser,
    userWithOrcid,
    genericUsers,
  } = await ensureSharedUsers()

  return useTransaction(async trx => {
    // Clear out any leftovers from a previous, interrupted run of this exact
    // group name (e.g. a retried test re-using the same testId).
    const existingGroup = await Group.findOne({ name: groupName }, { trx })
    if (existingGroup) await deleteGroupData(existingGroup, trx)

    const group = await Group.insert(
      { name: groupName, isArchived: false },
      { trx },
    )

    // Mirrors the shape produced by scripts/seedConfig.js's 'journal' case,
    // minus manuscript.tableColumns, so the client's default column fallback
    // can be exercised. Deliberately not a partial/sparse object: several
    // server controllers (e.g. configUtils.js) reach into formData.publishing
    // and friends without full optional chaining, so omitting a branch here
    // can break unrelated requests (e.g. the Groups query) while this config
    // exists.
    const formData = {
      instanceName: 'journal',
      user: { isAdmin: false },
      report: { showInMenu: true },
      review: { showSummary: false },
      dashboard: {
        showSections: ['submission', 'review', 'editor'],
        loginRedirectUrl: '/dashboard',
      },
      manuscript: {
        paginationCount: 10,
      },
      submission: {
        allowAuthorsSubmitNewVersion: false,
        submissionPage: { allowAuthorUploadWithForm: true },
      },
      publishing: {
        hypothesis: {
          group: null,
          apiKey: null,
          shouldAllowTagging: false,
          reverseFieldOrder: false,
        },
        webhook: { ref: null, url: null, token: null },
        crossref: {
          login: null,
          password: null,
          doiPrefix: null,
          registrant: null,
          depositorName: null,
          depositorEmail: null,
          journalHomepage: null,
          publicationType: 'article',
          publishedArticleLocationPrefix: null,
          useSandbox: false,
        },
      },
      production: {
        crossrefRetrievalEmail: '',
        getDataFromDatacite: false,
        fallbackOnCrossrefAfterDatacite: false,
        citationStyles: { styleName: 'apa', localeName: 'en-US' },
        crossrefSearchResultCount: 3,
        manuscriptVersionHistory: { historyIntervalInMinutes: 10 },
      },
      taskManager: { teamTimezone: 'Etc/UTC' },
      controlPanel: {
        showTabs: [
          'Team',
          'Decision',
          'Reviews',
          'Manuscript text',
          'Metadata',
          'Tasks & Notifications',
        ],
        hideReview: false,
        sharedReview: false,
        displayManuscriptShortId: true,
        authorProofingEnabled: false,
        editorsEditReviewsEnabled: false,
        groupManagersCanPublish: true,
        editorsCanPublish: true,
      },
      notification: { eventsConfig: defaultEventsConfig },
      eventNotification: {},
      groupIdentity: {
        brandName: groupName,
        primaryColor: '#4a7c59',
        secondaryColor: '#6b7280',
        logoPath: '/logo-kotahi.png',
        title: '',
        description: '',
        contact: '',
        issn: '',
      },
      integrations: {
        kotahiApis: {},
        coarNotify: {},
        aiDesignStudio: {},
        semanticScholar: { enableSemanticScholar: false },
      },
    }

    const config = await Config.insert(
      { groupId: group.id, active: true, formData, type: 'Config' },
      { trx },
    )

    await seedForms(group, config, { trx })

    // Mirrors scripts/seedGroups.js's default email template seeding, so
    // the notification-sending UI (SelectEmailTemplate) has options to pick.
    const insertedEmailTemplates = await EmailTemplate.query(trx).insertGraph(
      defaultEmailTemplates.map(template => ({
        emailTemplateType: template.type,
        emailContent: {
          subject: template.subject,
          cc: template.cc,
          ccEditors: template.ccEditors,
          body: template.body,
          description: template.description,
        },
        groupId: group.id,
      })),
    )

    const findTemplateByType = type =>
      insertedEmailTemplates.find(e => e.emailTemplateType === type)

    // Mirrors scripts/seedGroups.js's config mapping - without these, a
    // "reviewer invitation" or "author proofing" notification send has no
    // template to look up and silently no-ops.
    formData.eventNotification.reviewerInvitationPrimaryEmailTemplate =
      findTemplateByType('reviewerInvitation').id
    formData.eventNotification.authorProofingInvitationEmailTemplate =
      findTemplateByType('authorProofingInvitation').id
    formData.eventNotification.authorProofingSubmittedEmailTemplate =
      findTemplateByType('authorProofingSubmitted').id

    const updatedConfig = await Config.query(trx).patchAndFetchById(config.id, {
      formData,
    })

    // Mirrors scripts/seedGroups.js: creates the active Notification (event
    // -> template) rows a real group gets, so eg. sending an "Author
    // Invitation"/"Reviewer Invitation" notification actually succeeds
    // instead of silently no-oping on "no active event found".
    await seedNotifications(trx, group.id, updatedConfig)

    await Channel.insert(
      {
        topic: 'System-wide discussion',
        type: 'editorial',
        groupId: group.id,
      },
      { trx },
    )

    const [groupAdminTeam, groupManagerTeam, userTeam] = await Promise.all([
      Team.insert(
        {
          displayName: 'Group Admin',
          role: 'groupAdmin',
          global: false,
          objectId: group.id,
          objectType: 'Group',
        },
        { trx },
      ),
      Team.insert(
        {
          displayName: 'Group Manager',
          role: 'groupManager',
          global: false,
          objectId: group.id,
          objectType: 'Group',
        },
        { trx },
      ),
      Team.insert(
        {
          displayName: 'User',
          role: 'user',
          global: false,
          objectId: group.id,
          objectType: 'Group',
        },
        { trx },
      ),
    ])

    await TeamMember.insert(
      [
        { userId: groupAdminUser.id, teamId: groupAdminTeam.id },
        { userId: groupManagerUser.id, teamId: groupManagerTeam.id },
        ...genericUsers.map(genericUser => ({
          userId: genericUser.id,
          teamId: userTeam.id,
        })),
      ],
      { trx },
    )

    return {
      groupName: group.name,
      adminUsername: adminUser.username,
      groupAdminUsername: groupAdminUser.username,
      groupManagerUsername: groupManagerUser.username,
      userWithOrcidUsername: userWithOrcid.username,
      usernames: genericUsers.map(genericUser => genericUser.username),
    }
  })
}

const createManuscripts = async ({ groupName, count, submitterUsername }) => {
  const group = await Group.findOne({ name: groupName })

  if (!group) {
    throw new Error(`No group found named "${groupName}"`)
  }

  const submitterUsernames = submitterUsername
    ? [submitterUsername]
    : SHARED_USERS.generic

  const submitters = (
    await Promise.all(
      submitterUsernames.map(username => User.findOne({ username })),
    )
  ).filter(Boolean)

  if (submitters.length === 0) {
    throw new Error(
      `No users found to use as submitters for group "${groupName}"`,
    )
  }

  return useTransaction(async trx => {
    const manuscripts = await Manuscript.insert(
      Array.from({ length: count }, (_, index) => ({
        groupId: group.id,
        submitterId: submitters[index % submitters.length].id,
        status: 'new',
        // A real submission always has this (see manuscript.controllers.js's
        // createManuscript) - the updateManuscript resolver re-validates the
        // whole row on every patch, and Manuscript's schema requires meta to
        // be an object (not null) whenever it's present.
        meta: {},
        submission: {
          $title: `Test manuscript ${index + 1}`,
          $abstract: `Abstract for test manuscript ${index + 1}`,
        },
      })),
      { trx },
    )

    await Promise.all(
      manuscripts.map(async (manuscript, index) => {
        const authorTeam = await Team.insert(
          {
            displayName: 'Author',
            role: 'author',
            global: false,
            objectId: manuscript.id,
            objectType: 'manuscript',
          },
          { trx },
        )

        await TeamMember.insert(
          {
            userId: submitters[index % submitters.length].id,
            teamId: authorTeam.id,
          },
          { trx },
        )

        await Promise.all(
          Object.entries(ASSIGNABLE_MANUSCRIPT_ROLES).map(
            ([role, displayName]) =>
              Team.insert(
                {
                  displayName,
                  role,
                  global: false,
                  objectId: manuscript.id,
                  objectType: 'manuscript',
                },
                { trx },
              ),
          ),
        )

        await Channel.insert(
          [
            {
              topic: 'Manuscript discussion',
              type: 'all',
              groupId: group.id,
              manuscriptId: manuscript.id,
            },
            {
              topic: 'Editorial discussion',
              type: 'editorial',
              groupId: group.id,
              manuscriptId: manuscript.id,
            },
          ],
          { trx },
        )
      }),
    )

    return { manuscriptIds: manuscripts.map(manuscript => manuscript.id) }
  })
}

const assignRole = async ({ manuscriptIds, username, role }) => {
  if (!ASSIGNABLE_MANUSCRIPT_ROLES[role]) {
    throw new Error(`"${role}" is not an assignable manuscript role`)
  }

  const user = await User.findOne({ username })

  if (!user) {
    throw new Error(`No user found named "${username}"`)
  }

  return useTransaction(async trx => {
    await Promise.all(
      manuscriptIds.map(async manuscriptId => {
        const team = await Team.findOne(
          { objectId: manuscriptId, role },
          { trx },
        )

        if (!team) {
          throw new Error(
            `No "${role}" team found for manuscript "${manuscriptId}"`,
          )
        }

        await TeamMember.insert({ userId: user.id, teamId: team.id }, { trx })
      }),
    )

    return { manuscriptCount: manuscriptIds.length }
  })
}

const updateFormFields = async ({ groupName, purpose, category, fields }) => {
  const group = await Group.findOne({ name: groupName })

  if (!group) {
    throw new Error(`No group found named "${groupName}"`)
  }

  const form = await Form.findOne({ groupId: group.id, purpose, category })

  if (!form) {
    throw new Error(
      `No "${purpose}"/"${category}" form found for group "${groupName}"`,
    )
  }

  const children = [...form.structure.children]

  fields.forEach(field => {
    const fieldWithIds = {
      id: randomUUID(),
      ...field,
      options: field.options?.map(option => ({
        id: randomUUID(),
        ...option,
      })),
    }

    const existingIndex = children.findIndex(child => child.name === field.name)

    if (existingIndex === -1) {
      children.push(fieldWithIds)
    } else {
      children[existingIndex] = { ...children[existingIndex], ...fieldWithIds }
    }
  })

  return Form.patchAndFetchById(form.id, {
    structure: { ...form.structure, children },
  })
}

const updateManuscriptSubmission = async ({ manuscriptId, patch }) => {
  const manuscript = await Manuscript.findById(manuscriptId)

  if (!manuscript) {
    throw new Error(`No manuscript found with id "${manuscriptId}"`)
  }

  const submission = merge({}, manuscript.submission, patch)

  return Manuscript.patchAndFetchById(manuscriptId, { submission })
}

const patchManuscript = async ({ manuscriptId, patch }) => {
  const manuscript = await Manuscript.findById(manuscriptId)

  if (!manuscript) {
    throw new Error(`No manuscript found with id "${manuscriptId}"`)
  }

  return Manuscript.patchAndFetchById(manuscriptId, patch)
}

// BaseModel's $beforeInsert/$beforeUpdate hooks unconditionally stamp
// created/updated with the current time (see @coko/server's base.model.js),
// so there's no way to backdate a manuscript's `created` through Manuscript's
// own insert/patch methods - go straight to knex. Used to exercise the
// 'date' column's relative-time rendering (today/yesterday/N days ago/
// absolute date) for something other than "just now".
const setManuscriptCreated = async ({ manuscriptId, created }) => {
  const manuscript = await Manuscript.findById(manuscriptId)

  if (!manuscript) {
    throw new Error(`No manuscript found with id "${manuscriptId}"`)
  }

  await db('manuscripts').where({ id: manuscriptId }).update({ created })

  return Manuscript.findById(manuscriptId)
}

// isShared: whether this reviewer's review is shared with the other shared
// reviewers (left unchanged when omitted)
const setReviewerStatus = async ({
  manuscriptId,
  username,
  status,
  isShared,
}) => {
  const user = await User.findOne({ username })

  if (!user) {
    throw new Error(`No user found named "${username}"`)
  }

  const team = await Team.findOne({ objectId: manuscriptId, role: 'reviewer' })

  if (!team) {
    throw new Error(`No "reviewer" team found for manuscript "${manuscriptId}"`)
  }

  const teamMember = await TeamMember.findOne({
    teamId: team.id,
    userId: user.id,
  })

  if (!teamMember) {
    throw new Error(
      `No reviewer team member found for user "${username}" on manuscript "${manuscriptId}"`,
    )
  }

  return TeamMember.patchAndFetchById(teamMember.id, {
    status,
    ...(isShared !== undefined && { isShared }),
  })
}

const createReview = async ({
  manuscriptId,
  username,
  isHiddenFromAuthor = true,
  isHiddenReviewerName = true,
  jsonData = {},
}) => {
  const user = await User.findOne({ username })

  if (!user) {
    throw new Error(`No user found named "${username}"`)
  }

  const team = await Team.findOne({ objectId: manuscriptId, role: 'reviewer' })

  if (!team) {
    throw new Error(`No "reviewer" team found for manuscript "${manuscriptId}"`)
  }

  const teamMember = await TeamMember.findOne({
    teamId: team.id,
    userId: user.id,
  })

  if (!teamMember) {
    throw new Error(
      `No reviewer team member found for user "${username}" on manuscript "${manuscriptId}"`,
    )
  }

  // Matches the shape manuscript.controllers.js creates when a reviewer
  // accepts an invitation - a real review always starts out this way.
  return Review.insert({
    manuscriptId,
    userId: user.id,
    isDecision: false,
    isHiddenFromAuthor,
    isHiddenReviewerName,
    jsonData: JSON.stringify(jsonData),
  })
}

// A user belonging only to this group, for tests that need someone with no
// role anywhere else - the shared pw-user-* users pick up manuscript roles
// across every suite. Deleted along with the group.
const createGroupUser = async ({ groupName, name }) => {
  const group = await Group.findOne({ name: groupName })

  if (!group) {
    throw new Error(`No group found named "${groupName}"`)
  }

  const username = `${groupName}-${name}`

  return useTransaction(async trx => {
    const user = await User.insert(
      { username, email: `${username}@example.com` },
      { trx },
    )

    const userTeam = await Team.findOne(
      { objectId: group.id, role: 'user' },
      { trx },
    )

    await TeamMember.insert({ userId: user.id, teamId: userTeam.id }, { trx })

    return { username }
  })
}

// The editor's decision on a manuscript, as the decision form saves it. Set
// the manuscript's decision/status separately (eg. with patchManuscript).
const createDecision = async ({ manuscriptId, username, jsonData = {} }) => {
  const user = await User.findOne({ username })

  if (!user) {
    throw new Error(`No user found named "${username}"`)
  }

  return Review.insert({
    manuscriptId,
    userId: user.id,
    isDecision: true,
    isHiddenFromAuthor: false,
    isHiddenReviewerName: false,
    jsonData: JSON.stringify(jsonData),
  })
}

const updateGroupConfig = async ({ groupName, patch }) => {
  const group = await Group.findOne({ name: groupName })

  if (!group) {
    throw new Error(`No group found named "${groupName}"`)
  }

  const config = await Config.findOne({ groupId: group.id, active: true })

  if (!config) {
    throw new Error(`No active config found for group "${groupName}"`)
  }

  const formData = merge({}, config.formData, patch)

  return Config.patchAndFetchById(config.id, { formData })
}

// Attaches a real (tiny) stored file to a manuscript, so queries that select
// manuscript.files exercise the File permission rule.
const addManuscriptFile = async ({ manuscriptId, filename = 'test.txt' }) => {
  const manuscript = await Manuscript.findById(manuscriptId)

  if (!manuscript) {
    throw new Error(`No manuscript found with id "${manuscriptId}"`)
  }

  const file = await createFile(Readable.from('e2e test file'), filename, {
    tags: ['supplementary'],
    objectId: manuscriptId,
  })

  return { id: file.id }
}

// Seeds a threaded discussion on a manuscript's decision form field, in the
// same shape threadedDiscussion.controllers.js writes, and points the
// decision review's jsonData at it (which is how the decision form finds it).
//
// comments: submitted comments, in order - [{ username, comment }]
// pendingComments: unsubmitted drafts - [{ username, comment, commentIndex }].
//   With commentIndex, the draft is an edit of that submitted comment;
//   without it, it's a new, never-submitted comment. Lets tests set up states
//   the UI no longer allows (eg. a draft by a user who can't comment).
const createThreadedDiscussion = async ({
  manuscriptId,
  fieldName,
  comments = [],
  pendingComments = [],
}) => {
  const manuscript = await Manuscript.findById(manuscriptId)

  if (!manuscript) {
    throw new Error(`No manuscript found with id "${manuscriptId}"`)
  }

  const findUserId = async username => {
    const user = await User.findOne({ username })
    if (!user) throw new Error(`No user found named "${username}"`)
    return user.id
  }

  // Distinct, increasing timestamps keep comment ordering deterministic
  const baseTime = Date.now() - 60 * 60 * 1000
  const at = offset => new Date(baseTime + offset * 1000).toISOString()

  const submittedComments = await Promise.all(
    comments.map(async ({ username, comment }, index) => ({
      id: randomUUID(),
      manuscriptVersionId: manuscriptId,
      created: at(index),
      updated: at(index),
      commentVersions: [
        {
          id: randomUUID(),
          created: at(index),
          updated: at(index),
          userId: await findUserId(username),
          comment,
        },
      ],
      pendingVersions: [],
    })),
  )

  const newDraftComments = []

  await Promise.all(
    pendingComments.map(async ({ username, comment, commentIndex }) => {
      const pendingVersion = {
        userId: await findUserId(username),
        created: at(100),
        updated: at(100),
        comment,
      }

      if (commentIndex === undefined) {
        newDraftComments.push({
          id: randomUUID(),
          manuscriptVersionId: manuscriptId,
          created: at(100),
          commentVersions: [],
          pendingVersions: [pendingVersion],
        })
      } else {
        submittedComments[commentIndex].pendingVersions.push(pendingVersion)
      }
    }),
  )

  const threadId = randomUUID()
  const allComments = [...submittedComments, ...newDraftComments]

  const discussion = await ThreadedDiscussion.query().insertAndFetch({
    manuscriptId,
    threads: JSON.stringify([
      { id: threadId, created: at(0), updated: at(0), comments: allComments },
    ]),
  })

  const existingDecision = await Review.query().findOne({
    manuscriptId,
    isDecision: true,
  })

  if (existingDecision) {
    const jsonData =
      typeof existingDecision.jsonData === 'string'
        ? JSON.parse(existingDecision.jsonData)
        : existingDecision.jsonData || {}

    await Review.query().patchAndFetchById(existingDecision.id, {
      jsonData: JSON.stringify({ ...jsonData, [fieldName]: discussion.id }),
    })
  } else {
    await Review.insert({
      manuscriptId,
      userId: manuscript.submitterId,
      isDecision: true,
      isHiddenFromAuthor: false,
      isHiddenReviewerName: false,
      jsonData: JSON.stringify({ [fieldName]: discussion.id }),
    })
  }

  return {
    threadedDiscussionId: discussion.id,
    threadId,
    commentIds: allComments.map(c => c.id),
  }
}

// Deletes the shared pw-* users (and, via cascade, their team memberships).
// Not part of deleteGroup(sByPrefix) - these users aren't owned by any one
// group, so cleaning them up is a separate step, meant to run once at the
// very end of a whole test run (see globalTeardown.ts), not per-group.
const deleteSharedUsers = async () => {
  const usernames = [
    SHARED_USERS.admin,
    SHARED_USERS.groupAdmin,
    SHARED_USERS.groupManager,
    SHARED_USERS.userWithOrcid,
    ...SHARED_USERS.generic,
  ]

  const users = (
    await Promise.all(usernames.map(username => User.findOne({ username })))
  ).filter(Boolean)

  if (users.length === 0) return { deletedUsers: 0 }

  // identities.user_id has no ON DELETE CASCADE, unlike team_members.user_id.
  await Promise.all(
    users.map(user => deleteAllMatching(Identity, { userId: user.id })),
  )

  await User.deleteByIds(users.map(user => user.id))

  return { deletedUsers: users.length }
}

module.exports = {
  createGroup,
  deleteGroup,
  deleteGroupsByPrefix,
  createManuscripts,
  assignRole,
  setReviewerStatus,
  createReview,
  createDecision,
  createGroupUser,
  updateGroupConfig,
  updateFormFields,
  updateManuscriptSubmission,
  patchManuscript,
  setManuscriptCreated,
  deleteSharedUsers,
  addManuscriptFile,
  createThreadedDiscussion,
}
