import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { db, config, migrationManager, serverUrl, File } from '@coko/server'

import DbTestUtils from '../../models/DbTestUtils'
import Form from '../../models/form/form.model'
import Group from '../../models/group/group.model'
import Manuscript from '../../models/manuscript/manuscript.model'
import Review from '../../models/review/review.model'
import User from '../../models/user/user.model'
import OxaExporter from '../../services/oxa/OxaExporter'
import OxaImporter from '../../services/oxa/OxaImporter'
import {
  manuscriptToOxa,
  manuscriptToOxaSource,
  oxaSourceToManuscript,
  reviewsToMetadata,
} from '../oxa.controllers'

const BODY =
  '<p class="paragraph">Body</p><figure><img src="stale" data-fileid="f1"></figure>'

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

const manuscript = {
  id: 'm1',
  groupId: 'g1',
  doi: '10.1000/assigned',
  meta: { source: BODY },
  files: [
    {
      id: 'f1',
      name: 'figure.png',
      tags: ['manuscriptImage'],
      storedObjects: [
        storedObject('original', 'a.png', 'image/png'),
        storedObject('medium', 'a_medium.png', 'image/png'),
      ],
    },
    {
      id: 'f2',
      name: 'data.csv',
      tags: ['supplementary'],
      storedObjects: [storedObject('original', 'data.csv', 'text/csv')],
    },
    {
      id: 'f3',
      name: 'external.csv',
      tags: ['supplementary', 'externalAttachmentSource'],
      storedObjects: [storedObject('original', 'external.csv', 'text/csv')],
    },
    {
      id: 'f4',
      name: 'unused.png',
      tags: ['manuscriptImage'],
      storedObjects: [storedObject('original', 'unused.png', 'image/png')],
    },
    {
      id: 'f5',
      name: 'raw.zip',
      tags: ['submission.dataFiles'],
      storedObjects: [storedObject('original', 'raw.zip', 'application/zip')],
    },
    {
      id: 'f6',
      name: 'broken.zip',
      tags: ['submission.dataFiles'],
      storedObjects: [],
    },
  ],
  submission: {
    $title: 'Title',
    $doi: '10.1000/xyz',
    $authors: [{ firstName: 'Jane', lastName: 'Doe' }],
    $volumeNumber: '4',
    funder: 'NSF',
    summary: '<p>Summary</p>',
    privateNote: 'internal',
    empty: '',
    discussion: [{ id: 'd1' }],
  },
} as unknown as Manuscript

const formFields = (...fields: Record<string, unknown>[]): Form.FormField[] =>
  fields as Form.FormField[]

const always = (
  name: string,
  extra: Record<string, unknown> = {},
): Record<string, unknown> => ({
  name,
  permitPublishing: 'always',
  ...extra,
})

