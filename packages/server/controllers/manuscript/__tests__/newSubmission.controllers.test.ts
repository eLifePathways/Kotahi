import {
  describe,
  beforeAll,
  beforeEach,
  afterEach,
  afterAll,
  it,
  expect,
  vi,
} from 'vitest'
import { load } from 'cheerio'
import moment from 'moment-timezone'
import {
  db,
  config,
  DbTestUtils,
  migrationManager,
  fileStorage,
  FileStorageConstructor,
  File as FileModel,
} from '@coko/server'

import Group from '../../../models/group/group.model'
import User from '../../../models/user/user.model'
import Config from '../../../models/config/config.model'
import Manuscript from '../../../models/manuscript/manuscript.model'
import Task from '../../../models/task/task.model'
import TaskEmailNotification from '../../../models/taskEmailNotification/taskEmailNotification.model'
import {
  createManuscriptFromFile,
  getNewSubmissionSettings,
  NewSubmissionError,
} from '../newSubmission.controllers'

const { docxToHtml, prefillSubmission } = vi.hoisted(() => ({
  docxToHtml: vi.fn(),
  prefillSubmission: vi.fn(),
}))

vi.mock('../../../services/connectors/XSweetConnector', () => ({
  default: { docxToHtml },
}))

vi.mock('../../submissionPrefill.controllers', () => ({ prefillSubmission }))

// 1x1 transparent png
const PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='

const TIMEZONE = 'Pacific/Auckland'

const docx = (name = 'paper.docx'): File =>
  new File(['docx content'], name, {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })

const manuscriptFiles = async (manuscriptId: string): Promise<FileModel[]> =>
  (await FileModel.find({ objectId: manuscriptId })).result

const manuscriptCount = async (): Promise<number> =>
  (await Manuscript.find({})).totalCount

const fileCount = async (): Promise<number> =>
  (await FileModel.find({})).totalCount

const create = (
  userId: string,
  groupId: string,
  file?: File,
  onProgress?: (step: string) => void,
): Promise<Manuscript> =>
  createManuscriptFromFile(userId, groupId, file, {
    onProgress,
  }) as Promise<Manuscript>

