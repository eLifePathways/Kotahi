/* eslint-disable */

const { db, migrationManager } = require('@coko/server')
const Group = require('../../group/group.model')
const Config = require('../../config/config.model')
const EmailTemplate = require('../emailTemplate.model')
const defaultEmailTemplates = require('../../../config/defaultEmailTemplates')

describe('Email Template Migrations', () => {
  beforeEach(async () => {
    const tables = await db('pg_tables')
      .select('tablename')
      .where('schemaname', 'public')

    for (const t of tables) {
      await db.raw(`DROP TABLE IF EXISTS public.${t.tablename} CASCADE`)
    }
  })

  afterAll(async () => {
    await db.destroy()
  })

  it('adds collaborative review email template', async () => {
    await migrationManager.migrate({
      to: '1711496454-search-indexing-entire-submission.sql',
    })

    const group1 = await Group.insert({})
    const group2 = await Group.insert({})

    await Config.insert({
      active: true,
      groupId: group1.id,
      formData: {},
    })

    await Config.insert({
      active: true,
      groupId: group2.id,
      formData: {},
    })

    let emailTemplate1Exists = await EmailTemplate.query().findOne({
      emailTemplateType: 'collaborativeReviewerInvitation',
      groupId: group1.id,
    })

    let emailTemplate2Exists = await EmailTemplate.query().findOne({
      emailTemplateType: 'collaborativeReviewerInvitation',
      groupId: group2.id,
    })

    expect(emailTemplate1Exists).toBeFalsy()
    expect(emailTemplate2Exists).toBeFalsy()

    await migrationManager.migrate({ step: 1 })

    emailTemplate1Exists = await EmailTemplate.query().findOne({
      emailTemplateType: 'collaborativeReviewerInvitation',
      groupId: group1.id,
    })

    emailTemplate2Exists = await EmailTemplate.query().findOne({
      emailTemplateType: 'collaborativeReviewerInvitation',
      groupId: group2.id,
    })

    expect(emailTemplate1Exists).toBeTruthy()
    expect(emailTemplate2Exists).toBeTruthy()

    expect(emailTemplate1Exists.emailContent).toBeDefined()
    expect(emailTemplate2Exists.emailContent).toBeDefined()

    const collaborativeReviewerInvitation = defaultEmailTemplates.find(
      t =>
        t.emailTemplateKey === 'collabroativeReviewerInvitationEmailTemplate',
    )

    expect(emailTemplate1Exists.emailContent.subject).toBe(
      collaborativeReviewerInvitation.subject,
    )
    expect(emailTemplate2Exists.emailContent.subject).toBe(
      collaborativeReviewerInvitation.subject,
    )

    expect(emailTemplate1Exists.emailContent.cc).toBe(
      collaborativeReviewerInvitation.cc,
    )
    expect(emailTemplate2Exists.emailContent.cc).toBe(
      collaborativeReviewerInvitation.cc,
    )

    expect(emailTemplate1Exists.emailContent.ccEditors).toBe(
      collaborativeReviewerInvitation.ccEditors,
    )
    expect(emailTemplate2Exists.emailContent.ccEditors).toBe(
      collaborativeReviewerInvitation.ccEditors,
    )

    expect(emailTemplate1Exists.emailContent.body).toBe(
      collaborativeReviewerInvitation.body,
    )
    expect(emailTemplate2Exists.emailContent.body).toBe(
      collaborativeReviewerInvitation.body,
    )

    expect(emailTemplate1Exists.emailContent.description).toBe(
      collaborativeReviewerInvitation.description,
    )
    expect(emailTemplate2Exists.emailContent.description).toBe(
      collaborativeReviewerInvitation.description,
    )
  })
})
