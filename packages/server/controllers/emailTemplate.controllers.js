const { logger } = require('@coko/server')

const { EmailTemplate, TaskEmailNotification } = require('../models')

const createEmailTemplate = async (groupId, input) => {
  try {
    const emailContents = {
      body: input.emailContent.body || '',
      subject: input.emailContent.subject || '',
      cc: input.emailContent.cc || '',
      description: input.emailContent.description || '',
      ccEditors: input.emailContent.ccEditors,
    }

    const createdEmailTemplate = await EmailTemplate.query().insert({
      emailContent: emailContents,
      groupId,
    })

    return {
      success: true,
      error: null,
      emailTemplate: createdEmailTemplate,
    }
  } catch (error) {
    logger.error('Error creating email template:', error)
    return { success: false, error: 'Something went wrong.' }
  }
}

const deleteEmailTemplate = async id => {
  try {
    await TaskEmailNotification.query().delete().where('email_template_id', id)

    const response = await EmailTemplate.query().where({ id }).delete()

    if (response) {
      return {
        success: true,
      }
    }

    return {
      success: false,
      error: `Something went wrong`,
    }
  } catch (err) {
    return {
      success: false,
      error: `Something went wrong. ${err.message}`,
    }
  }
}

const emailTemplates = async groupId => {
  const templates = await EmailTemplate.query().where({
    groupId,
  })

  templates.sort((a, b) =>
    a.emailContent.description.localeCompare(
      b.emailContent.description,
      undefined,
      { sensitivity: 'base' },
    ),
  )

  return templates
}

const templateContent = template => {
  try {
    const {
      cc = '',
      subject = '',
      body = '',
      description = '',
      ccEditors = false,
    } = template.emailContent

    return { cc, subject, body, description, ccEditors }
    /* eslint-disable-next-line */
  } catch (error) {
    logger.error('Error parsing email template:', template)
    return {
      cc: '',
      subject: '',
      body: '',
      description: '',
      ccEditors: false,
    }
  }
}

const updateEmailTemplate = async input => {
  try {
    const updatedEmailTemplate = await EmailTemplate.patchAndFetchById(
      input.id,
      {
        emailContent: {
          cc: input.emailContent.cc,
          subject: input.emailContent.subject,
          body: input.emailContent.body,
          description: input.emailContent.description,
          ccEditors: input.emailContent.ccEditors,
        },
      },
    )

    if (updatedEmailTemplate) {
      return {
        success: true,
        error: null,
        emailTemplate: updatedEmailTemplate,
      }
    }

    return {
      success: false,
      error: 'Email template not found.',
      emailContent: null,
    }
  } catch (error) {
    // Handle any errors that occurred during the update process
    logger.error('Error updating email template:', error)
    return {
      success: false,
      error: 'Internal server error.',
      emailContent: null,
    }
  }
}

module.exports = {
  createEmailTemplate,
  deleteEmailTemplate,
  emailTemplates,
  templateContent,
  updateEmailTemplate,
}
