const chunk = require('lodash/chunk')

const { File, fileStorage, logger, useTransaction } = require('@coko/server')

const {
  Channel,
  Config,
  EmailTemplate,
  Identity,
  Invitation,
  Manuscript,
  Task,
  TaskEmailNotification,
  Team,
  TeamMember,
  User,
} = require('../models')

const seekEvent = require('../services/notification.service')

const { sendEmail } = require('../services/emailNotifications.service')

const { processData, useHandlebars } = require('../services/handlebars.service')

const {
  cachedGet,
  evictFromCacheByPrefix,
} = require('../services/queryCache.service')

const { safeParse } = require('../utils/objectUtils')

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+$/

const INVITATION_TYPES = [
  'authorInvitation',
  'reviewerInvitation',
  'collaborativeReviewerInvitation',
]

const addGlobalAndGroupRolesToUserObject = async (user, groupId) => {
  if (!user) return
  Object.assign(user, await getGroupAndGlobalRoles(user.id, groupId))
}

const channelUsersForMention = async (channelId, groupId) => {
  return useTransaction(async trx => {
    if (!channelId) {
      throw new Error('Channel ID is required.')
    }

    const channelWithUsers = await Channel.query(trx)
      .findById(channelId)
      .withGraphFetched('users(orderByUsername)')

    if (!channelWithUsers) {
      throw new Error('Channel not found.')
    }

    const activeConfig = await Config.getCached(channelWithUsers.groupId, {
      trx,
    })

    const reviewerTeam = await Team.query(trx)
      .findOne({
        objectId: channelWithUsers.manuscriptId,
        role: 'reviewer',
      })
      .withGraphFetched('members')

    const hideFromReviewers =
      activeConfig.formData.discussionChannel?.hideDiscussionFromReviewers

    let result = [...channelWithUsers.users]

    if (hideFromReviewers && reviewerTeam) {
      const memberUserIds = reviewerTeam.members.map(member => member.userId)

      result = result.filter(
        chatMember => !memberUserIds.includes(chatMember.id),
      )
    }

    if (channelWithUsers.type !== 'all') {
      const groupManagers = await Team.relatedQuery('users')
        .for(
          Team.query(trx)
            .where({
              objectId: groupId,
              objectType: 'Group',
            })
            .whereIn('role', ['groupManager', 'groupAdmin']),
        )
        .whereNotIn(
          'users.id',
          result.map(user => user.id),
        )
        .modify('orderByUsername')

      result.push(...groupManagers)
    }

    return result
  })
}

const defaultIdentity = async user => {
  return cachedGet(`defaultIdentityOfUser:${user.id}`)
}

const expandChat = async (userId, state) => {
  const user = await User.query().patchAndFetchById(userId, {
    chatExpanded: state,
  })

  return user
}

const deleteUser = async (id, groupId) => {
  return User.transaction(async trx => {
    const user = await User.query(trx).findById(id)

    await Manuscript.query(trx)
      .update({ submitterId: null })
      .where({ submitterId: id })

    await Invitation.query(trx).where({ userId: id }).delete()

    // TODO: Fix database validation error sender_id is set not null 1647493905-invitations.sql
    await Invitation.query(trx)
      .update({ senderId: null })
      .where({ senderId: id })

    await User.query(trx).where({ id }).delete()

    logger.info(`User ${id} (${user.username}) deleted.`)

    seekEvent('user-delete', {
      user,
      groupId,
    })

    return user
  })
}

const getCurrentUser = async (userId, groupId) => {
  if (!userId) return null

  const user = await User.query().patchAndFetchById(userId, {
    lastOnline: new Date(Date.now()),
  })

  if (!user) return null
  await addGlobalAndGroupRolesToUserObject(user, groupId)
  return user
}

const getEditorEmails = async (manuscriptId, options = {}) => {
  const { trx } = options
  const userIds = await Manuscript.getEditorIds(manuscriptId, { trx })
  const users = await User.query(trx).whereIn('id', userIds)
  return users.map(user => user.email)
}

