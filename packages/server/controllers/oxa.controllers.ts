import get from 'lodash/get'
import set from 'lodash/set'
import { File, uuidValidate } from '@coko/server'

import CollaborativeDoc from '../models/collaborative-doc/collaborativeDoc.model'
import type Form from '../models/form/form.model'
import Manuscript from '../models/manuscript/manuscript.model'
import type Review from '../models/review/review.model'
import OxaExporter from '../services/oxa/OxaExporter'
import OxaImporter from '../services/oxa/OxaImporter'
import {
  type OxaConverterOptions,
  type OxaSource,
  type OxaSourceFile,
  type OxaSourceMetadata,
} from '../services/oxa/OxaConverter'
import type { OxaDocument } from '../services/oxa/oxa.types'

import { bodyImageIds, htmlToText } from '../utils/htmlUtils'
import { filesForField, isFileField, publicFileUrl } from './file.controllers'
import { publishedFormFields } from './manuscript/manuscriptUtils'
import {
  getDecisionForm,
  getReviewFileIds,
  getReviewForm,
  getSubmissionForm,
  isReviewFileField,
  toFileIds,
} from './review.controllers'

const TITLE_FIELD = 'submission.$title'

const HTML_COMPONENTS = ['AbstractEditor', 'FullWaxField']

const UNSUPPORTED_COMPONENTS = ['ThreadedDiscussion']

const metadataPath = (name: string): string =>
  name.replace(/^submission\./, '').replace(/(^|\.)\$/g, '$1')

const isEmpty = (value: unknown): boolean =>
  value === undefined ||
  value === null ||
  value === '' ||
  (Array.isArray(value) && !value.length)

const originalMimetype = (file: File): string | undefined =>
  file.storedObjects?.find(storedObject => storedObject.type === 'original')
    ?.mimetype || undefined

const toSourceFile = (file: File): OxaSourceFile => ({
  id: file.id,
  name: file.name,
  mimetype: originalMimetype(file),
})

const fieldsToMetadata = (
  fields: Form.FormField[],
  valueOf: (field: Form.FormField) => unknown,
  filesOf: (field: Form.FormField) => File[] | null,
): OxaSourceMetadata[] =>
  fields
    .filter(field => !UNSUPPORTED_COMPONENTS.includes(field.component))
    .sort((a, b) => Number(a.name.includes('$')) - Number(b.name.includes('$')))
    .flatMap<OxaSourceMetadata>(field => {
      const path = metadataPath(field.name)
      const fieldFiles = filesOf(field)

      if (fieldFiles) {
        return fieldFiles.length
          ? [{ path, files: fieldFiles.map(toSourceFile) }]
          : []
      }

      const value = valueOf(field)
      if (isEmpty(value)) return []

      return [
        {
          path,
          value,
          ...(HTML_COMPONENTS.includes(field.component) ? { html: true } : {}),
        },
      ]
    })

export const manuscriptToOxaSource = (
  manuscript: Manuscript,
  formFields: Form.FormField[],
): OxaSource => {
  const fields: Form.FormField[] = publishedFormFields(manuscript, formFields)
  const files = (manuscript.files ?? []).filter(originalMimetype)

  const title = fields.find(
    field =>
      field.name === TITLE_FIELD && !isEmpty(get(manuscript, field.name)),
  )

  const imageIds = bodyImageIds(manuscript.meta?.source)

  return {
    body: manuscript.meta?.source,
    title: title ? get(manuscript, title.name) : undefined,
    metadata: fieldsToMetadata(
      fields.filter(field => field.name !== TITLE_FIELD),
      field => get(manuscript, field.name),
      field => (isFileField(field) ? filesForField(files, field) : null),
    ),
    files: files.filter(file => imageIds.includes(file.id)).map(toSourceFile),
  }
}