describe('manuscriptToOxaSource', () => {
  it('passes published fields through as metadata and takes the title out', () => {
    const source = manuscriptToOxaSource(
      manuscript,
      formFields(
        always('submission.$title'),
        always('submission.$doi'),
        always('submission.$authors', { component: 'AuthorsInput' }),
        always('submission.funder', { component: 'TextField' }),
      ),
    )

    expect(source).toEqual({
      body: BODY,
      title: 'Title',
      metadata: [
        { path: 'funder', value: 'NSF' },
        { path: 'doi', value: '10.1000/xyz' },
        {
          path: 'authors',
          value: [{ firstName: 'Jane', lastName: 'Doe' }],
        },
      ],
      files: [{ id: 'f1', name: 'figure.png', mimetype: 'image/png' }],
    })
  })

  it('keeps only the body and files when nothing is published', () => {
    expect(manuscriptToOxaSource(manuscript, [])).toEqual({
      body: BODY,
      title: undefined,
      metadata: [],
      files: [{ id: 'f1', name: 'figure.png', mimetype: 'image/png' }],
    })
  })

  it('leaves out fields that are never published', () => {
    const source = manuscriptToOxaSource(
      manuscript,
      formFields(
        { name: 'submission.$title', permitPublishing: 'false' },
        { name: 'submission.privateNote', permitPublishing: 'false' },
      ),
    )

    expect(source.title).toBeUndefined()
    expect(source.metadata).toEqual([])
  })

  it('includes ad hoc fields only when an editor selected them', () => {
    const adHoc = formFields({
      name: 'submission.$title',
      permitPublishing: 'true',
    })

    expect(manuscriptToOxaSource(manuscript, adHoc).title).toBeUndefined()

    const selected = {
      ...manuscript,
      formFieldsToPublish: [
        { objectId: 'm1', fieldsToPublish: ['submission.$title'] },
      ],
    } as unknown as Manuscript

    expect(manuscriptToOxaSource(selected, adHoc).title).toBe('Title')

    const otherObject = {
      ...manuscript,
      formFieldsToPublish: [
        { objectId: 'other', fieldsToPublish: ['submission.$title'] },
      ],
    } as unknown as Manuscript

    expect(manuscriptToOxaSource(otherObject, adHoc).title).toBeUndefined()
  })

  it('does not fall back to the assigned DOI', () => {
    expect(
      manuscriptToOxaSource(
        manuscript,
        formFields({ name: 'submission.$doi', permitPublishing: 'false' }),
      ).metadata,
    ).toEqual([])
  })

  it('marks HTML fields and skips empty and discussion fields', () => {
    const source = manuscriptToOxaSource(
      manuscript,
      formFields(
        always('submission.summary', { component: 'AbstractEditor' }),
        always('submission.empty', { component: 'TextField' }),
        always('submission.discussion', { component: 'ThreadedDiscussion' }),
      ),
    )

    expect(source.metadata).toEqual([
      { path: 'summary', value: '<p>Summary</p>', html: true },
    ])
  })

  it('lists the files of published file fields by their tag, skipping files without an original', () => {
    const source = manuscriptToOxaSource(
      manuscript,
      formFields(
        always('submission.attachments', { component: 'SupplementaryFiles' }),
        always('submission.dataFiles', { component: 'GenericFiles' }),
        always('visualAbstract', { component: 'VisualAbstract' }),
        { name: 'manuscriptFile', component: 'ManuscriptFile' },
      ),
    )

    expect(source.metadata).toEqual([
      {
        path: 'attachments',
        files: [
          { id: 'f2', name: 'data.csv', mimetype: 'text/csv' },
          { id: 'f3', name: 'external.csv', mimetype: 'text/csv' },
        ],
      },
      {
        path: 'dataFiles',
        files: [{ id: 'f5', name: 'raw.zip', mimetype: 'application/zip' }],
      },
    ])
  })

  it('only lists images that the body uses', () => {
    expect(manuscriptToOxaSource(manuscript, []).files).toEqual([
      { id: 'f1', name: 'figure.png', mimetype: 'image/png' },
    ])
  })

  it('puts $ fields last', () => {
    const source = manuscriptToOxaSource(
      {
        ...manuscript,
        submission: { $volumeNumber: '4', volumeNumber: '5' },
      } as unknown as Manuscript,
      formFields(
        always('submission.$volumeNumber'),
        always('submission.volumeNumber'),
      ),
    )

    expect(source.metadata).toEqual([
      { path: 'volumeNumber', value: '5' },
      { path: 'volumeNumber', value: '4' },
    ])
  })
})

describe('reviewsToMetadata', () => {
  const reviewManuscript = {
    id: 'm1',
    formFieldsToPublish: [{ objectId: 'r1', fieldsToPublish: ['note'] }],
  } as unknown as Manuscript

  const reviewFields = formFields(
    always('comment', { component: 'AbstractEditor' }),
    always('$verdict', { component: 'RadioGroup' }),
    { name: 'note', component: 'TextField', permitPublishing: 'true' },
    { name: 'private', component: 'TextField', permitPublishing: 'false' },
    always('discussion', { component: 'ThreadedDiscussion' }),
    always('attachments', { component: 'SupplementaryFiles' }),
  )

  const review = (
    id: string,
    created: string,
    jsonData: Record<string, unknown>,
  ): Review => ({ id, created, jsonData }) as unknown as Review

  const files = [
    {
      id: 'rf1',
      name: 'review.pdf',
      storedObjects: [
        storedObject('original', 'review.pdf', 'application/pdf'),
      ],
    },
  ] as unknown as File[]

  it('lists the published fields of each review in creation order', () => {
    const metadata = reviewsToMetadata(
      '_reviews',
      reviewManuscript,
      [
        review('r2', '2026-02-01', { comment: '<p>Second</p>', note: 'no' }),
        review('r1', '2026-01-01', {
          comment: '<p>First</p>',
          $verdict: 'accept',
          note: 'Ticked',
          private: 'secret',
          discussion: 'd1',
          attachments: ['rf1'],
        }),
      ],
      reviewFields,
      files,
    )

    expect(metadata).toEqual([
      { path: '_reviews.0.comment', value: '<p>First</p>', html: true },
      { path: '_reviews.0.note', value: 'Ticked' },
      {
        path: '_reviews.0.attachments',
        files: [{ id: 'rf1', name: 'review.pdf', mimetype: 'application/pdf' }],
      },
      { path: '_reviews.0.verdict', value: 'accept' },
      { path: '_reviews.1.comment', value: '<p>Second</p>', html: true },
    ])
  })

  it('leaves out reviews with nothing published, without leaving gaps', () => {
    const metadata = reviewsToMetadata(
      '_decisions',
      reviewManuscript,
      [
        review('r3', '2026-01-01', { private: 'secret' }),
        review('r4', '2026-02-01', { comment: '<p>Decision</p>' }),
      ],
      reviewFields,
      [],
    )

    expect(metadata).toEqual([
      { path: '_decisions.0.comment', value: '<p>Decision</p>', html: true },
    ])
  })
})

