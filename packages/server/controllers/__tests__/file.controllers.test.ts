import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import {
  db,
  config,
  migrationManager,
  fileStorage,
  File,
  uuid,
} from '@coko/server'

import DbTestUtils from '../../models/DbTestUtils'
import Form from '../../models/form/form.model'
import Group from '../../models/group/group.model'
import Manuscript from '../../models/manuscript/manuscript.model'
import Review from '../../models/review/review.model'
import User from '../../models/user/user.model'
import { encrypt } from '../../utils/encryptDecryptUtils'
import { isPublicFile, publishedFileUrl } from '../file.controllers'

const storedObject = (
  type: string,
  key: string,
  mimetype: string,
): Record<string, unknown> => ({
  type,
  key,
  mimetype,
  extension: key.split('.').pop(),
  size: 100,
})

const formFields = (...fields: Record<string, unknown>[]): Form.FormField[] =>
  fields as Form.FormField[]

const insertForm = async (
  groupId: string,
  children: Form.FormField[],
): Promise<void> => {
  // @ts-ignore
  await Form.insert({
    groupId,
    purpose: 'submit',
    category: 'submission',
    structure: { name: 'Submission', children },
  })
}

describe('isPublicFile', () => {
  const manuscript = {
    id: 'm1',
    published: '2026-01-01',
    meta: { source: '<p><img data-fileid="image" src="x"></p>' },
  } as unknown as Manuscript

  const fields = formFields(
    {
      name: 'submission.attachments',
      component: 'SupplementaryFiles',
      permitPublishing: 'always',
    },
    {
      name: 'submission.private',
      component: 'GenericFiles',
      permitPublishing: 'false',
    },
  )

  const file = (id: string, tags: string[] = []): File =>
    ({ id, objectId: 'm1', tags }) as unknown as File

  it('accepts images the body uses and files of published file fields', () => {
    expect(isPublicFile(file('image'), manuscript, fields)).toBe(true)

    expect(isPublicFile(file('a', ['supplementary']), manuscript, fields)).toBe(
      true,
    )
  })

  it('refuses files of unpublished fields and untagged files', () => {
    expect(
      isPublicFile(file('a', ['submission.private']), manuscript, fields),
    ).toBe(false)

    expect(isPublicFile(file('a'), manuscript, fields)).toBe(false)
  })

  it('accepts external attachments of published fields', () => {
    expect(
      isPublicFile(
        file('a', ['supplementary', 'externalAttachmentSource']),
        manuscript,
        fields,
      ),
    ).toBe(true)
  })

  it('refuses files of unpublished or other manuscripts', () => {
    const unpublished = { ...manuscript, published: null } as Manuscript
    expect(isPublicFile(file('image'), unpublished, fields)).toBe(false)

    const other = { ...file('image'), objectId: 'm2' } as File
    expect(isPublicFile(other, manuscript, fields)).toBe(false)
  })
})

beforeAll(async () => {
  await config.init()
  db.init()
  await migrationManager.migrate()
  fileStorage.init()
})

beforeEach(async () => {
  await DbTestUtils.clearDb()
})

afterAll(async () => {
  await DbTestUtils.clearDb()
})

