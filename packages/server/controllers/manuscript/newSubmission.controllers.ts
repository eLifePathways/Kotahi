import path from 'path'
import { Readable } from 'stream'
import { load } from 'cheerio'
import moment from 'moment-timezone'
import {
  createFile,
  File as FileModel,
  fileStorage,
  logger,
  type Transaction,
  useTransaction,
} from '@coko/server'

import xsweet from '../../services/connectors/XSweetConnector'
import cleanConvertedDocx from '../../utils/html/cleanConvertedDocx'
import { prefillSubmission } from '../submissionPrefill.controllers'
import Config from '../../models/config/config.model'
import Manuscript from '../../models/manuscript/manuscript.model'
import Task from '../../models/task/task.model'
import TaskEmailNotification from '../../models/taskEmailNotification/taskEmailNotification.model'
import sanitizeWaxImages from '../../utils/sanitizeWaxImages'

const DOCX_MIME_TYPE =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

const ACCEPTED_MIME_TYPES = [
  DOCX_MIME_TYPE,
  'application/x-latex',
  'text/vnd.latex-z',
  'text/plain',
  'text/x-tex',
  'application/x-tex',
  'application/x-dvi',
  'application/pdf',
  'application/epub+zip',
  'application/zip',
]

const ACCEPTED_EXTENSIONS = [
  '.docx',
  '.tex',
  '.latex',
  '.txt',
  '.dvi',
  '.pdf',
  '.epub',
  '.zip',
]

type NewSubmissionErrorCode =
  | 'UNSUPPORTED_FILE_TYPE'
  | 'CONVERSION_FAILED'
  | 'CREATION_FAILED'

export class NewSubmissionError extends Error {
  readonly code: NewSubmissionErrorCode

  constructor(
    code: NewSubmissionErrorCode,
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message, options)
    this.name = 'NewSubmissionError'
    this.code = code
  }
}

const isAccepted = (file: File): boolean =>
  ACCEPTED_MIME_TYPES.includes(file.type) ||
  ACCEPTED_EXTENSIONS.includes(path.extname(file.name).toLowerCase())

const isDocx = (file: File): boolean =>
  file.type === DOCX_MIME_TYPE ||
  path.extname(file.name).toLowerCase() === '.docx'

const getTitleFromHtml = (html: string): string =>
  load(html, null, false)('h1').first().text().trim()

const getTitleFromFileName = (fileName: string): string =>
  fileName.replace(/[_-]+/g, ' ').replace(/\.[^.]+$/, '')

const copyTemplatedTasks = async (
  manuscriptId: string,
  groupId: string,
  options: { trx?: Transaction } = {},
): Promise<void> =>
  useTransaction(
    async trx => {
      const templates = await Task.findTemplates(groupId, { trx })

      if (templates.length === 0) return

      const config = await Config.getActive(groupId, { trx })
      const timezone = config?.formData?.taskManager?.teamTimezone || 'Etc/UTC'
      const endOfToday = moment().tz(timezone).endOf('day')

      await Promise.all(
        templates.map(async (template, index) => {
          const {
            id: templateId,
            created: _created,
            updated: _updated,
            ...taskData
          } = template

          const task = await Task.insert(
            {
              ...taskData,
              manuscriptId,
              sequenceIndex: index,
              dueDate: moment(endOfToday)
                .add(template.defaultDurationDays, 'days')
                .toISOString(),
            },
            { trx },
          )

          const notifications = await TaskEmailNotification.findByTaskId(
            templateId,
            { trx },
          )

          if (notifications.length) {
            await TaskEmailNotification.insert(
              notifications.map(
                ({ id: _id, created: _c, updated: _u, ...notification }) => ({
                  ...notification,
                  taskId: task.id,
                }),
              ),
              { trx },
            )
          }
        }),
      )
    },
    { trx: options.trx },
  )

export type NewSubmissionStep =
  | 'converting'
  | 'cleaning'
  | 'inferringMetadata'
  | 'creatingManuscript'

export const createManuscriptFromFile = async (
  userId: string,
  groupId: string,
  file?: File,
  options: { onProgress?: (step: NewSubmissionStep) => void } = {},
): Promise<unknown> => {
  const { onProgress = (): void => {} } = options

  let html: string | undefined
  let submission: Record<string, unknown> = {}

  if (file) {
    if (!isAccepted(file)) {
      throw new NewSubmissionError(
        'UNSUPPORTED_FILE_TYPE',
        `File type of ${file.name} is not accepted`,
      )
    }

    if (isDocx(file)) {
      try {
        onProgress('converting')
        const convertedHtml = await xsweet.docxToHtml(file)
        onProgress('cleaning')
        html = cleanConvertedDocx(convertedHtml)
      } catch (error) {
        throw new NewSubmissionError(
          'CONVERSION_FAILED',
          `Could not convert ${file.name}`,
          { cause: error },
        )
      }

      onProgress('inferringMetadata')
      submission = await prefillSubmission(groupId, html)
    }
  }

  submission.$title =
    submission.$title ||
    (html && getTitleFromHtml(html)) ||
    (file && getTitleFromFileName(file.name)) ||
    `New submission ${new Date().toLocaleString()}`

  const storedKeys: string[] = []

  onProgress('creatingManuscript')

  try {
    return await useTransaction(async trx => {
      const manuscript = await Manuscript.createNewManuscript(
        {
          status: 'new',
          meta: { source: html },
          submission: {
            ...submission,
            $editDate: new Date().toISOString().split('T')[0],
          },
          submitterId: userId,
          groupId,
          authorFeedback: {},
        },
        { trx },
      )

      if (file) {
        const storedFile = await createFile(
          Readable.from(Buffer.from(await file.arrayBuffer())),
          file.name,
          { tags: ['manuscript'], objectId: manuscript.id, trx },
        )

        storedKeys.push(...storedFile.storedObjects.map(object => object.key))
      }

      if (html) {
        const source = await sanitizeWaxImages(html, manuscript.id, {
          trx,
          onFileCreated: (createdFile: FileModel) => {
            storedKeys.push(
              ...createdFile.storedObjects.map(object => object.key),
            )
          },
        })

        await Manuscript.patchById(manuscript.id, { meta: { source } }, { trx })
      }

      await copyTemplatedTasks(manuscript.id, groupId, { trx })

      return Manuscript.findById(manuscript.id, { trx })
    })
  } catch (error) {
    if (storedKeys.length) {
      try {
        await fileStorage.delete(storedKeys)
      } catch (deleteError) {
        logger.error(
          `Could not delete stored files after a failed submission: ${storedKeys.join(', ')}`,
          deleteError,
        )
      }
    }

    throw new NewSubmissionError(
      'CREATION_FAILED',
      'Could not create the submission',
      { cause: error },
    )
  }
}