describe('oxaSourceToManuscript', () => {
  const fields = formFields(
    { name: 'submission.$title', component: 'TextField' },
    { name: 'submission.$doi', component: 'TextField' },
    { name: 'submission.doi', component: 'TextField' },
    { name: 'submission.summary', component: 'AbstractEditor' },
    { name: 'submission.funder', component: 'TextField' },
    { name: 'submission.discussion', component: 'ThreadedDiscussion' },
    { name: 'submission.attachments', component: 'SupplementaryFiles' },
    { name: 'submission.$volumeNumber', component: 'TextField' },
  )

  it('maps metadata back to the form fields it came from', () => {
    expect(
      oxaSourceToManuscript(
        {
          body: '<p class="paragraph">Body</p>',
          title: '<p class="paragraph">A <em>title</em></p>',
          metadata: [
            { path: 'doi', value: '10.1000/xyz' },
            {
              path: 'summary',
              value: '<p class="paragraph">S</p>',
              html: true,
            },
            { path: 'volumeNumber', value: '4' },
            { path: 'unknown', value: 'lost' },
            { path: 'discussion', value: [{ id: 'd1' }] },
            { path: 'attachments', value: [{ name: 'a.csv' }] },
          ],
        },
        fields,
      ),
    ).toEqual({
      meta: { source: '<p class="paragraph">Body</p>' },
      submission: {
        $title: 'A title',
        $doi: '10.1000/xyz',
        $volumeNumber: '4',
        summary: '<p class="paragraph">S</p>',
      },
    })
  })

  it('keeps HTML values only for HTML fields', () => {
    expect(
      oxaSourceToManuscript(
        {
          body: '',
          metadata: [
            { path: 'summary', value: 'plain' },
            {
              path: 'funder',
              value: '<p class="paragraph">NSF</p>',
              html: true,
            },
          ],
        },
        fields,
      ).submission,
    ).toEqual({})
  })

  it('keeps the title HTML for an HTML title field', () => {
    expect(
      oxaSourceToManuscript(
        { body: '', title: '<p class="paragraph">A <em>title</em></p>' },
        formFields({ name: 'submission.$title', component: 'FullWaxField' }),
      ).submission,
    ).toEqual({ $title: '<p class="paragraph">A <em>title</em></p>' })
  })

  it('round-trips with manuscriptToOxaSource', () => {
    const published = formFields(
      always('submission.$title', { component: 'TextField' }),
      always('submission.$doi', { component: 'TextField' }),
      always('submission.$authors', { component: 'AuthorsInput' }),
      always('submission.summary', { component: 'AbstractEditor' }),
    )

    const document = new OxaExporter({ fileUrl: (): string => '' }).toOxa(
      manuscriptToOxaSource(manuscript, published),
    )

    const source = new OxaImporter({}).fromOxa(document)

    expect(oxaSourceToManuscript(source, published).submission).toEqual({
      $title: 'Title',
      $doi: '10.1000/xyz',
      $authors: [{ firstName: 'Jane', lastName: 'Doe' }],
      summary: '<p class="paragraph">Summary</p>',
    })
  })
})

