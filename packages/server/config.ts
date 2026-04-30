import { env } from '@coko/server'

import modelComponents from './models/modelComponents'

const isProduction = env('NODE_ENV') === 'production'

const components = [
  '@coko/server/dist/models/team',
  '@coko/server/dist/models/teamMember',
  '@coko/server/dist/models/file',
  ...modelComponents,

  './api/graphql',

  './api/rest/assetUpload',
  './api/rest/coar',
  './api/rest/cmsUpload',
  './api/rest/orcid',
  './api/rest/profileUpload',
  './api/rest/docmap',
]

if (!isProduction && env('E2E_TESTING_API')) {
  components.push('./api/rest/e2e')
}

export default {
  adaKey: env('ADA_KEY'),
  'auth-orcid': {
    useSandboxedOrcid: env('USE_SANDBOXED_ORCID'),
    clientID: env('ORCID_CLIENT_ID'),
    clientSecret: env('ORCID_CLIENT_SECRET'),
  },
  adminUser: false,
  anystyle: {
    clientId: env('SERVICE_ANYSTYLE_CLIENT_ID'),
    clientSecret: env('SERVICE_ANYSTYLE_SECRET'),
    protocol: env('SERVICE_ANYSTYLE_PROTOCOL'),
    host: env('SERVICE_ANYSTYLE_HOST'),
    port: env('SERVICE_ANYSTYLE_PORT'),
  },
  api: {
    tokens: env('KOTAHI_API_TOKENS'),
  },
  chatGPT: {
    key: 'CHAT_GPT_KEY',
  },
  components,
  crossref: {
    login: env('CROSSREF_LOGIN'),
    password: env('CROSSREF_PASSWORD'),
    registrant: env('CROSSREF_REGISTRANT'),
    depositorName: env('CROSSREF_DEPOSITOR_NAME'),
    depositorEmail: env('CROSSREF_DEPOSITOR_EMAIL'),
    publicationType: env('CROSSREF_PUBLICATION_TYPE'),
    doiPrefix: env('DOI_PREFIX'),
    publishedArticleLocationPrefix: env('PUBLISHED_ARTICLE_LOCATION_PREFIX'),
    licenseUrl: env('PUBLICATION_LICENSE_URL'),
    useSandbox: env('CROSSREF_USE_SANDBOX'),
    journalAbbreviatedName: env('JOURNAL_ABBREVIATED_NAME'),
    journalHomepage: env('JOURNAL_HOMEPAGE'),
  },
  datacite: {
    login: env('DATACITE_LOGIN'),
    password: env('DATACITE_PASSWORD'),
    doiPrefix: env('DOI_PREFIX'),
    useSandbox: env('DATACITE_USE_SANDBOX'),
    publishedArticleLocationPrefix: env('PUBLISHED_ARTICLE_LOCATION_PREFIX'),
  },
  'flax-site': {
    clientId: env('FLAX_CLIENT_ID'),
    clientSecret: env('FLAX_CLIENT_SECRET'),
    clientAPIURL: env('FLAX_CLIENT_API_URL'),
    clientFlaxSiteUrl: env('FLAX_SITE_URL'),
    port: env('FLAX_EXPRESS_PORT'),
    host: env('FLAX_EXPRESS_HOST'),
    protocol: env('FLAX_EXPRESS_PROTOCOL'),
  },
  hypothesis: {
    apiKey: env('HYPOTHESIS_API_KEY'),
    group: env('HYPOTHESIS_GROUP') || '__world__',
    shouldAllowTagging: env('HYPOTHESIS_ALLOW_TAGGING'),
    reverseFieldOrder: env('HYPOTHESIS_REVERSE_FIELD_ORDER'),
  },
  'import-for-prc': {
    default_import:
      env('USE_COLAB_BIOPHYSICS_IMPORT', { type: 'boolean' }) || false,
  },
  journal: {
    recommendations: [
      {
        color: 'green',
        label: 'Accept',
        value: 'accept',
      },
      {
        color: 'orange',
        label: 'Revise',
        value: 'revise',
      },
      {
        color: 'red',
        label: 'Reject',
        value: 'reject',
      },
    ],
    roles: {
      author: 'Author',
      handlingEditor: 'Handling Editor',
      editor: 'Editor',
      managingEditor: 'Managing Editor',
      seniorEditor: 'Senior Editor',
      reviewer: 'Reviewer',
      collaborativeReviewer: 'Collaborative Reviewer',
    },
    tasks: {
      status: {
        NOT_STARTED: 'Not started',
        START: 'Start',
        IN_PROGRESS: 'In progress',
        PAUSED: 'Paused',
        DONE: 'Done',
      },
      assigneeTypes: {
        UNREGISTERED_USER: 'unregisteredUser',
        REGISTERED_USER: 'registeredUser',
        EDITOR: 'editor',
        REVIEWER: 'reviewer',
        COLLABORATIVE_REVIEWER: 'collaborativeReviewer',
        SENIOR_EDITOR: 'seniorEditor',
        HANDLING_EDITOR: 'handlingEditor',
        AUTHOR: 'author',
      },
      emailNotifications: {
        recipientTypes: {
          UNREGISTERED_USER: 'unregisteredUser',
          REGISTERED_USER: 'registeredUser',
          ASSIGNEE: 'assignee',
          EDITOR: 'editor',
          REVIEWER: 'reviewer',
          COLLABORATIVE_REVIEWER: 'collaborativeReviewer',
          SENIOR_EDITOR: 'seniorEditor',
          HANDLING_EDITOR: 'handlingEditor',
          AUTHOR: 'author',
        },
      },
    },
  },
  mailer: false,
  manuscripts: {
    teamTimezone: env('TEAM_TIMEZONE') || 'Etc/UTC',
    autoImportHourUtc: env('AUTO_IMPORT_HOUR_UTC'),
    archivePeriodDays: env('ARCHIVE_PERIOD_DAYS'),
    allowManualImport: env('ALLOW_MANUAL_IMPORT', { type: 'boolean' }) || false,
    semanticScholarImportsRecencyPeriodDays:
      env('SEMANTIC_SCHOLAR_IMPORTS_RECENCY_PERIOD_DAYS', { type: 'number' }) ||
      42,
  },
  pagedjs: {
    clientId: env('SERVICE_PAGEDJS_CLIENT_ID'),
    clientSecret: env('SERVICE_PAGEDJS_SECRET'),
    protocol: env('SERVICE_PAGEDJS_PROTOCOL'),
    host: env('SERVICE_PAGEDJS_HOST'),
    port: env('SERVICE_PAGEDJS_PORT'),
  },
  'publishing-webhook': {
    publishingWebhookUrl: env('PUBLISHING_WEBHOOK_URL'),
    publishingWebhookToken: env('PUBLISHING_WEBHOOK_TOKEN'),
    publishingWebhookRef: env('PUBLISHING_WEBHOOK_REF'),
  },
  review: {
    shared: env('REVIEW_SHARED'),
    hide: env('REVIEW_HIDE'),
  },
  schema: {},
  secret: env('PUBSWEET_SECRET'),
  sentry: false,
  staticFolders: [
    {
      folderPath: './profiles',
      mountPoint: '/profiles',
    },
  ],
  teams: {
    global: [
      {
        displayName: 'Admin',
        role: 'admin',
      },
      {
        displayName: 'Group Manager',
        role: 'groupManager',
      },
    ],
    nonGlobal: [
      {
        displayName: 'Senior Editor',
        role: 'seniorEditor',
      },
      {
        displayName: 'Handling Editor',
        role: 'handlingEditor',
      },
      {
        displayName: 'Editor',
        role: 'editor',
      },
      {
        displayName: 'Managing Editor',
        role: 'managingEditor',
      },
      {
        displayName: 'Reviewers',
        role: 'reviewer',
      },
      {
        displayName: 'Author',
        role: 'author',
      },
      {
        displayName: 'Collaborative Reviewers',
        role: 'collaborativeReviewer',
      },
      {
        displayName: 'User',
        role: 'user',
      },
      {
        displayName: 'Group Manager',
        role: 'groupManager',
      },
      {
        displayName: 'Group Admin',
        role: 'groupAdmin',
      },
    ],
  },
  tempFolderPath: env('TEMP_FOLDER_PATH'),
  tokenExpiresIn: 7 * 24 * 3600,
  wsYjsServerPort: env('WS_YJS_SERVER_PORT') || 5010,
  xsweet: {
    clientId: env('SERVICE_XSWEET_CLIENT_ID'),
    clientSecret: env('SERVICE_XSWEET_SECRET'),
    protocol: env('SERVICE_XSWEET_PROTOCOL'),
    host: env('SERVICE_XSWEET_HOST'),
    port: env('SERVICE_XSWEET_PORT'),
  },

  // pool: {
  //   min: 0,
  //   max: 10,
  //   createTimeoutMillis: 3000,
  //   acquireTimeoutMillis: 30000,
  //   idleTimeoutMillis: 30000,
  //   reapIntervalMillis: 1000,
  //   createRetryIntervalMillis: 100,
  //   propagateCreateError: false,
  // },
}
