/* eslint-disable promise/always-return */

const { difference, map } = require('lodash')
const path = require('path')
const fs = require('fs-extra').promises
const { useTransaction, logger } = require('@coko/server')

const Channel = require('../models/channel/channel.model')
const Group = require('../models/group/group.model')
const Team = require('../models/team/team.model')
const EmailTemplate = require('../models/emailTemplate/emailTemplate.model')
const ArticleTemplate = require('../models/articleTemplate/articleTemplate.model')
const Config = require('../models/config/config.model')

const seedConfig = require('./seedConfig')
const seedForms = require('./seedForms')
const seedCmsFiles = require('./seedCmsFiles')
const defaultEmailTemplates = require('../config/defaultEmailTemplates')
const { generateCss } = require('../utils/applyTemplate')
const { seedNotifications } = require('./seedNotifications')

const defaultTemplatePath = path.resolve(__dirname, '../utils//pdfTemplates')
const userTemplatePath = path.resolve(__dirname, '../config/journal/export')

const createGroupAndRelatedData = async (
  groupName,
  instanceName,
  index,
  options,
) => {
  const { trx } = options
  const groupExists = await Group.query(trx).findOne({ name: groupName })

  let group = null

  if (groupExists && groupExists.isArchived) {
    // Unarchive group that are added back to INSTANCE_GROUPS
    group = await Group.query(trx).patchAndFetchById(groupExists.id, {
      isArchived: false,
    })

    logger.info(
      `  Group "${groupName}" already exists in database and has been unarchived.`,
    )
  } else if (groupExists) {
    group = groupExists
    logger.info(`  Group "${groupName}" already exists in database. Skipping.`)
  } else {
    // Seed group when a new entry is added to INSTANCE_GROUPS
    group = await Group.query(trx).insertAndFetch({
      name: groupName,
      isArchived: false,
      type: 'Group',
    })

    logger.info(`  Added "${group.name}" group to database.`)
  }

  // Seed config and link it to the created group
  const config = await seedConfig(group, instanceName, index, { trx })

  // Seed forms and link it to the created group
  await seedForms(group, config, { trx })

  await seedCmsFiles(group, { trx })

  // Seed System-wide discussion channel and link it to the created group
  const channelExists = await Channel.query(trx).findOne({
    topic: 'System-wide discussion',
    type: 'editorial',
    groupId: group.id,
  })

  if (!channelExists) {
    const channel = await Channel.query(trx).insertAndFetch({
      topic: 'System-wide discussion',
      type: 'editorial',
      groupId: group.id,
    })

    logger.info(`    Added ${channel.topic} for "${group.name}".`)
  } else {
    logger.info(
      `    ${channelExists.topic} already exists in database for "${group.name}". Skipping.`,
    )
  }

  // Seed user role and link it to the created group
  const userTeamExists = await Team.query(trx).findOne({
    role: 'user',
    global: false,
    objectId: group.id,
    objectType: 'Group',
  })

  if (!userTeamExists) {
    const userTeam = await Team.query(trx).insertAndFetch({
      displayName: 'User',
      role: 'user',
      global: false,
      objectId: group.id,
      objectType: 'Group',
    })

    logger.info(`    Added ${userTeam.displayName} team for "${group.name}".`)
  } else {
    logger.info(
      `    ${userTeamExists.displayName} team already exists in database for "${group.name}". Skipping.`,
    )
  }

  // Seed groupAdmin role and link it to the created group
  const groupAdminTeamExists = await Team.query(trx).findOne({
    role: 'groupAdmin',
    global: false,
    objectId: group.id,
    objectType: 'Group',
  })

  if (!groupAdminTeamExists) {
    const groupAdminTeam = await Team.query(trx).insertAndFetch({
      displayName: 'Group Admin',
      role: 'groupAdmin',
      global: false,
      objectId: group.id,
      objectType: 'Group',
    })

    logger.info(
      `    Added ${groupAdminTeam.displayName} team for "${group.name}".`,
    )
  } else {
    logger.info(
      `    ${groupAdminTeamExists.displayName} team already exists in database for "${group.name}". Skipping.`,
    )
  }

  // Seed groupManager role and link it to the created group
  const groupManagerTeamExists = await Team.query(trx).findOne({
    role: 'groupManager',
    global: false,
    objectId: group.id,
    objectType: 'Group',
  })

  if (!groupManagerTeamExists) {
    const groupManagerTeam = await Team.query(trx).insertAndFetch({
      displayName: 'Group Manager',
      role: 'groupManager',
      global: false,
      objectId: group.id,
      objectType: 'Group',
    })

    logger.info(
      `    Added ${groupManagerTeam.displayName} team for "${group.name}".`,
    )
  } else {
    logger.info(
      `    ${groupManagerTeamExists.displayName} team already exists in database for "${group.name}". Skipping.`,
    )
  }

  // Seed Group Templates and link it to the created group
  const existingArticleTemplate = await ArticleTemplate.query(trx).where({
    groupId: group.id,
    isCms: false,
  })

  if (existingArticleTemplate.length === 0) {
    const cssTemplate = await generateCss()
    let articleTemplate = ''

    try {
      const userTemplateBuffer = await fs.readFile(
        `${userTemplatePath}/article.njk`,
      )

      articleTemplate += userTemplateBuffer.toString()
    } catch {
      logger.error('No user PagedJS stylesheet found')

      const defaultTemplateBuffer = await fs.readFile(
        `${defaultTemplatePath}/article.njk`,
      )

      articleTemplate += defaultTemplateBuffer
    }

    await ArticleTemplate.query(trx).insertGraph({
      article: articleTemplate,
      css: cssTemplate,
      groupId: group.id,
      isCms: false,
    })

    logger.info(`Added default group template for "${group.name}".`)
  } else {
    logger.info(
      `    ${existingArticleTemplate.length} group templates already exists in database for "${group.name}". Skipping.`,
    )
  }

  // Seed Group Templates and link it to the created group for cms
  const existingCmsArticleTemplate = await ArticleTemplate.query(trx).where({
    groupId: group.id,
    isCms: true,
  })

  if (existingCmsArticleTemplate.length === 0) {
    await ArticleTemplate.query(trx).insertGraph({
      article: '',
      css: '',
      groupId: group.id,
      isCms: true,
    })
  }

  // Seed email templates and link it to the created group
  const existingEmailTemplates = await EmailTemplate.query(trx).where({
    groupId: group.id,
  })

  if (existingEmailTemplates.length === 0) {
    const emailTemplatesData = defaultEmailTemplates.map(template => ({
      emailTemplateType: template.type,
      emailContent: {
        subject: template.subject,
        cc: template.cc,
        ccEditors: template.ccEditors,
        body: template.body,
        description: template.description,
      },
      groupId: group.id,
    }))

    // Insert default email templates into the database for group
    const insertedEmailTemplates =
      await EmailTemplate.query(trx).insertGraph(emailTemplatesData)

    logger.info(
      `    Added ${insertedEmailTemplates.length} number of default email templates for "${group.name}".`,
    )

    // Map default templates to config Event Notification for reviewerInvitation, authorProofingInvitation, authorProofingSubmitted
    const reviewerInvitationEmailTemplate = insertedEmailTemplates.find(
      e =>
        e.groupId === group.id && e.emailTemplateType === 'reviewerInvitation',
    )

    const authorProofingInvitationTemplate = insertedEmailTemplates.find(
      e =>
        e.groupId === group.id &&
        e.emailTemplateType === 'authorProofingInvitation',
    )

    const authorProofingSubmittedTemplate = insertedEmailTemplates.find(
      e =>
        e.groupId === group.id &&
        e.emailTemplateType === 'authorProofingSubmitted',
    )

    const newConfig = config
    newConfig.formData.eventNotification.reviewerInvitationPrimaryEmailTemplate =
      reviewerInvitationEmailTemplate.id
    newConfig.formData.eventNotification.authorProofingInvitationEmailTemplate =
      authorProofingInvitationTemplate.id
    newConfig.formData.eventNotification.authorProofingSubmittedEmailTemplate =
      authorProofingSubmittedTemplate.id

    await Config.query(trx).updateAndFetchById(config.id, newConfig)

    logger.info(
      `    Mapped default email templates in config formdata event notifications.`,
    )
  } else {
    logger.info(
      `    ${existingEmailTemplates.length} email templates already exists in database for "${group.name}". Skipping.`,
    )
  }

  // TODO: below @mention notification addition can be moved to default templates and should be done via migration for clean code
  // Check if an email template for @mention notification already exists
  const existingEmailTemplateForMentionNotification = await EmailTemplate.query(
    trx,
  )
    .where({
      group_id: group.id,
      email_template_type: 'systemEmail',
    })
    .andWhereRaw("email_content->>'description' = '@mention notification'")

  if (existingEmailTemplateForMentionNotification.length === 0) {
    const emailTemplatesData = {
      emailTemplateType: 'systemEmail',
      emailContent: {
        description: '@mention notification',
        subject: `Kotahi | {{ senderName }} has mentioned you in a discussion`,
        ccEditors: false,
        body: `<p>
        <p>Dear {{ recipientName }},</p>
        <p>{{ senderName }} mentioned you in a discussion. Click here to reply; {{ discussionUrl }}</p>
        <p>Want to change your notification settings? Login to Kotahi and go to your profile page.</p>
        <p>Regards,<br>
        Kotahi team</p>`,
      },
      groupId: group.id,
    }

    await EmailTemplate.query(trx).insertGraph(emailTemplatesData)

    logger.info(
      `    Added @mention notification email template for "${group.name}".`,
    )
  } else {
    logger.info(
      `    @mention Notification email template already exists in database for "${group.name}". Skipping.`,
    )
  }

  // update the 'emailTemplateType' value to 'taskNotification' for the task notification email template.
  try {
    await EmailTemplate.query(trx)
      .patch({ emailTemplateType: 'taskNotification' })
      .where({ group_id: group.id })
      .andWhereRaw("email_content->>'subject' = 'Kotahi | Task notification'")

    logger.info(
      `Updated email_template_type for the task notification email template.`,
    )
  } catch (error) {
    logger.error(
      `Error updating email_template_type for the task notification email template.`,
      error,
    )
  }

  await seedNotifications(trx, group.id, config)
}

