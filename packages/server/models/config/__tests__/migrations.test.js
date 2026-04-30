/* eslint-disable */

const { db, migrationManager } = require('@coko/server')
const Group = require('../../group/group.model')
const Config = require('../config.model')
const eventsSource = require('../../../services/notification/eventsSource')
const Notification = require('../../notification/notification.model')

describe('Config Migrations', () => {
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

  it('moves gmail credentials to generic smtp', async () => {
    await migrationManager.migrate({
      to: '1743060775-remove-unique-username.js',
    })

    const email = 'user@gmail.com'
    const sender = 'User Name'
    const password = '123abc'

    const group = await Group.insert({})

    const gmailConfig = await Config.insert({
      active: true,
      groupId: group.id,
      formData: {
        notification: {
          gmailAuthEmail: email,
          gmailSenderName: sender,
          gmailAuthPassword: password,
        },
      },
    })

    expect(gmailConfig.formData.notification.gmailAuthEmail).toBe(email)
    expect(gmailConfig.formData.notification.gmailAuthPassword).toBe(password)
    expect(gmailConfig.formData.notification.gmailSenderName).toBe(sender)
    expect(gmailConfig.formData.emailNotification).toBeUndefined()

    await migrationManager.migrate({ step: 1 })

    const smtpConfig = await Config.findById(gmailConfig.id)

    expect(smtpConfig.formData.notification.gmailAuthEmail).toBeUndefined()
    expect(smtpConfig.formData.notification.gmailAuthPassword).toBeUndefined()
    expect(smtpConfig.formData.notification.gmailSenderName).toBeUndefined()
    expect(smtpConfig.formData.emailNotification.user).toBe(email)
    expect(smtpConfig.formData.emailNotification.pass).toBe(password)
    expect(smtpConfig.formData.emailNotification.from).toBe(sender)

    await migrationManager.rollback({ step: 1 })

    const rolledbackConfig = await Config.findById(gmailConfig.id)

    expect(rolledbackConfig.formData.notification.gmailAuthEmail).toBe(email)
    expect(rolledbackConfig.formData.notification.gmailAuthPassword).toBe(
      password,
    )
    expect(rolledbackConfig.formData.notification.gmailSenderName).toBe(sender)
    expect(rolledbackConfig.formData.emailNotification).toBeUndefined()
  })

  it('leaves email config empty if it was empty before', async () => {
    await migrationManager.migrate({
      to: '1743060775-remove-unique-username.js',
    })

    const group = await Group.insert({})

    const gmailConfig = await Config.insert({
      active: true,
      groupId: group.id,
      formData: {
        notification: {
          gmailAuthEmail: undefined,
          gmailSenderName: undefined,
          gmailAuthPassword: undefined,
        },
      },
    })

    expect(gmailConfig.formData.notification.gmailAuthEmail).toBeUndefined()
    expect(gmailConfig.formData.notification.gmailAuthPassword).toBeUndefined()
    expect(gmailConfig.formData.notification.gmailSenderName).toBeUndefined()
    expect(gmailConfig.formData.emailNotification).toBeUndefined()

    await migrationManager.migrate({ step: 1 })

    const smtpConfig = await Config.findById(gmailConfig.id)

    expect(smtpConfig.formData.notification.gmailAuthEmail).toBeUndefined()
    expect(gmailConfig.formData.notification.gmailAuthPassword).toBeUndefined()
    expect(gmailConfig.formData.notification.gmailSenderName).toBeUndefined()
    expect(smtpConfig.formData.emailNotification.user).toBeUndefined()
    expect(smtpConfig.formData.emailNotification.pass).toBeUndefined()
    expect(smtpConfig.formData.emailNotification.from).toBeUndefined()

    await migrationManager.rollback({ step: 1 })

    const rolledbackConfig = await Config.findById(gmailConfig.id)

    expect(
      rolledbackConfig.formData.notification.gmailAuthEmail,
    ).toBeUndefined()
    expect(
      rolledbackConfig.formData.notification.gmailAuthPassword,
    ).toBeUndefined()
    expect(
      rolledbackConfig.formData.notification.gmailSenderName,
    ).toBeUndefined()
    expect(rolledbackConfig.formData.emailNotification).toBeUndefined()
  })

  it('adds BCC to notification config', async () => {
    await migrationManager.migrate({
      to: '1748427621-migrate-gmail-to-smtp.js',
    })

    const group1 = await Group.insert({})
    const group2 = await Group.insert({})

    let config1 = await Config.insert({
      active: true,
      groupId: group1.id,
      formData: {},
    })

    let config2 = await Config.insert({
      active: true,
      groupId: group2.id,
      formData: {},
    })

    expect(config1.formData.emailNotification).toBe(undefined)
    expect(config2.formData.emailNotification).toBe(undefined)

    await migrationManager.migrate({ step: 1 })

    config1 = await Config.findById(config1.id)
    config2 = await Config.findById(config2.id)

    expect(config1.formData.emailNotification).not.toBe(undefined)
    expect(config2.formData.emailNotification).not.toBe(undefined)

    expect(config1.formData.emailNotification.bcc).toBe('')
    expect(config2.formData.emailNotification.bcc).toBe('')

    await migrationManager.rollback({ step: 1 })

    config1 = await Config.findById(config1.id)
    config2 = await Config.findById(config2.id)

    expect(config1.formData.emailNotification.bcc).toBe(undefined)
    expect(config2.formData.emailNotification.bcc).toBe(undefined)
  })

  it('activates notification event if event has no notifications', async () => {
    await migrationManager.migrate({ to: '1752222828=file-meta.js' })

    const eventsConfig = Object.keys(eventsSource).reduce((acc, key) => {
      acc[key] = { active: key !== 'author-accepted' }
      return acc
    }, {})

    const group = await Group.insert({})

    let config1 = await Config.insert({
      active: true,
      groupId: group.id,
      formData: {
        notification: {
          eventsConfig,
        },
      },
    })

    let config2 = await Config.insert({
      active: false,
      groupId: group.id,
      formData: {
        notification: {
          eventsConfig,
        },
      },
    })

    const allEvents = Object.keys(eventsSource)
    const eventsExceptTarget = allEvents.filter(e => e !== 'author-accepted')
    const eventsToPopulate = eventsExceptTarget.slice(0, 3)

    const inactiveButHasNotifs = eventsToPopulate[0]

    config1.formData.notification.eventsConfig[inactiveButHasNotifs].active =
      false
    config2.formData.notification.eventsConfig[inactiveButHasNotifs].active =
      false

    await config1.$query().patch({ formData: config1.formData })
    await config2.$query().patch({ formData: config2.formData })

    await Promise.all(
      eventsToPopulate.map(ev =>
        Notification.insert({
          event: ev,
          notificationType: 'email',
          groupId: group.id,
          active: true,
          subject: `Test subject for ${ev}`,
          emailTemplateId: null,
          ccEmails: [],
          isDefault: false,
          displayName: `Notify ${ev}`,
          recipient: 'registeredUser',
          delay: 0,
        }),
      ),
    )

    await migrationManager.migrate({ step: 1 })

    config1 = await Config.query().findById(config1.id)
    config2 = await Config.query().findById(config2.id)

    // 1) 'author-accepted' was inactive and had NO notifications -> should now be active
    expect(
      config1.formData.notification.eventsConfig['author-accepted'].active,
    ).toBe(true)
    expect(
      config2.formData.notification.eventsConfig['author-accepted'].active,
    ).toBe(true)

    // 2) events we populated with notifications should remain active (or remain as set)
    eventsToPopulate.forEach(ev => {
      expect(config1.formData.notification.eventsConfig[ev].active).toBe(
        ev !== inactiveButHasNotifs,
      )
      expect(config2.formData.notification.eventsConfig[ev].active).toBe(
        ev !== inactiveButHasNotifs,
      )
    })

    // 3) sanity: all originally-active events (except any explicitly toggled) remain active
    Object.keys(eventsConfig)
      .filter(e => e !== 'author-accepted' && e !== inactiveButHasNotifs)
      .forEach(e => {
        expect(config1.formData.notification.eventsConfig[e].active).toBe(true)
      })
  })
})
