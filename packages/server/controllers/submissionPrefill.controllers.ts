import { logger, z } from '@coko/server'

import Config from '../models/config/config.model'
import Form from '../models/form/form.model'
import OpenAiConnector from '../services/connectors/OpenAiConnector'

type PrefillField = {
  name: string
  component: string
  aiPrompt?: string | null
}

type SubmissionData = Record<string, unknown>

const authorSchema = z.strictObject({
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  email: z.string().nullable(),
  middleName: z.string().nullable(),
  orcid: z.string().nullable(),
})

export const prefillSubmission = async (
  groupId: string,
  html: string,
): Promise<SubmissionData> => {
  const config = await Config.getActive(groupId)
  const { toggleAi, AiSubmission } = config?.formData?.groupIdentity ?? {}
  if (!toggleAi || !AiSubmission) return {}

  try {
    const form = await Form.findOne({
      purpose: 'submit',
      category: 'submission',
      groupId,
    })

    if (!form) throw new Error(`No active submission form for group ${groupId}`)

    const formFields: PrefillField[] = form.getFields()
    const aiFields = formFields
      .filter(field => field.aiPrompt)
      .map(field => ({
        key: field.name.split('.').pop() ?? field.name, // eg. clean up submission.$title to $title
        component: field.component,
        aiPrompt: field.aiPrompt,
      }))
    if (aiFields.length === 0) return {}

    // #region call-openai
    const responseSchema = z.strictObject(
      Object.fromEntries(
        aiFields.map(field => {
          if (field.component === 'AuthorsInput') {
            return [
              field.key,
              z.array(authorSchema).nullable().describe(field.aiPrompt),
            ]
          }

          return [field.key, z.string().nullable().describe(field.aiPrompt)]
        }),
      ),
    )

    // drops embedded images that might have come from xsweet conversion
    const sanitizedHTML = html.replace(/"data:[^"]*"/g, '""')

    const openAi = await OpenAiConnector.forGroup(groupId)
    const result = await openAi.chatCompletion({
      schema: responseSchema,
      schemaName: 'submission',
      messages: [
        {
          role: 'system',
          content: [
            'You are an AI assistant that extracts data from HTML documents as JSON.',
            'If information is unclear or missing, mark it as null.',
          ].join('\n'),
        },
        {
          role: 'user',
          content: `HTML:\n${sanitizedHTML}`,
        },
      ],
    })
    // #endregion call-openai

    // return only keys that actually have a value
    const cleaned = Object.fromEntries(
      Object.entries(result).filter(([, value]) => value),
    )
    return cleaned
  } catch (error) {
    logger.warn(
      `AI prefill failed for group ${groupId}, continuing without it`,
      error,
    )
    return {}
  }
}