const getGroupAndGlobalRoles = async (userId, groupId, options = {}) => {
  const { trx } = options
  if (!userId) return { groupRoles: [], globalRoles: [] }

  const groupAndGlobalTeams = await Team.query(trx)
    .select('role', 'objectId')
    .withGraphJoined('members')
    .where({ userId })
    .where(function subcondition() {
      this.whereRaw('global').orWhere({ objectId: groupId })
    })

  const groupRoles = []
  const globalRoles = []
  groupAndGlobalTeams.forEach(team => {
    // TODO remove the first condition once groups have IDs
    if (team.role === 'admin') globalRoles.push(team.role)
    else if (team.objectId === groupId) groupRoles.push(team.role)
    else globalRoles.push(team.role)
  })

  return { groupRoles, globalRoles }
}

const getReciever = async (selectedEmail, externalName, trx) => {
  if (!selectedEmail) return { name: externalName, id: null }

  const [userReceiver] = await User.query(trx)
    .where({ email: selectedEmail })
    .withGraphFetched('[defaultIdentity]')

  return {
    name: userReceiver.username || userReceiver.defaultIdentity.name || '',
    id: userReceiver.id,
  }
}

/** If the current user is a 'shared' reviewer for the given manuscript,
 * return their userId plus the userIds of any other reviewers who are
 * also 'shared' and have COMPLETED their review.
 * If the current user isn't a 'shared' reviewer, return an empty array.
 */
const getSharedReviewersIds = async (
  manuscriptId,
  currentUserId,
  options = {},
) => {
  if (!currentUserId) return []

  const { trx } = options

  const reviewers = await Team.relatedQuery('members', trx)
    .for(Team.query(trx).where({ objectId: manuscriptId, role: 'reviewer' }))
    .select('userId')
    .where({ isShared: true })
    .where(builder =>
      builder.where({ status: 'completed' }).orWhere({ userId: currentUserId }),
    )

  if (!reviewers.some(r => r.userId === currentUserId)) return []
  return reviewers.map(r => r.userId)
}

const getUser = async (id, groupId) => {
  if (id) {
    const u = await User.query().findById(id)
    await addGlobalAndGroupRolesToUserObject(u, groupId)
    return u
  }

  return null
}

/** Returns an object of boolean values corresponding to roles the user could hold:
 * groupManager, admin, author, reviewer, editor, handlingEditor, seniorEditor, managingEditor.
 * Each is true if the user holds that role.
 * Note, an 'invited' or 'rejected' reviewer does NOT have reviewer role.
 * Also, "anyEditor" indicates if the user holds any editorial role for the manuscript;
 * "anyEditorOrManager" indicates any editorial role or groupManager or admin. */
const getUserRolesInManuscript = async (userId, manuscriptId, options = {}) => {
  const { trx } = options
  if (!manuscriptId) return {}
  const manuscript = await Manuscript.query(trx).findById(manuscriptId)
  const { groupId } = manuscript

  const userIsAdmin = userId && (await cachedGet(`userIsAdmin:${userId}`))
  const userIsGM = userId && (await cachedGet(`userIsGM:${userId}:${groupId}`))

  const userIsGroupAdmin =
    userId && (await cachedGet(`userIsGroupAdmin:${userId}:${groupId}`))

  const result = {
    admin: userIsAdmin,
    groupManager: userIsGM,
    groupAdmin: userIsGroupAdmin,
    author: false,
    reviewer: false,
    collaborativeReviewer: false,
    editor: false,
    handlingEditor: false,
    seniorEditor: false,
    managingEditor: false,
    anyEditor: false,
    anyEditorOrManager: false,
  }

  if (!userId || !manuscriptId) return result

  const teams = await Team.query(trx)
    .select('role')
    .withGraphJoined('members')
    .where({ objectId: manuscriptId, userId })
    // If status is null, whereNotIn('status', ['invited', 'rejected']) returns false.
    // I'm not sure why this is, but it means we need a separate check for status===null.
    .where(
      builder =>
        builder
          .whereNull('status')
          .orWhereNotIn('status', ['invited', 'rejected']), // Reviewers with status 'invited' or 'rejected' are not actually reviewers
    )

  teams.forEach(t => {
    result[t.role] = true
  })

  result.anyEditor =
    result.editor ||
    result.handlingEditor ||
    result.seniorEditor ||
    result.managingEditor

  result.anyEditorOrManager =
    result.anyEditor || result.admin || result.groupManager || result.groupAdmin

  return result
}