const group = async () => {
  logger.info(`INSTANCE_GROUPS: ${process.env.INSTANCE_GROUPS}`)

  const instanceGroups =
    process.env.INSTANCE_GROUPS &&
    process.env.INSTANCE_GROUPS.split(',')
      .map(g => g.trim())
      .filter(g => !!g)

  logger.info(`Number of groups in .env ${instanceGroups.length}`)

  const instanceGroupNames = []

  return useTransaction(async trx => {
    await Promise.all(
      map(instanceGroups, async (instanceGroup, index) => {
        const splittedGroupVariables = instanceGroup && instanceGroup.split(':')
        const groupName = splittedGroupVariables[0]
        const instanceName = splittedGroupVariables[1]
        await createGroupAndRelatedData(groupName, instanceName, index, { trx })
        instanceGroupNames.push(groupName)
      }),
    ).then(async () => {
      let groups = await Group.query(trx)
      const groupNames = groups.map(g => g.name)

      if (instanceGroups.length === groups.length) {
        logger.info(`Number of groups in database ${groups.length}`)
      } else {
        // Archive groups that are removed from INSTANCE_GROUPS
        const archiveGroupNames = difference(groupNames, instanceGroupNames)

        const archiveGroupIds = groups
          .filter(g => archiveGroupNames.includes(g.name))
          .map(g => g.id)

        await Group.query(trx).findByIds(archiveGroupIds).patch({
          isArchived: true,
        })

        groups = await Group.query(trx)
        logger.info(
          `  Archived groups: "${
            archiveGroupNames.length > 1
              ? archiveGroupNames.join(', ')
              : archiveGroupNames
          }"`,
        )
        logger.info(`Number of groups in database ${groups.length}`)
      }
    })
  })
}

module.exports = group