describe('manuscriptToOxa', () => {
  beforeAll(async () => {
    await config.init()
    db.init()
    await migrationManager.migrate()
  })

  beforeEach(async () => {
    await DbTestUtils.clearDb()
  })

  afterAll(async () => {
    await DbTestUtils.clearDb()
  })

  it('returns nothing for unknown or unpublished manuscripts', async () => {
    const group = await Group.insert({})

    const unpublished = await Manuscript.insert({
      groupId: group.id,
      meta: {},
    })

    expect(await manuscriptToOxa('not-a-uuid')).toBeNull()
    expect(await manuscriptToOxa(group.id)).toBeNull()
    expect(await manuscriptToOxa(unpublished.id)).toBeNull()
  })

  const insertForm = async (
    groupId: string,
    category: string,
    purpose: string,
    children: Form.FormField[],
  ): Promise<void> => {
    // @ts-ignore
    await Form.insert({
      groupId,
      purpose,
      category,
      structure: { name: category, children },
    })
  }

  it('converts a manuscript with its published reviews and decisions', async () => {
    const group = await Group.insert({})

    await insertForm(
      group.id,
      'submission',
      'submit',
      formFields(
        always('submission.$title', { component: 'TextField' }),
        always('submission.$volumeNumber', { component: 'TextField' }),
        always('submission.attachments', { component: 'SupplementaryFiles' }),
      ),
    )

    await insertForm(
      group.id,
      'review',
      'review',
      formFields(
        always('comment', { component: 'TextField' }),
        always('files', { component: 'SupplementaryFiles' }),
      ),
    )

    await insertForm(
      group.id,
      'decision',
      'decision',
      formFields(always('$verdict', { component: 'RadioGroup' })),
    )

    const inserted = await Manuscript.insert({
      groupId: group.id,
      status: 'published',
      published: new Date().toISOString(),
      meta: {},
      submission: { $title: 'Title', $volumeNumber: '4' },
    })

    const figure = await File.insert({
      name: 'figure.png',
      objectId: inserted.id,
      tags: ['manuscriptImage'],
      storedObjects: [storedObject('original', 'a.png', 'image/png')],
    } as Partial<File>)

    const attachment = await File.insert({
      name: 'data.csv',
      objectId: inserted.id,
      tags: ['supplementary'],
      storedObjects: [storedObject('original', 'data.csv', 'text/csv')],
    } as Partial<File>)

    await Manuscript.patchById(inserted.id, {
      meta: {
        source: `<p class="paragraph">Body</p><figure><img src="stale" data-fileid="${figure.id}"></figure>`,
      },
    })

    await Manuscript.createTeams(inserted.id)
    const reviewer = await User.insert({})
    const pending = await User.insert({})

    await Manuscript.assignRole(reviewer.id, inserted.id, 'reviewer', {
      status: 'completed',
    })

    await Manuscript.assignRole(pending.id, inserted.id, 'reviewer', {
      status: 'inProgress',
    })

    const completedReview = await Review.insert({
      manuscriptId: inserted.id,
      userId: reviewer.id,
      isDecision: false,
      jsonData: JSON.stringify({ comment: 'Looks good' }),
    })

    const reviewFile = await File.insert({
      name: 'review.pdf',
      objectId: completedReview.id,
      tags: ['review'],
      storedObjects: [
        storedObject('original', 'review.pdf', 'application/pdf'),
      ],
    } as Partial<File>)

    await Review.patchById(completedReview.id, {
      jsonData: JSON.stringify({
        comment: 'Looks good',
        files: [reviewFile.id],
      }),
    })

    await Review.insert({
      manuscriptId: inserted.id,
      userId: pending.id,
      isDecision: false,
      jsonData: JSON.stringify({ comment: 'Not finished' }),
    })

    await Review.insert({
      manuscriptId: inserted.id,
      isDecision: true,
      jsonData: JSON.stringify({ $verdict: 'accept' }),
    })

    const document = await manuscriptToOxa(inserted.id, {
      enableExperimental: false,
    })

    expect(document.title).toEqual([{ type: 'Text', value: 'Title' }])

    expect(document.data).toEqual({
      volumeNumber: '4',
      attachments: [
        {
          name: 'data.csv',
          url: `${serverUrl}/api/files/${attachment.id}`,
          encodingFormat: 'text/csv',
        },
      ],
      _reviews: [
        {
          comment: 'Looks good',
          files: [
            {
              name: 'review.pdf',
              url: `${serverUrl}/api/files/${reviewFile.id}`,
              encodingFormat: 'application/pdf',
            },
          ],
        },
      ],
      _decisions: [{ verdict: 'accept' }],
    })

    expect(document.children).toEqual([
      { type: 'Paragraph', children: [{ type: 'Text', value: 'Body' }] },
      {
        type: 'Image',
        url: `${serverUrl}/api/files/${figure.id}`,
        encodingFormat: 'image/png',
      },
    ])
  })
})