const getUsers = async groupId => {
  return User.query()
    .joinRelated('teams')
    .where({
      role: 'user',
      objectId: groupId,
    })
    .modify('orderByUsername')
    .withGraphFetched('defaultIdentity')
}

const getUsersById = async (userIds, options = {}) => {
  const { trx } = options
  return User.query(trx).findByIds(userIds)
}

const isUserOnline = async user => {
  const currentDateTime = new Date()
  return user.lastOnline && currentDateTime - user.lastOnline < 5 * 60 * 1000
}

const paginatedUsers = async (userId, groupId, sort, offset, limit) => {
  const cu = await User.query().findById(userId)
  await addGlobalAndGroupRolesToUserObject(cu, groupId)

  let query

  if (cu.globalRoles.includes('admin')) {
    query = User.query()
  } else {
    query = User.query().joinRelated('teams').where({
      role: 'user',
      objectId: groupId,
    })
  }

  const totalCount = await query.resultSize()

  if (sort) {
    // e.g. 'created_DESC' into 'created' and 'DESC' arguments
    const [fieldName, direction] = sort.split('_')

    if (fieldName === 'lastOnline') {
      query.orderByRaw(
        `(last_online IS NULL) ${direction === 'DESC' ? 'ASC' : 'DESC'}`,
      )
    }

    query.orderBy(fieldName, direction)
  }

  if (limit) {
    query.limit(limit)
  }

  if (offset) {
    query.offset(offset)
  }

  const users = await query

  // eslint-disable-next-line no-restricted-syntax
  for (const someUsers of chunk(users, 10)) {
    // eslint-disable-next-line no-await-in-loop
    await Promise.all(
      someUsers.map(async user =>
        addGlobalAndGroupRolesToUserObject(user, groupId),
      ),
    )
  }

  return {
    totalCount,
    users,
  }
}

const profilePicture = async user => {
  if (!user.profilePicture) return null
  const file = await File.query().findById(user.profilePicture)

  let small

  try {
    small = file.getStoredObjectBasedOnType('small')
  } catch (e) {
    return null
  }

  const url = await fileStorage.getURL(small.key)
  return url
}

const searchUsers = async (teamId, query) => {
  if (teamId) {
    return User.model
      .query()
      .where({ teamId })
      .where('username', 'ilike', `${query}%`)
  }

  return User.model.query().where('username', 'ilike', `${query}%`)
}

/**
 * TODO: refactor:
 * This is actually sending a invitation conditionally and also a email, in this
 * case is invitation, should be renamed to sendInvitation
 *
 * regarding sendEmailWithPreparedData, once we refactor task notifications,
 * should be renamed to somethig like eg: inviteAndSendEmail
 */
const sendEmailFn = async (input, ctx) => {
  try {
    // REFACTOR: do not pass ctx, be specific
    const result = await sendEmailWithPreparedData(input, ctx)
    return {
      invitation: result,
      response: {
        success: result.success,
      },
    }
  } catch (error) {
    return {
      invitation: null,
      response: {
        success: false,
        errorMessage: error.message,
      },
    }
  }
}

