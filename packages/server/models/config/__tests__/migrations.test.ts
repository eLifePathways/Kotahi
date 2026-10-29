import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { db, config, migrationManager, DbTestUtils } from '@coko/server'

import Group from '../../group/group.model'
import Config from '../config.model'
import eventsSource from '../../../services/notification/eventsSource'
import Notification from '../../notification/notification.model'

describe('Config Migrations', () => {
  beforeAll(async () => {
    await config.init()
    db.init()
  })

  beforeEach(async () => {
    await DbTestUtils.dropAllTables()
  })

  afterAll(async () => {
    await DbTestUtils.clearDb()
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
    expect(smtpConfig.formData.notification.gmailAuthPassword).toBeUndefined()
    expect(smtpConfig.formData.notification.gmailSenderName).toBeUndefined()
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

    const eventsConfig = Object.keys(eventsSource).reduce<
      Record<string, { active: boolean }>
    >((acc, key) => {
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

    config1 = (await Config.query().findById(config1.id)) as Config
    config2 = (await Config.query().findById(config2.id)) as Config

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

  it('changes the default group identity colours', async () => {
    await migrationManager.migrate({ to: '1790663316-remove-recent-tab.ts' })

    const noncompliantGroupIdentity = {
      primaryColor: '#3aae2a',
      secondaryColor: '#9e9e9e',
    }

    const compliantGroupIdentity = {
      primaryColor: '#4a7c59',
      secondaryColor: '#6b7280',
    }

    // non-compliant
    const group1 = await Group.insert({})

    let config1ForGroup1 = await Config.insert({
      active: true,
      groupId: group1.id,
      formData: {
        groupIdentity: noncompliantGroupIdentity,
      },
    })

    let config2ForGroup1 = await Config.insert({
      active: false,
      groupId: group1.id,
      formData: {
        groupIdentity: noncompliantGroupIdentity,
      },
    })

    // mixed
    const group2 = await Group.insert({})

    let configForGroup2 = await Config.insert({
      active: true,
      groupId: group2.id,
      formData: {
        groupIdentity: {
          primaryColor: noncompliantGroupIdentity.primaryColor,
          secondaryColor: compliantGroupIdentity.secondaryColor,
        },
      },
    })

    // compliant
    const group3 = await Group.insert({})

    let configForGroup3 = await Config.insert({
      active: true,
      groupId: group3.id,
      formData: {
        groupIdentity: compliantGroupIdentity,
      },
    })

    // non-compliant, uppercase (as stored by 1678694877-create-config-data-from-env)
    const group4 = await Group.insert({})

    let configForGroup4 = await Config.insert({
      active: true,
      groupId: group4.id,
      formData: {
        groupIdentity: {
          primaryColor: noncompliantGroupIdentity.primaryColor.toUpperCase(),
          secondaryColor:
            noncompliantGroupIdentity.secondaryColor.toUpperCase(),
        },
      },
    })

    // mixed, the other way round
    const group5 = await Group.insert({})

    let configForGroup5 = await Config.insert({
      active: true,
      groupId: group5.id,
      formData: {
        groupIdentity: {
          primaryColor: compliantGroupIdentity.primaryColor,
          secondaryColor: noncompliantGroupIdentity.secondaryColor,
        },
      },
    })

    // no group identity
    const group6 = await Group.insert({})

    let configForGroup6 = await Config.insert({
      active: true,
      groupId: group6.id,
      formData: {},
    })

    await migrationManager.migrate({ step: 1 })

    config1ForGroup1 = await Config.findById(config1ForGroup1.id)
    config2ForGroup1 = await Config.findById(config2ForGroup1.id)
    configForGroup2 = await Config.findById(configForGroup2.id)
    configForGroup3 = await Config.findById(configForGroup3.id)
    configForGroup4 = await Config.findById(configForGroup4.id)
    configForGroup5 = await Config.findById(configForGroup5.id)
    configForGroup6 = await Config.findById(configForGroup6.id)

    expect(config1ForGroup1.formData.groupIdentity.primaryColor).toBe(
      compliantGroupIdentity.primaryColor,
    )
    expect(config1ForGroup1.formData.groupIdentity.secondaryColor).toBe(
      compliantGroupIdentity.secondaryColor,
    )

    expect(config2ForGroup1.formData.groupIdentity.primaryColor).toBe(
      compliantGroupIdentity.primaryColor,
    )
    expect(config2ForGroup1.formData.groupIdentity.secondaryColor).toBe(
      compliantGroupIdentity.secondaryColor,
    )

    expect(configForGroup2.formData.groupIdentity.primaryColor).toBe(
      noncompliantGroupIdentity.primaryColor,
    )
    expect(configForGroup2.formData.groupIdentity.secondaryColor).toBe(
      compliantGroupIdentity.secondaryColor,
    )

    expect(configForGroup3.formData.groupIdentity.primaryColor).toBe(
      compliantGroupIdentity.primaryColor,
    )
    expect(configForGroup3.formData.groupIdentity.secondaryColor).toBe(
      compliantGroupIdentity.secondaryColor,
    )

    expect(configForGroup4.formData.groupIdentity.primaryColor).toBe(
      compliantGroupIdentity.primaryColor,
    )
    expect(configForGroup4.formData.groupIdentity.secondaryColor).toBe(
      compliantGroupIdentity.secondaryColor,
    )

    expect(configForGroup5.formData.groupIdentity.primaryColor).toBe(
      compliantGroupIdentity.primaryColor,
    )
    expect(configForGroup5.formData.groupIdentity.secondaryColor).toBe(
      noncompliantGroupIdentity.secondaryColor,
    )

    expect(configForGroup6.formData.groupIdentity).toBeUndefined()

    await migrationManager.rollback({ step: 1 })

    config1ForGroup1 = await Config.findById(config1ForGroup1.id)
    config2ForGroup1 = await Config.findById(config2ForGroup1.id)
    configForGroup2 = await Config.findById(configForGroup2.id)
    configForGroup3 = await Config.findById(configForGroup3.id)
    configForGroup5 = await Config.findById(configForGroup5.id)
    configForGroup6 = await Config.findById(configForGroup6.id)

    expect(config1ForGroup1.formData.groupIdentity.primaryColor).toBe(
      noncompliantGroupIdentity.primaryColor,
    )
    expect(config1ForGroup1.formData.groupIdentity.secondaryColor).toBe(
      noncompliantGroupIdentity.secondaryColor,
    )

    expect(config2ForGroup1.formData.groupIdentity.primaryColor).toBe(
      noncompliantGroupIdentity.primaryColor,
    )
    expect(config2ForGroup1.formData.groupIdentity.secondaryColor).toBe(
      noncompliantGroupIdentity.secondaryColor,
    )

    expect(configForGroup2.formData.groupIdentity.primaryColor).toBe(
      noncompliantGroupIdentity.primaryColor,
    )
    expect(configForGroup2.formData.groupIdentity.secondaryColor).toBe(
      compliantGroupIdentity.secondaryColor,
    )

    // what uses the compliant defaults should now be non-compliant
    expect(configForGroup3.formData.groupIdentity.primaryColor).toBe(
      noncompliantGroupIdentity.primaryColor,
    )
    expect(configForGroup3.formData.groupIdentity.secondaryColor).toBe(
      noncompliantGroupIdentity.secondaryColor,
    )

    expect(configForGroup5.formData.groupIdentity.primaryColor).toBe(
      compliantGroupIdentity.primaryColor,
    )
    expect(configForGroup5.formData.groupIdentity.secondaryColor).toBe(
      noncompliantGroupIdentity.secondaryColor,
    )

    expect(configForGroup6.formData.groupIdentity).toBeUndefined()
  })

  it('removes the deprecated COAR Notify IP allow list', async () => {
    await migrationManager.migrate({
      to: '1791456947-change-default-brand-colours.ts',
    })

    const repoIpAddress = '127.0.0.1'
    const scietyInboxUrl = 'https://inbox.sciety.org/inbox'

    // ip address and other coar notify settings
    const group1 = await Group.insert({})

    let config1ForGroup1 = await Config.insert({
      active: true,
      groupId: group1.id,
      formData: {
        integrations: {
          coarNotify: { repoIpAddress, scietyInboxUrl },
        },
      },
    })

    let config2ForGroup1 = await Config.insert({
      active: false,
      groupId: group1.id,
      formData: {
        integrations: {
          coarNotify: { repoIpAddress, scietyInboxUrl },
        },
      },
    })

    // empty ip address
    const group2 = await Group.insert({})

    let configForGroup2 = await Config.insert({
      active: true,
      groupId: group2.id,
      formData: {
        integrations: {
          coarNotify: { repoIpAddress: null, scietyInboxUrl },
        },
      },
    })

    // no ip address
    const group3 = await Group.insert({})

    let configForGroup3 = await Config.insert({
      active: true,
      groupId: group3.id,
      formData: {
        integrations: {
          coarNotify: { scietyInboxUrl },
        },
      },
    })

    // no coar notify settings
    const group4 = await Group.insert({})

    let configForGroup4 = await Config.insert({
      active: true,
      groupId: group4.id,
      formData: {},
    })

    expect(
      config1ForGroup1.formData.integrations.coarNotify.repoIpAddress,
    ).toBe(repoIpAddress)
    expect(
      config2ForGroup1.formData.integrations.coarNotify.repoIpAddress,
    ).toBe(repoIpAddress)
    expect(
      configForGroup2.formData.integrations.coarNotify.repoIpAddress,
    ).toBeNull()

    await migrationManager.migrate({ step: 1 })

    config1ForGroup1 = await Config.findById(config1ForGroup1.id)
    config2ForGroup1 = await Config.findById(config2ForGroup1.id)
    configForGroup2 = await Config.findById(configForGroup2.id)
    configForGroup3 = await Config.findById(configForGroup3.id)
    configForGroup4 = await Config.findById(configForGroup4.id)

    expect(config1ForGroup1.formData.integrations.coarNotify).toEqual({
      scietyInboxUrl,
    })
    expect(config2ForGroup1.formData.integrations.coarNotify).toEqual({
      scietyInboxUrl,
    })
    expect(configForGroup2.formData.integrations.coarNotify).toEqual({
      scietyInboxUrl,
    })
    expect(configForGroup3.formData.integrations.coarNotify).toEqual({
      scietyInboxUrl,
    })
    expect(configForGroup4.formData.integrations).toBeUndefined()

    await migrationManager.rollback({ step: 1 })

    config1ForGroup1 = await Config.findById(config1ForGroup1.id)
    config2ForGroup1 = await Config.findById(config2ForGroup1.id)
    configForGroup2 = await Config.findById(configForGroup2.id)
    configForGroup3 = await Config.findById(configForGroup3.id)
    configForGroup4 = await Config.findById(configForGroup4.id)

    // removed ip addresses cannot be restored, so the key comes back empty
    expect(config1ForGroup1.formData.integrations.coarNotify).toEqual({
      repoIpAddress: null,
      scietyInboxUrl,
    })
    expect(config2ForGroup1.formData.integrations.coarNotify).toEqual({
      repoIpAddress: null,
      scietyInboxUrl,
    })
    expect(configForGroup2.formData.integrations.coarNotify).toEqual({
      repoIpAddress: null,
      scietyInboxUrl,
    })
    expect(configForGroup3.formData.integrations.coarNotify).toEqual({
      repoIpAddress: null,
      scietyInboxUrl,
    })
    expect(configForGroup4.formData.integrations).toBeUndefined()
  })

  it('removes the new submission config option', async () => {
    await migrationManager.migrate({
      to: '1793098113-add-coar-notifications-primary-key.ts',
    })

    const paginationCount = 10

    // preprint, toggle on and other manuscript settings
    const group1 = await Group.insert({})

    let config1ForGroup1 = await Config.insert({
      active: true,
      groupId: group1.id,
      formData: {
        instanceName: 'preprint1',
        manuscript: { newSubmission: true, paginationCount },
      },
    })

    let config2ForGroup1 = await Config.insert({
      active: false,
      groupId: group1.id,
      formData: {
        instanceName: 'preprint1',
        manuscript: { newSubmission: true, paginationCount },
      },
    })

    // not a preprint, toggle off
    const group2 = await Group.insert({})

    let configForGroup2 = await Config.insert({
      active: true,
      groupId: group2.id,
      formData: {
        instanceName: 'journal',
        manuscript: { newSubmission: false, paginationCount },
      },
    })

    // preprint, no toggle
    const group3 = await Group.insert({})

    let configForGroup3 = await Config.insert({
      active: true,
      groupId: group3.id,
      formData: {
        instanceName: 'preprint2',
        manuscript: { paginationCount },
      },
    })

    // not a preprint, toggle on
    const group5 = await Group.insert({})

    let configForGroup5 = await Config.insert({
      active: true,
      groupId: group5.id,
      formData: {
        instanceName: 'prc',
        manuscript: { newSubmission: true, paginationCount },
      },
    })

    // no manuscript settings
    const group4 = await Group.insert({})

    let configForGroup4 = await Config.insert({
      active: true,
      groupId: group4.id,
      formData: {},
    })

    expect(config1ForGroup1.formData.manuscript.newSubmission).toBe(true)
    expect(config2ForGroup1.formData.manuscript.newSubmission).toBe(true)
    expect(configForGroup2.formData.manuscript.newSubmission).toBe(false)
    expect(configForGroup5.formData.manuscript.newSubmission).toBe(true)

    await migrationManager.migrate({ step: 1 })

    config1ForGroup1 = await Config.findById(config1ForGroup1.id)
    config2ForGroup1 = await Config.findById(config2ForGroup1.id)
    configForGroup2 = await Config.findById(configForGroup2.id)
    configForGroup3 = await Config.findById(configForGroup3.id)
    configForGroup4 = await Config.findById(configForGroup4.id)
    configForGroup5 = await Config.findById(configForGroup5.id)

    expect(config1ForGroup1.formData.manuscript).toEqual({ paginationCount })
    expect(config2ForGroup1.formData.manuscript).toEqual({ paginationCount })
    expect(configForGroup2.formData.manuscript).toEqual({ paginationCount })
    expect(configForGroup3.formData.manuscript).toEqual({ paginationCount })
    expect(configForGroup4.formData.manuscript).toBeUndefined()
    expect(configForGroup5.formData.manuscript).toEqual({ paginationCount })

    await migrationManager.rollback({ step: 1 })

    config1ForGroup1 = await Config.findById(config1ForGroup1.id)
    config2ForGroup1 = await Config.findById(config2ForGroup1.id)
    configForGroup2 = await Config.findById(configForGroup2.id)
    configForGroup3 = await Config.findById(configForGroup3.id)
    configForGroup4 = await Config.findById(configForGroup4.id)
    configForGroup5 = await Config.findById(configForGroup5.id)

    // removed values cannot be restored, so the key comes back on for
    // preprint instances and off for the rest
    expect(config1ForGroup1.formData.manuscript).toEqual({
      newSubmission: true,
      paginationCount,
    })
    expect(config2ForGroup1.formData.manuscript).toEqual({
      newSubmission: true,
      paginationCount,
    })
    expect(configForGroup2.formData.manuscript).toEqual({
      newSubmission: false,
      paginationCount,
    })
    expect(configForGroup3.formData.manuscript).toEqual({
      newSubmission: true,
      paginationCount,
    })
    expect(configForGroup4.formData.manuscript).toBeUndefined()
    expect(configForGroup5.formData.manuscript).toEqual({
      newSubmission: false,
      paginationCount,
    })
  })
})