export const reviewsToMetadata = (
  key: string,
  manuscript: Manuscript,
  reviews: Review[],
  formFields: Form.FormField[],
  files: File[],
): OxaSourceMetadata[] => {
  const usableFiles = files.filter(originalMimetype)

  return [...reviews]
    .sort(
      (a, b) => new Date(a.created).getTime() - new Date(b.created).getTime(),
    )
    .map(review => {
      const data = review.jsonData ?? {}

      return fieldsToMetadata(
        publishedFormFields(manuscript, formFields, review.id),
        field => get(data, field.name),
        field =>
          isReviewFileField(field)
            ? usableFiles.filter(file =>
                toFileIds(get(data, field.name)).includes(file.id),
              )
            : null,
      )
    })
    .filter(entries => entries.length)
    .flatMap((entries, index) =>
      entries.map(entry => ({
        ...entry,
        path: `${key}.${index}.${entry.path}`,
      })),
    )
}

const loadReviewMetadata = async (
  key: string,
  manuscript: Manuscript,
  reviews: Review[],
  loadForm: (groupId: string) => Promise<Form>,
): Promise<OxaSourceMetadata[]> => {
  if (!reviews.length) return []

  const form = await loadForm(manuscript.groupId)

  const withCollaborativeData = await Promise.all(
    reviews.map(async review =>
      review.isCollaborative
        ? ({
            ...review,
            jsonData: {
              ...review.jsonData,
              ...(await CollaborativeDoc.getFormData(review.id, form)),
            },
          } as Review)
        : review,
    ),
  )

  const fileIds = withCollaborativeData.flatMap(review =>
    getReviewFileIds(review, form),
  )

  const files = fileIds.length
    ? await File.findByIds(fileIds, { throwIfNotFound: false })
    : []

  return reviewsToMetadata(
    key,
    manuscript,
    withCollaborativeData,
    form.getFields(),
    files,
  )
}

export const manuscriptToOxa = async (
  manuscriptId: string,
  options: OxaConverterOptions = {},
): Promise<OxaDocument | null> => {
  if (!uuidValidate(manuscriptId)) return null

  const manuscript = await Manuscript.findById(manuscriptId, {
    related: '[files]',
    throwIfNotFound: false,
  })

  // fetching file links would also get rejected if the manuscript is not published
  if (!manuscript?.published) return null

  const form = await getSubmissionForm(manuscript.groupId)
  const source = manuscriptToOxaSource(manuscript, form.getFields())

  const [reviews, decisions] = await Promise.all([
    Manuscript.getReviews(manuscript.id, ['completed']),
    Manuscript.getDecisions(manuscript.id),
  ])

  const [reviewMetadata, decisionMetadata] = await Promise.all([
    loadReviewMetadata('_reviews', manuscript, reviews, getReviewForm),
    loadReviewMetadata('_decisions', manuscript, decisions, getDecisionForm),
  ])

  source.metadata.push(...reviewMetadata, ...decisionMetadata)

  return new OxaExporter({ ...options, fileUrl: publicFileUrl }).toOxa(source)
}

export const oxaSourceToManuscript = (
  source: OxaSource,
  formFields: Form.FormField[],
): Pick<Manuscript, 'meta' | 'submission'> => {
  const entries = new Map(source.metadata?.map(entry => [entry.path, entry]))
  const paths = new Set<string>()
  const manuscript: Pick<Manuscript, 'meta' | 'submission'> = {
    meta: { source: source.body },
    submission: {},
  }

  formFields
    .filter(
      field =>
        !UNSUPPORTED_COMPONENTS.includes(field.component) &&
        !isFileField(field),
    )
    .sort((a, b) => Number(b.name.includes('$')) - Number(a.name.includes('$')))
    .forEach(field => {
      const isHtml = HTML_COMPONENTS.includes(field.component)

      if (field.name === TITLE_FIELD) {
        if (source.title)
          set(
            manuscript,
            field.name,
            isHtml ? source.title : htmlToText(source.title),
          )

        return
      }

      const path = metadataPath(field.name)
      if (paths.has(path)) return
      paths.add(path)

      const entry = entries.get(path)

      if (entry && 'value' in entry && Boolean(entry.html) === isHtml)
        set(manuscript, field.name, entry.value)
    })

  return manuscript
}

export const oxaToManuscript = async (
  document: OxaDocument,
  groupId: string,
  options: OxaConverterOptions = {},
): Promise<Pick<Manuscript, 'meta' | 'submission'>> => {
  const form = await getSubmissionForm(groupId)

  const source = new OxaImporter(options).fromOxa(document)

  return oxaSourceToManuscript(source, form.getFields())
}