// TODO: This should be refactored:
// we should have the invitation and email sending logic separated, or we can have it like this if this is the only purpose of this function,
// the problem is that this is still beign used for sending task email nottifications, once we change that, we can refactor this and/or just rename it to inviteAndSendEmail maybe, and also rename the sendEmail mutation.
//
// Another issue is that we're relying on the emailTemplateType to determine the invitation type(and also if it should invite)
// we need to change the implementation on 'Tasks & notifications' tab from the DecisionPage on the client to send invitations to reimplement this
const sendEmailWithPreparedData = async (
  input,
  ctx,
  emailSender,
  options = {},
) => {
  const { trx } = options

  const {
    manuscript: inputManuscript,
    selectedEmail: rawSelectedEmail, // selectedExistingRecieverEmail (TODO?): This is for a pre-existing receiver being selected
    selectedTemplate, // selectedEmailTemplateId
    externalEmail: rawExternalEmail, // New User Email
    externalName, // New User username
    currentUser, // Name of the currentUser or senderName
    groupId,
  } = safeParse(input, input)

  const selectedEmail = (rawSelectedEmail ?? '').toLowerCase()
  const externalEmail = (rawExternalEmail ?? '').toLowerCase()

  const template = await EmailTemplate.query(trx).findById(selectedTemplate)

  const to = externalEmail || selectedEmail
  let receiverName = externalName

  if (selectedEmail) {
    const [userReceiver] = await User.query(trx)
      .where({ email: selectedEmail })
      .withGraphFetched('[defaultIdentity]')

    receiverName =
      userReceiver.username || userReceiver.defaultIdentity.name || ''
  }

  const manuscript = await Manuscript.findById(inputManuscript.id, { trx })
  const manuscriptId = manuscript.id
  const author = await manuscript.getManuscriptAuthor({ trx })
  const authorName = author ? author.username : ''
  const emailValidationResult = EMAIL_REGEX.test(to)

  if (!emailValidationResult || !receiverName) {
    return { success: false }
  }

  const { emailTemplateType: type } = template
  const isInvitation = INVITATION_TYPES.includes(type)

  if (isInvitation) {
    const invitationPayload = {
      type,
      emailSender: !ctx ? emailSender : await User.findById(ctx.userId),
      externalName,
      manuscriptId,
      selectedEmail,
      externalEmail,
    }

    const invitationResult = await sendInvitation(invitationPayload, ctx)
    const { invitation, ...invitationData } = invitationResult
    const { success } = invitationData

    if (success) {
      // TODO: we're relying on the emailTemplateType until we change the 'Tasks & notifications' tab from the DecisionPage on the client

      const eventName = {
        authorInvitation: 'author-invitation',
        reviewerInvitation: 'review-invitation',
        collaborativeReviewerInvitation: 'collaborative-review-invitation',
      }[type]

      const eventData = {
        manuscript,
        authorName,
        senderName: currentUser,
        recipientName: receiverName,
        ...invitationData,
        context: { recipient: invitationData.toEmail, invitation },
        groupId,
      }

      const eventResult = await seekEvent(eventName, eventData) // we need only the success from this
      seekEvent(`${eventName}-follow-up`, eventData)

      return { success: !!success && !!eventResult.success, ...invitation }
    }
  }

  const ccEmails = await getEditorEmails(manuscriptId, { trx })

  try {
    const variables = {
      authorName,
      senderName: currentUser,
      recipientName: receiverName,
      ccEmails,
      manuscript,
    }

    let { cc, body, subject, ccEditors } = template.emailContent ?? {}

    // TODO: replace this as we dont have cc or ccEditors in the template anymore
    if (ccEditors && ccEmails) {
      cc += `,${ccEmails.join(',')}`
    }

    const dataForHandlebars = await processData(variables, groupId)

    const mailPayload = {
      to,
      cc,
      subject: useHandlebars(subject, dataForHandlebars),
      content: useHandlebars(body, dataForHandlebars),
    }

    const result = await sendEmail(mailPayload, groupId)

    return { success: result }
  } catch (e) {
    console.error(e)
    return { success: false }
  }
}