describe('createManuscriptFromFile', () => {
  let userId: string
  let groupId: string

  beforeAll(async () => {
    await config.init()
    db.init()
    await migrationManager.migrate()
    fileStorage.init()
  })

  beforeEach(async () => {
    await DbTestUtils.clearDb()

    const group = await Group.insert({})
    const user = await User.insert({})
    groupId = group.id
    userId = user.id

    await Config.insert({
      groupId,
      active: true,
      formData: { taskManager: { teamTimezone: TIMEZONE } },
    })

    docxToHtml.mockResolvedValue('<h1>Converted title</h1><p>Body</p>')
    prefillSubmission.mockResolvedValue({})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    docxToHtml.mockReset()
    prefillSubmission.mockReset()
  })

  afterAll(async () => {
    await DbTestUtils.clearDb()
  })

  describe('with a .docx file', () => {
    it('creates a new manuscript for the user and group', async () => {
      const manuscript = await create(userId, groupId, docx())

      expect(manuscript.status).toBe('new')
      expect(manuscript.submitterId).toBe(userId)
      expect(manuscript.groupId).toBe(groupId)
      expect(manuscript.authorFeedback).toEqual({})

      expect(manuscript.submission.$editDate).toBe(
        new Date().toISOString().split('T')[0],
      )
    })

    it('converts the file and stores the result as the manuscript source', async () => {
      const file = docx()

      const manuscript = await create(userId, groupId, file)

      expect(docxToHtml).toHaveBeenCalledWith(file)
      expect(manuscript.meta.source).toContain('<p>Body</p>')
    })

    it('cleans up the converted HTML', async () => {
      docxToHtml.mockResolvedValue(
        '<p>Hello <span class="deletion">old </span><span class="insertion">new </span>world</p>',
      )

      const manuscript = await create(userId, groupId, docx())

      expect(manuscript.meta.source).toContain('<p>Hello new world</p>')
    })

    it('pre-fills the submission from the cleaned HTML', async () => {
      prefillSubmission.mockResolvedValue({ $abstract: 'An abstract' })

      const manuscript = await create(userId, groupId, docx())

      expect(prefillSubmission).toHaveBeenCalledWith(
        groupId,
        '<h1>Converted title</h1><p>Body</p>',
      )

      expect(manuscript.submission.$abstract).toBe('An abstract')
    })

    it('stores the original file with the manuscript', async () => {
      const manuscript = await create(userId, groupId, docx())

      const [stored] = await manuscriptFiles(manuscript.id)

      expect(stored.name).toBe('paper.docx')
      expect(stored.tags).toEqual(['manuscript'])
      expect(stored.storedObjects.length).toBeGreaterThan(0)
    })

    it('stores embedded images and points the source at them', async () => {
      docxToHtml.mockResolvedValue(`<p>Text</p><p><img src="${PNG}"></p>`)

      const manuscript = await create(userId, groupId, docx())

      const files = await manuscriptFiles(manuscript.id)
      const image = files.find(file => file.name !== 'paper.docx')
      const $ = load(manuscript.meta.source)

      expect(files).toHaveLength(2)
      expect($('img').attr('data-fileid')).toBe(image.id)
      expect(manuscript.meta.source).not.toContain('base64')
    })

    it('accepts the extension in any case', async () => {
      await create(userId, groupId, docx('PAPER.DOCX'))

      expect(docxToHtml).toHaveBeenCalled()
    })
  })

  describe('with another accepted file type', () => {
    it('stores the file without converting it', async () => {
      const file = new File(['%PDF'], 'paper.pdf', { type: 'application/pdf' })

      const manuscript = await create(userId, groupId, file)

      expect(docxToHtml).not.toHaveBeenCalled()
      expect(prefillSubmission).not.toHaveBeenCalled()
      expect(manuscript.meta.source).toBeFalsy()
      expect(await manuscriptFiles(manuscript.id)).toHaveLength(1)
    })
  })

  describe('without a file', () => {
    it('creates a manuscript with no source and no files', async () => {
      const manuscript = await create(userId, groupId)

      expect(docxToHtml).not.toHaveBeenCalled()
      expect(prefillSubmission).not.toHaveBeenCalled()
      expect(manuscript.meta.source).toBeFalsy()
      expect(await manuscriptFiles(manuscript.id)).toHaveLength(0)
    })
  })

  describe('title', () => {
    it('uses the title found by the pre-fill first', async () => {
      prefillSubmission.mockResolvedValue({ $title: 'AI title' })

      const manuscript = await create(userId, groupId, docx())

      expect(manuscript.submission.$title).toBe('AI title')
    })

    it('falls back to the first heading of the document', async () => {
      const manuscript = await create(userId, groupId, docx())

      expect(manuscript.submission.$title).toBe('Converted title')
    })

    it('falls back to the file name when the document has no heading', async () => {
      docxToHtml.mockResolvedValue('<p>Body</p>')

      const manuscript = await create(userId, groupId, docx('my_paper-v2.docx'))

      expect(manuscript.submission.$title).toBe('my paper v2')
    })

    it('uses the file name for files that are not converted', async () => {
      const file = new File(['%PDF'], 'final_draft.pdf')

      const manuscript = await create(userId, groupId, file)

      expect(manuscript.submission.$title).toBe('final draft')
    })

    it('uses a dated default title without a file', async () => {
      const manuscript = await create(userId, groupId)

      expect(manuscript.submission.$title).toMatch(/^New submission /)
    })
  })

  describe('task templates', () => {
    it("copies the group's task templates and their notifications to the manuscript", async () => {
      const first = await Task.insert({
        groupId,
        manuscriptId: null,
        title: 'Assign reviewers',
        defaultDurationDays: 3,
        sequenceIndex: 4,
        status: 'Not started',
      })

      const second = await Task.insert({
        groupId,
        manuscriptId: null,
        title: 'Make decision',
        defaultDurationDays: 10,
        sequenceIndex: 7,
        status: 'Not started',
      })

      await TaskEmailNotification.insert([
        {
          taskId: first.id,
          recipientType: 'assignee',
          notificationElapsedDays: 1,
        },
        {
          taskId: first.id,
          recipientType: 'editor',
          notificationElapsedDays: 2,
        },
        {
          taskId: second.id,
          recipientType: 'author',
          notificationElapsedDays: 5,
        },
      ])

      const manuscript = await create(userId, groupId)

      const { result: tasks } = await Task.find(
        { manuscriptId: manuscript.id },
        { orderBy: 'sequenceIndex' },
      )

      expect(tasks.map(task => [task.title, task.sequenceIndex])).toEqual([
        ['Assign reviewers', 0],
        ['Make decision', 1],
      ])

      const endOfToday = moment().tz(TIMEZONE).endOf('day')

      expect(new Date(tasks[0].dueDate as string).toISOString()).toBe(
        moment(endOfToday).add(3, 'days').toISOString(),
      )

      const { result: firstNotifications } = await TaskEmailNotification.find({
        taskId: tasks[0].id,
      })

      const { result: secondNotifications } = await TaskEmailNotification.find({
        taskId: tasks[1].id,
      })

      expect(
        firstNotifications
          .map(notification => notification.recipientType)
          .sort(),
      ).toEqual(['assignee', 'editor'])

      expect(secondNotifications.map(n => n.recipientType)).toEqual(['author'])
    })

    it('leaves the templates themselves unchanged', async () => {
      const template = await Task.insert({
        groupId,
        manuscriptId: null,
        title: 'Assign reviewers',
        defaultDurationDays: 3,
        sequenceIndex: 0,
        status: 'Not started',
      })

      await create(userId, groupId)

      const unchanged = await Task.findById(template.id)

      expect(unchanged.manuscriptId).toBeNull()
      expect(unchanged.title).toBe('Assign reviewers')
    })
  })

  describe('progress', () => {
    it('reports every step for a .docx file', async () => {
      const steps: string[] = []

      await create(userId, groupId, docx(), step => steps.push(step))

      expect(steps).toEqual([
        'converting',
        'cleaning',
        'inferringMetadata',
        'creatingManuscript',
      ])
    })

    it('only reports creating the manuscript for other files', async () => {
      const steps: string[] = []
      const file = new File(['%PDF'], 'paper.pdf')

      await create(userId, groupId, file, step => steps.push(step))

      expect(steps).toEqual(['creatingManuscript'])
    })

    it('only reports creating the manuscript without a file', async () => {
      const steps: string[] = []

      await create(userId, groupId, undefined, step => steps.push(step))

      expect(steps).toEqual(['creatingManuscript'])
    })
  })

  describe('errors', () => {
    it('rejects files with an unsupported extension', async () => {
      const file = new File(['MZ'], 'paper.exe')

      const error = await create(userId, groupId, file).catch(e => e)

      expect(error).toBeInstanceOf(NewSubmissionError)
      expect(error.code).toBe('UNSUPPORTED_FILE_TYPE')
      expect(await manuscriptCount()).toBe(0)
      expect(await fileCount()).toBe(0)
    })

    it('fails without storing anything when the conversion fails', async () => {
      const upload = vi.spyOn(FileStorageConstructor.prototype, 'upload')
      const steps: string[] = []
      docxToHtml.mockRejectedValue(new Error('XSweet is down'))

      const error = await create(userId, groupId, docx(), step =>
        steps.push(step),
      ).catch(e => e)

      expect(error).toBeInstanceOf(NewSubmissionError)
      expect(error.code).toBe('CONVERSION_FAILED')
      expect(error.cause.message).toBe('XSweet is down')
      expect(steps).toEqual(['converting'])
      expect(upload).not.toHaveBeenCalled()
      expect(await manuscriptCount()).toBe(0)
    })

    it('rolls everything back and removes the stored files when creating the manuscript fails', async () => {
      docxToHtml.mockResolvedValue(`<p>Text</p><p><img src="${PNG}"></p>`)

      const upload = vi.spyOn(FileStorageConstructor.prototype, 'upload')
      const remove = vi.spyOn(FileStorageConstructor.prototype, 'delete')

      vi.spyOn(Manuscript, 'patchById').mockRejectedValueOnce(
        new Error('Database is down'),
      )

      const error = await create(userId, groupId, docx()).catch(e => e)

      expect(error).toBeInstanceOf(NewSubmissionError)
      expect(error.code).toBe('CREATION_FAILED')
      expect(error.cause.message).toBe('Database is down')

      expect(await manuscriptCount()).toBe(0)
      expect(await fileCount()).toBe(0)

      const uploadedKeys = (
        await Promise.all(upload.mock.results.map(result => result.value))
      )
        .flat()
        .map(object => object.key)

      expect(uploadedKeys.length).toBeGreaterThan(0)
      expect(remove).toHaveBeenCalledWith(uploadedKeys)

      await Promise.all(
        uploadedKeys.map(key =>
          expect(fileStorage.getFileContent(key)).rejects.toThrow(),
        ),
      )
    })
  })
})

describe('getNewSubmissionSettings', () => {
  it('returns the upload size limit and the accepted extensions', () => {
    expect(getNewSubmissionSettings()).toEqual({
      maxUploadSizeMb: config.get('manuscripts.maxUploadSizeMb'),
      acceptedFileTypes: [
        '.docx',
        '.tex',
        '.latex',
        '.txt',
        '.dvi',
        '.pdf',
        '.epub',
        '.zip',
      ],
    })
  })
})
