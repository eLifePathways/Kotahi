import { z } from '@coko/server'

console.log('booya')

const MicroserviceSchema = z.strictObject({
  clientId: z.string().min(1, 'Client ID is required'),
  clientSecret: z.string().min(1, 'Client Secret is required'),
  protocol: z.enum(['http', 'https']).default('https'),
  host: z.string().min(1, 'Host is required'),
  port: z.coerce.number().int().positive().max(65535),
})

const schema = z.strictObject({
  anystyle: MicroserviceSchema,
  pagedjs: MicroserviceSchema,
  xsweet: MicroserviceSchema,

  adaKey: z.string().optional(),
  api: z
    .object({
      tokens: z.string().optional(),
    })
    .partial(),
  'auth-orcid': z.object({
    useSandboxedOrcid: z.coerce.boolean(),
    clientID: z.string().min(1, 'ORCID Client ID is required'),
    clientSecret: z.string().min(1, 'ORCID Client Secret is required'),
  }),
  chatGPT: z
    .object({
      key: z.string().min(1).optional(),
    })
    .partial(),
  crossref: z
    .object({
      login: z.string().optional(),
      password: z.string().optional(),
      registrant: z.string().optional(),
      depositorName: z.string().optional(),
      depositorEmail: z.string().email().optional().or(z.literal('')),
      publicationType: z.string().optional(),
      doiPrefix: z.string().optional(),
      publishedArticleLocationPrefix: z
        .string()
        .url()
        .optional()
        .or(z.literal('')),
      licenseUrl: z.string().url().optional().or(z.literal('')),
      useSandbox: z.coerce.boolean().optional(),
      journalAbbreviatedName: z.string().optional(),
      journalHomepage: z.string().url().optional().or(z.literal('')),
    })
    .partial(),
  datacite: z
    .object({
      login: z.string().optional(),
      password: z.string().optional(),
      doiPrefix: z
        .string()
        .regex(/^10\.\d{4,9}$/, 'Invalid DOI prefix format')
        .optional()
        .or(z.literal('')),
      useSandbox: z.coerce.boolean().optional(),
      publishedArticleLocationPrefix: z
        .string()
        .url('Must be a valid URL')
        .optional()
        .or(z.literal('')),
    })
    .partial(),
  'flax-site': z
    .object({
      clientId: z.string().optional(),
      clientSecret: z.string().optional(),
      clientAPIURL: z.string().url().optional().or(z.literal('')),
      clientFlaxSiteUrl: z.string().url().optional().or(z.literal('')),
      port: z.coerce.number().int().optional(),
      host: z.string().optional(),
      protocol: z.enum(['http', 'https']).optional(),
    })
    .partial(),
  hypothesis: z
    .object({
      apiKey: z.string().optional(),
      group: z.string().default('__world__'),
      shouldAllowTagging: z.coerce.boolean().optional(),
      reverseFieldOrder: z.coerce.boolean().optional(),
    })
    .partial(),
  'import-for-prc': z
    .object({
      default_import: z.boolean().default(false),
    })
    .partial(),
  journal: z
    .object({
      // Recommendations Array
      recommendations: z
        .array(
          z.object({
            color: z.string(),
            label: z.string(),
            value: z.string(),
          }),
        )
        .optional(),

      // Roles Mapping
      roles: z
        .object({
          author: z.string(),
          handlingEditor: z.string(),
          editor: z.string(),
          managingEditor: z.string(),
          seniorEditor: z.string(),
          reviewer: z.string(),
          collaborativeReviewer: z.string(),
        })
        .partial(),

      // Tasks and Nested Status/Types
      tasks: z
        .object({
          status: z.record(z.string(), z.string()),
          assigneeTypes: z.record(z.string(), z.string()),
          emailNotifications: z
            .object({
              recipientTypes: z.record(z.string(), z.string()),
            })
            .partial(),
        })
        .partial(),
    })
    .partial(),
  manuscripts: z
    .object({
      teamTimezone: z.string().default('Etc/UTC'),
      autoImportHourUtc: z.coerce.number().int().min(0).max(23).optional(),
      archivePeriodDays: z.coerce.number().int().positive().optional(),
      allowManualImport: z.boolean().default(false),
      semanticScholarImportsRecencyPeriodDays: z.number().default(42),
    })
    .partial(),
  'publishing-webhook': z
    .object({
      publishingWebhookUrl: z.string().url().optional().or(z.literal('')),
      publishingWebhookToken: z.string().optional(),
      publishingWebhookRef: z.string().optional(),
    })
    .partial(),
  review: z
    .object({
      shared: z.string().optional(),
      hide: z.string().optional(),
    })
    .partial(),
  schema: z.object(),
  tempFolderPath: z.string().optional(),
  wsYjsServerPort: z.coerce.number().int().positive().max(65535),
})

export default schema