const sendInvitation = async input => {
  const {
    type,
    emailSender,
    externalName,
    manuscriptId,
    selectedEmail,
    externalEmail,
  } = input

  const receiverEmail = externalEmail || selectedEmail
  const isEmailValid = EMAIL_REGEX.test(receiverEmail)
  const receiver = await getReciever(selectedEmail, externalName)

  if (!isEmailValid || !receiver) return { success: false }

  const invitedPersonTypes = {
    authorInvitation: 'AUTHOR',
    reviewerInvitation: 'REVIEWER',
    collaborativeReviewerInvitation: 'COLLABORATIVE_REVIEWER',
  }

  const invitationData = {
    manuscriptId,
    toEmail: receiverEmail,
    purpose: 'Inviting an author to accept a manuscript',
    status: 'UNANSWERED',
    senderId: emailSender ? emailSender.id : null,
    invitedPersonType: invitedPersonTypes[type],
    invitedPersonName: receiver.name,
    userId: receiver.id,
  }

  let invitation = await Invitation.findOne({
    manuscriptId,
    toEmail: receiverEmail,
    purpose: 'Inviting an author to accept a manuscript',
    status: 'UNANSWERED',
    invitedPersonType: invitedPersonTypes[type],
    userId: receiver.id,
  })

  if (!invitation) {
    invitation = await Invitation.insert(invitationData)
  }

  const invitationId = invitation.id

  return {
    success: !!invitationId,
    invitationId,
    receiverName: receiver.name,
    invitation,
    ...invitationData,
  }
}

const setGlobalRole = async (userId, groupId, role, shouldEnable) => {
  const team = await Team.query().findOne({ role, global: true })
  await setUserMembershipInTeam(userId, groupId, team, shouldEnable)
  const user = await User.findById(userId)
  await addGlobalAndGroupRolesToUserObject(user, groupId)
  delete user.updated
  return user
}

const setGroupRole = async (userId, groupId, role, shouldEnable) => {
  const team = await Team.query().findOne({
    role,
    objectId: groupId,
  })

  await setUserMembershipInTeam(userId, groupId, team, shouldEnable)
  const user = await User.findById(userId)
  await addGlobalAndGroupRolesToUserObject(user, groupId)
  delete user.updated

  seekEvent('user-set-group-role', {
    user,
    role,
    groupId,
  })
  return user
}

const setUserMembershipInTeam = async (
  userId,
  groupId,
  team,
  shouldBeMember,
) => {
  if (!team) return // We won't create a new team: this is only intended for existing teams
  evictFromCacheByPrefix('userIs')
  evictFromCacheByPrefix('membersOfTeam')
  const teamId = team.id

  if (shouldBeMember) {
    await TeamMember.query()
      .insert({ userId, teamId })
      .whereNotExists(TeamMember.query().where({ userId, teamId }))
  } else {
    await TeamMember.transaction(async trx => {
      if (team.role === 'user') {
        const manuscripts = await Manuscript.query(trx)
          .where({ groupId })
          .withGraphFetched('[teams, invitations, tasks]')

        const manuscriptTeams = manuscripts.flatMap(
          manuscript => manuscript.teams,
        )

        // Remove user from assigned manuscript teams be it author, seniorEditor, handlingEditor, editor, reviewer which are not completed
        await Promise.all(
          manuscriptTeams.map(async manuscriptTeam => {
            const member = await TeamMember.query(trx).findOne({
              userId,
              teamId: manuscriptTeam.id,
            })

            // Skips removing reviewer team members with completed reviews
            if (member && (!member.status || member.status !== 'completed')) {
              await TeamMember.query().deleteById(member.id)
            }
          }),
        )

        const manuscriptInvitations = manuscripts.flatMap(
          manuscript => manuscript.invitations,
        )

        // Remove user UNANSWERED invitations and sent out invitations
        await Promise.all(
          manuscriptInvitations.map(async manuscriptInvitation => {
            const invitation = await Invitation.query(trx).findById(
              manuscriptInvitation.id,
            )

            if (
              invitation.userId === userId &&
              invitation.status === 'UNANSWERED'
            ) {
              await Invitation.query().deleteById(invitation.id)
            } else if (invitation.senderId === userId) {
              // TODO: Fix database validation error sender_id is set not null 1647493905-invitations.sql
              // await Invitation.query(
              //   trx,
              // ).patchAndFetchById(invitation.id, { senderId: null })
            }
          }),
        )

        // Remove user from assignee tasks
        await Task.query(trx)
          .patch({ assigneeUserId: null, assigneeType: null })
          .where({ assigneeUserId: userId, groupId })

        const manuscriptTasks = manuscripts.flatMap(
          manuscript => manuscript.tasks,
        )

        // Remove user from task email notifications
        await Promise.all(
          manuscriptTasks.map(async manuscriptTask => {
            const task = await Task.query(trx).findById(manuscriptTask.id)

            await TaskEmailNotification.query(trx)
              .delete()
              .where({ recipientUserId: userId, taskId: task.id })
          }),
        )

        // Remove user from submitted manuscripts
        await Manuscript.query(trx)
          .update({ submitterId: null })
          .where({ submitterId: userId, groupId })

        await TeamMember.query(trx).delete().where({ userId, teamId })
      } else {
        await TeamMember.query(trx).delete().where({ userId, teamId })
      }
    })
  }
}

