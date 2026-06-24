const { logger, sendEmail, User } = require('@coko/server')
const { Team, TeamMember } = require('../models')

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// TODO: find another place for this one
const getSeconds = unit => {
  const secondsInAMinute = 60
  const secondsInADay = 24 * 60 * 60
  return {
    mins: unit * secondsInAMinute,
    days: unit * secondsInADay,
    weeks: unit * 7 * secondsInADay,
  }
}

const getRecipientsEmails = async ({
  recipient,
  ccEmails,
  manuscriptId: msId,
  groupId: gId,
  contextRecipient: ctxFrom,
}) => {
  const eventFrom = (await getRecipient(recipient, msId, gId, false)) ?? []
  const eventCCs = (await getRecipient(ccEmails, msId, gId, true)) ?? []

  const ctxRecipient =
    ctxFrom && (await getRecipient(ctxFrom, msId, gId, false))

  if (ctxRecipient && eventFrom) {
    eventCCs.push(eventFrom)
  }

  const to = ctxRecipient || eventFrom
  const ccWithoutTo = eventCCs.filter(em => em !== to)
  const cc = [...new Set(ccWithoutTo)].flat(2)
  const recipientUser = await User.query().where({ email: to }).first()

  logger.info(`Recipients: ${to} and CC: ${cc}`)
  logger.info(`Recipient User: ${recipientUser?.username}`)

  return { to, cc, recipientUser }
}

const getRecipient = async (recipient, manuscriptId, groupId, getTeam) => {
  if (Array.isArray(recipient)) {
    const results = await Promise.all(
      recipient.map(async r => getRecipient(r, manuscriptId, groupId, getTeam)),
    )

    return results
  }

  if (EMAIL_REGEX.test(recipient)) return recipient
  if (EMAIL_REGEX.test(recipient?.email)) return recipient.email

  if (['groupManager', 'groupAdmin'].includes(recipient)) {
    const groupManagerTeam = await Team.query().findOne({
      role: recipient,
      objectId: groupId,
      objectType: 'Group',
    })

    const groupManager = await TeamMember.query().findOne({
      teamId: groupManagerTeam.id,
    })

    const user = await User.query().findById(groupManager.userId)
    return EMAIL_REGEX.test(user?.email) ? user?.email : ''
  }

  if (!manuscriptId) return ''

  const [team] = await Team.query()
    .where('objectId', manuscriptId)
    .where('role', recipient)

  if (team) {
    const members = await TeamMember.query().where('teamId', team.id)

    const users = await Promise.all(
      members.map(async member => {
        const user = User.query().findById(member.userId)
        return user
      }),
    )

    return getTeam ? users.map(user => user?.email) : users[0]?.email
  }

  return []
}

const send = async (mailPayload, groupId) => {
  const { Config } = require('../models')

  try {
    const { formData } = (await Config.getCached(groupId)) ?? {}

    const {
      from,
      host: hostRaw,
      port,
      user,
      pass,
      bcc,
      advancedSettings,
    } = formData.emailNotification || {}

    const { requireTLS, secure } = advancedSettings || {}

    const host = hostRaw?.trim() || ''

    let mailer = {}

    if (host && port && user && pass) {
      mailer = {
        host,
        port,
        auth: {
          user,
          pass,
        },
        secure,
        requireTLS: !secure && requireTLS,
      }
    }

    const { attachments, cc, content, subject, text, to } = mailPayload

    const emailData = {
      to,
      cc,
      bcc,
      from,
      html: `<div>${content}</div>`,
      subject: `${subject}`,
      text: text || content,
      attachments: attachments || [],
    }

    const info = await sendEmail(emailData, mailer)
    logger.info(`Email report:`)
    logger.info(info)
    return true
  } catch (err) {
    logger.error(err)
    return false
  }
}

module.exports = {
  sendEmail: send,
  getSeconds,
  getRecipientsEmails,
}
