const { useTransaction } = require('@coko/server')

const Config = require('../config.model')

const brandConfig = {
  logoPath: '/logo-kotahi.png',
  primaryColor: '#3AAE2A',
  secondaryColor: '#9e9e9e',
  brandName: 'Kotahi',
}

exports.up = async () => {
  try {
    return useTransaction(async trx => {
      const configs = await Config.query(trx)

      // logger.info(`Existing Configs: ${configs.length}`)

      let config = {}
      // const createdConfig = {}

      const publishing = {
        hypothesis: {
          group: process.env.HYPOTHESIS_GROUP || null,
          apiKey: process.env.HYPOTHESIS_API_KEY || null,
          shouldAllowTagging: process.env.HYPOTHESIS_ALLOW_TAGGING === 'true',
          reverseFieldOrder:
            process.env.HYPOTHESIS_REVERSE_FIELD_ORDER === 'true',
        },
        webhook: {
          ref: process.env.PUBLISHING_WEBHOOK_REF || null,
          url: process.env.PUBLISHING_WEBHOOK_URL || null,
          token: process.env.PUBLISHING_WEBHOOK_TOKEN || null,
        },
        crossref: {
          login: process.env.CROSSREF_LOGIN || null,
          password: process.env.CROSSREF_PASSWORD || null,
          doiPrefix: process.env.DOI_PREFIX || null,
          licenseUrl: process.env.PUBLICATION_LICENSE_URL || null,
          registrant: process.env.CROSSREF_REGISTRANT || null,
          journalName: process.env.JOURNAL_NAME || null,
          depositorName: process.env.CROSSREF_DEPOSITOR_NAME || null,
          depositorEmail: process.env.CROSSREF_DEPOSITOR_EMAIL || null,
          journalHomepage: process.env.JOURNAL_HOMEPAGE || null,
          publicationType:
            process.env.CROSSREF_PUBLICATION_TYPE === 'article'
              ? 'article'
              : 'peer review',
          journalAbbreviatedName: process.env.JOURNAL_ABBREVIATED_NAME || null,
          publishedArticleLocationPrefix:
            process.env.PUBLISHED_ARTICLE_LOCATION_PREFIX || null,
          useSandbox: process.env.CROSSREF_USE_SANDBOX === 'true',
        },
      }

      const notification = {
        gmailAuthEmail: process.env.GMAIL_NOTIFICATION_EMAIL_AUTH || null,
        gmailAuthPassword: process.env.GMAIL_NOTIFICATION_PASSWORD || null,
        gmailSenderName:
          process.env.GMAIL_NOTIFICATION_EMAIL_SENDER_NAME || null,
      }

      const groupIdentity = {
        brandName: brandConfig.brandName ? brandConfig.brandName : 'Kotahi',
        primaryColor: brandConfig.primaryColor
          ? brandConfig.primaryColor
          : '#3aae2a',
        secondaryColor: brandConfig.secondaryColor
          ? brandConfig.secondaryColor
          : '#9e9e9e',
        logoPath: brandConfig.logoPath
          ? brandConfig.logoPath
          : '/logo-kotahi.png',
      }

      // Only applicable to existing client instances which use INSTANCE_NAME with single instance type one of "preprint1, preprint2, prc, journal"
      if (configs.length === 0 && process.env.INSTANCE_NAME) {
        switch (process.env.INSTANCE_NAME) {
          case 'preprint1':
            config = {
              active: true,
              formData: {
                instanceName: 'preprint1',
                user: {
                  isAdmin: false,
                  kotahiApiTokens: process.env.KOTAHI_API_TOKENS || null,
                },
                report: { showInMenu: true },
                review: { showSummary: false },
                dashboard: { loginRedirectUrl: '/admin/manuscripts' },
                manuscript: {
                  tableColumns: process.env.MANUSCRIPTS_TABLE_COLUMNS,
                  newSubmission: true,
                  paginationCount: 10,
                },
                submission: {
                  allowAuthorsSubmitNewVersion: false,
                  submissionPage: {
                    allowAuthorUploadWithForm: true,
                  },
                },
                publishing,
                taskManager: {
                  teamTimezone: process.env.TEAM_TIMEZONE || 'Etc/UTC',
                },
                controlPanel: {
                  showTabs: ['Metadata'],
                  displayManuscriptShortId: true,
                },
                notification,
                groupIdentity,
              },
              type: 'Config',
            }
            break
          case 'preprint2':
            config = {
              active: true,
              formData: {
                instanceName: 'preprint2',
                user: {
                  isAdmin: false,
                  kotahiApiTokens: process.env.KOTAHI_API_TOKENS || null,
                },
                report: { showInMenu: true },
                review: { showSummary: false },
                dashboard: {
                  showSections: ['editor'],
                  loginRedirectUrl: '/dashboard',
                },
                manuscript: {
                  labelColumn: true,
                  tableColumns: process.env.MANUSCRIPTS_TABLE_COLUMNS,
                  manualImport: process.env.ALLOW_MANUAL_IMPORT === 'true',
                  newSubmission: true,
                  paginationCount: 100,
                },
                submission: {
                  allowAuthorsSubmitNewVersion: false,
                  submissionPage: {
                    allowAuthorUploadWithForm: true,
                  },
                },
                publishing,
                taskManager: {
                  teamTimezone: process.env.TEAM_TIMEZONE || 'Etc/UTC',
                },
                controlPanel: {
                  showTabs: ['Metadata'],
                  displayManuscriptShortId: true,
                },
                notification,
                groupIdentity,
              },
              type: 'Config',
            }
            break
          case 'prc':
            config = {
              active: true,
              formData: {
                instanceName: 'prc',
                user: {
                  isAdmin: false,
                  kotahiApiTokens: process.env.KOTAHI_API_TOKENS || null,
                },
                report: { showInMenu: true },
                review: { showSummary: true },
                dashboard: {
                  showSections: ['submission', 'review', 'editor'],
                  loginRedirectUrl: '/dashboard',
                },
                manuscript: {
                  labelColumn: true,
                  tableColumns: process.env.MANUSCRIPTS_TABLE_COLUMNS,
                  newSubmission: true,
                  autoImportHourUtc: process.env.AUTO_IMPORT_HOUR_UTC
                    ? Number(process.env.AUTO_IMPORT_HOUR_UTC)
                    : 21,
                  paginationCount: 10,
                  archivePeriodDays: process.env.ARCHIVE_PERIOD_DAYS
                    ? Number(process.env.ARCHIVE_PERIOD_DAYS)
                    : 60,
                  semanticScholarImportsRecencyPeriodDays: process.env
                    .SEMANTIC_SCHOLAR_IMPORTS_RECENCY_PERIOD_DAYS
                    ? Number(
                        process.env
                          .SEMANTIC_SCHOLAR_IMPORTS_RECENCY_PERIOD_DAYS,
                      )
                    : 42,
                },
                submission: {
                  allowAuthorsSubmitNewVersion: true,
                  submissionPage: {
                    allowAuthorUploadWithForm: true,
                  },
                },
                publishing,
                taskManager: {
                  teamTimezone: process.env.TEAM_TIMEZONE || 'Etc/UTC',
                },
                controlPanel: {
                  showTabs: [
                    'Team',
                    'Decision',
                    'Manuscript text',
                    'Metadata',
                    'Tasks & Notifications',
                  ],
                  hideReview: process.env.REVIEW_HIDE === 'true',
                  sharedReview: process.env.REVIEW_SHARED === 'true',
                  displayManuscriptShortId: true,
                },
                notification,
                groupIdentity,
              },
              type: 'Config',
            }
            break
          case 'journal':
            config = {
              active: true,
              formData: {
                instanceName: 'journal',
                user: {
                  isAdmin: false,
                  kotahiApiTokens: process.env.KOTAHI_API_TOKENS || null,
                },
                report: { showInMenu: true },
                review: { showSummary: false },
                dashboard: {
                  showSections: ['submission', 'review', 'editor'],
                  loginRedirectUrl: '/dashboard',
                },
                manuscript: {
                  tableColumns: process.env.MANUSCRIPTS_TABLE_COLUMNS,
                  paginationCount: 10,
                },
                submission: {
                  allowAuthorsSubmitNewVersion: false,
                  submissionPage: {
                    allowAuthorUploadWithForm: true,
                  },
                },
                publishing,
                taskManager: {
                  teamTimezone: process.env.TEAM_TIMEZONE || 'Etc/UTC',
                },
                controlPanel: {
                  showTabs: [
                    'Team',
                    'Decision',
                    'Manuscript text',
                    'Metadata',
                    'Tasks & Notifications',
                  ],
                  hideReview: process.env.REVIEW_HIDE === 'true',
                  sharedReview: process.env.REVIEW_SHARED === 'true',
                  displayManuscriptShortId: true,
                },
                notification,
                groupIdentity,
              },
              type: 'Config',
            }
            break
          default:
            break
        }

        config.formData = JSON.stringify(config.formData)
        // createdConfig = await Config.query().insertAndFetch(config)

        // logger.info(
        //   `Created config for instance type "${createdConfig.formData.instanceName}"`,
        // )
      }
    })
  } catch (error) {
    throw new Error(error)
  }
}