const updateEmail = async (id, email) => {
  return useTransaction(async trx => {
    const user = await User.findById(id, { trx })

    if (user.email === email) {
      return { success: true }
    }

    const emailValidationRegexp =
      /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i

    const emailValidationResult = emailValidationRegexp.test(email)

    if (!emailValidationResult) {
      return { success: false, error: 'invalidEmail' }
    }

    const userWithSuchEmail = await User.findOne({ email }, { trx })

    if (userWithSuchEmail) {
      return { success: false, error: 'emailTaken' }
    }

    // if first login, check for existing invites across all groups for email
    if (!user.email) {
      const { result: invitations } = await Invitation.find(
        {
          toEmail: email,
          status: 'UNANSWERED',
          userId: null,
        },
        { trx },
      )

      if (invitations.length) {
        await Promise.all(
          invitations.map(async invite => {
            await invite.patch({ userId: user.id })

            await Manuscript.addReviewer(
              invite.manuscriptId,
              user.id,
              null, // do not accept yet
              invite.invitedPersonType === 'COLLABORATIVE_REVIEWER',
              { trx },
            )
          }),
        )
      }
    }

    try {
      const updatedUser = await User.patchAndFetchById(
        id,
        {
          email,
        },
        { trx },
      )

      return { success: true, user: updatedUser }
    } catch (e) {
      return { success: false, error: 'smthWentWrong', user: null }
    }
  })
}

const updateLanguage = async (id, preferredLanguage) => {
  return User.query().patchAndFetchById(id, { preferredLanguage })
}

const updateMenuUI = async (userId, expanded) => {
  const user = await User.query().patchAndFetchById(userId, {
    menuPinned: expanded,
  })

  return user
}

const updateRecentTab = async (userId, tab) => {
  const user = await User.query().patchAndFetchById(userId, {
    recentTab: tab,
  })

  return user
}

const updateUser = async (id, input) => {
  if (input.password) {
    // eslint-disable-next-line no-param-reassign
    input.passwordHash = await User.hashPassword(input.password)
    // eslint-disable-next-line no-param-reassign
    delete input.password
  }

  const updatedUser = JSON.parse(input)

  delete updatedUser.globalRoles
  delete updatedUser.groupRoles
  return User.query().patchAndFetchById(id, updatedUser)
}

const updateUsername = async (id, username) => {
  return User.query().patchAndFetchById(id, { username })
}

const userIdentities = async user => {
  const identities = await Identity.query().where({
    userId: user.id,
  })

  return identities
}

module.exports = {
  channelUsersForMention,
  defaultIdentity,
  deleteUser,
  expandChat,
  getCurrentUser,
  getSharedReviewersIds,
  getUser,
  getUserRolesInManuscript,
  getUsers,
  getUsersById,
  isUserOnline,
  paginatedUsers,
  profilePicture,
  searchUsers,
  sendEmail: sendEmailFn,
  sendEmailWithPreparedData,
  setGlobalRole,
  setGroupRole,
  updateEmail,
  updateLanguage,
  updateMenuUI,
  updateRecentTab,
  updateUser,
  updateUsername,
  userIdentities,
}