describe('publishedFileUrl', () => {
  const EXTERNAL_FIELD_ID = uuid()

  const setUp = async ({
    published = true,
    permitPublishing = 'always',
  } = {}): Promise<Record<string, File>> => {
    const group = await Group.insert({})

    await insertForm(
      group.id,
      formFields(
        {
          name: 'submission.attachments',
          component: 'SupplementaryFiles',
          permitPublishing,
        },
        {
          id: EXTERNAL_FIELD_ID,
          name: 'submission.dataFiles',
          component: 'GenericFiles',
          permitPublishing,
          uploadAttachmentSource: 'external',
          s3Url: 'https://external.example',
          s3Bucket: 'field-bucket',
          s3Region: 'us-east-1',
          s3AccessId: encrypt('external-id'),
          s3AccessToken: encrypt('external-secret'),
        },
      ),
    )

    const inserted = await Manuscript.insert({
      groupId: group.id,
      meta: {},
      ...(published
        ? { status: 'published', published: new Date().toISOString() }
        : {}),
    })

    const insertFile = (
      name: string,
      tags: string[],
      mimetype: string,
      sizes = ['original'],
      meta = {},
    ): Promise<File> =>
      File.insert({
        name,
        objectId: inserted.id,
        tags,
        meta,
        storedObjects: sizes.map(type =>
          storedObject(type, `${type}-${name}`, mimetype),
        ),
      } as Partial<File>)

    const image = await insertFile(
      'figure.png',
      ['manuscriptImage'],
      'image/png',
      ['original', 'medium'],
    )

    const unused = await insertFile(
      'unused.png',
      ['manuscriptImage'],
      'image/png',
    )
    const attachment = await insertFile(
      'data.csv',
      ['supplementary'],
      'text/csv',
    )

    const external = await insertFile(
      'external.csv',
      ['submission.dataFiles', 'externalAttachmentSource'],
      'text/csv',
      ['original'],
      { formElementId: EXTERNAL_FIELD_ID, bucket: 'upload-bucket' },
    )

    await Manuscript.patchById(inserted.id, {
      meta: { source: `<p><img data-fileid="${image.id}" src="stale"></p>` },
    })

    const orphan = await insertFile(
      'orphan.csv',
      ['submission.dataFiles', 'externalAttachmentSource'],
      'text/csv',
      ['original'],
      { formElementId: uuid(), bucket: 'upload-bucket' },
    )

    return { image, unused, attachment, external, orphan }
  }

  it('signs files that a published export links to', async () => {
    const { image, attachment } = await setUp()

    const imageUrl = await publishedFileUrl(image.id)
    expect(imageUrl).toContain('original-figure.png')
    expect(imageUrl).toContain('X-Amz-Expires=300')

    expect(await publishedFileUrl(attachment.id)).toContain('original-data.csv')
  })

  it("signs external attachments with their field's storage and upload bucket", async () => {
    const { external } = await setUp()

    const url = await publishedFileUrl(external.id)

    expect(url).toContain('external.example')
    expect(url).toContain('upload-bucket')
    expect(url).toContain('original-external.csv')
    expect(url).toContain('X-Amz-Expires=300')
  })

  it('refuses external attachments whose upload field is gone', async () => {
    const { orphan } = await setUp()
    expect(await publishedFileUrl(orphan.id)).toBeNull()
  })

  it('signs the requested size', async () => {
    const { image } = await setUp()

    expect(await publishedFileUrl(image.id, 'medium')).toContain(
      'medium-figure.png',
    )

    expect(await publishedFileUrl(image.id, 'small')).toBeNull()
  })

  it('refuses files that no export links to', async () => {
    const { unused } = await setUp()
    expect(await publishedFileUrl(unused.id)).toBeNull()
  })

  it('refuses files of unpublished manuscripts', async () => {
    const { image } = await setUp({ published: false })
    expect(await publishedFileUrl(image.id)).toBeNull()
  })

  it('refuses files of fields that are not published', async () => {
    const { attachment } = await setUp({ permitPublishing: 'true' })
    expect(await publishedFileUrl(attachment.id)).toBeNull()
  })

  it('refuses ids that are not files', async () => {
    expect(await publishedFileUrl('not-a-uuid')).toBeNull()

    expect(
      await publishedFileUrl('00000000-0000-4000-8000-000000000000'),
    ).toBeNull()
  })
})

describe('publishedFileUrl for review and decision files', () => {
  const setUp = async ({
    published = true,
    reviewFilesPublishing = 'always',
  } = {}): Promise<Record<string, File>> => {
    const group = await Group.insert({})

    await insertForm(group.id, [])

    // @ts-ignore
    await Form.insert({
      groupId: group.id,
      purpose: 'review',
      category: 'review',
      structure: {
        name: 'Review',
        children: formFields({
          name: 'files',
          component: 'SupplementaryFiles',
          permitPublishing: reviewFilesPublishing,
        }),
      },
    })

    // @ts-ignore
    await Form.insert({
      groupId: group.id,
      purpose: 'decision',
      category: 'decision',
      structure: {
        name: 'Decision',
        children: formFields({
          name: 'files',
          component: 'SupplementaryFiles',
          permitPublishing: 'always',
        }),
      },
    })

    const manuscript = await Manuscript.insert({
      groupId: group.id,
      meta: {},
      ...(published
        ? { status: 'published', published: new Date().toISOString() }
        : {}),
    })

    await Manuscript.createTeams(manuscript.id)

    const addReview = async (
      isDecision: boolean,
      status?: string,
    ): Promise<File> => {
      let userId = null

      if (status) {
        const user = await User.insert({})
        await Manuscript.assignRole(user.id, manuscript.id, 'reviewer', {
          status,
        })
        userId = user.id
      }

      const review = await Review.insert({
        manuscriptId: manuscript.id,
        userId,
        isDecision,
        jsonData: '{}',
      })

      const file = await File.insert({
        name: 'report.pdf',
        objectId: review.id,
        tags: [isDecision ? 'decision' : 'review'],
        storedObjects: [
          storedObject('original', 'report.pdf', 'application/pdf'),
        ],
      } as Partial<File>)

      await Review.patchById(review.id, {
        jsonData: JSON.stringify({ files: [file.id] }),
      })

      return file
    }

    return {
      completed: await addReview(false, 'completed'),
      inProgress: await addReview(false, 'inProgress'),
      decision: await addReview(true),
    }
  }

  it('signs files of completed reviews and decisions', async () => {
    const { completed, decision } = await setUp()

    expect(await publishedFileUrl(completed.id)).toContain('report.pdf')
    expect(await publishedFileUrl(decision.id)).toContain('report.pdf')
  })

  it('refuses files of reviews that are not completed', async () => {
    const { inProgress } = await setUp()
    expect(await publishedFileUrl(inProgress.id)).toBeNull()
  })

  it('refuses files of review fields that are not published', async () => {
    const { completed } = await setUp({ reviewFilesPublishing: 'true' })
    expect(await publishedFileUrl(completed.id)).toBeNull()
  })

  it('refuses review files of unpublished manuscripts', async () => {
    const { completed, decision } = await setUp({ published: false })

    expect(await publishedFileUrl(completed.id)).toBeNull()
    expect(await publishedFileUrl(decision.id)).toBeNull()
  })
})
