import type Manuscript from '../../models/manuscript/manuscript.model'

import type { OxaConverterOptions } from './OxaConverter'
import type { OxaBlock } from './oxa.types'

type Affiliation = { identifier: string; name: string }

type SubmissionAuthor = {
  id?: string
  firstName?: string
  middleName?: string
  lastName?: string
  email?: string
  affiliation?: string
  orcid?: string
}

const getAffiliations = (manuscript: Manuscript): Affiliation[] => {
  const authors: SubmissionAuthor[] = manuscript.submission?.$authors ?? []

  const names = [
    ...new Set<string>(
      authors.map(author => author.affiliation?.trim()).filter(Boolean),
    ),
  ]

  return names.map((name, index) => ({
    identifier: `aff-${index + 1}`,
    name,
  }))
}

// Experimental: RFC0006 does not define author name parts, email or affiliation links
const experimentalAuthorFields = (
  author: SubmissionAuthor,
  affiliations: Affiliation[],
): Record<string, unknown> => {
  const affiliation = affiliations.find(
    a => a.name === author.affiliation?.trim(),
  )

  return {
    ...(author.firstName ? { givenName: author.firstName } : {}),
    ...(author.lastName ? { familyName: author.lastName } : {}),
    ...(author.email ? { email: author.email } : {}),
    ...(affiliation ? { affiliations: [`@${affiliation.identifier}`] } : {}),
  }
}

// RFC: Modular Metadata (RFC0006) - authors, affiliations, identifiers
const rfcMetadata = (
  manuscript: Manuscript,
  options: OxaConverterOptions,
): Record<string, unknown> => {
  const metadata: Record<string, unknown> = {}
  const authors: SubmissionAuthor[] = manuscript.submission?.$authors ?? []
  const affiliations = getAffiliations(manuscript)

  if (authors.length) {
    metadata.authors = authors.map((author, index: number) => ({
      identifier: `author-${author.id || index + 1}`,
      name: [author.firstName, author.middleName, author.lastName]
        .filter(Boolean)
        .join(' '),
      ...(author.orcid ? { orcid: author.orcid } : {}),
      ...(options.enableExperimental
        ? experimentalAuthorFields(author, affiliations)
        : {}),
    }))
  }

  if (affiliations.length) metadata.affiliations = affiliations

  const doi = manuscript.submission?.$doi || manuscript.doi
  if (doi) metadata.identifiers = { doi }

  return metadata
}

// Experimental: RFC0006 does not define abstract, funding shape, dates, volume or issue
const experimentalMetadata = (
  manuscript: Manuscript,
  abstract: OxaBlock[],
): Record<string, unknown> => {
  const submission = manuscript.submission ?? {}
  const metadata: Record<string, unknown> = {}

  if (abstract.length) metadata.abstract = abstract

  const dates = {
    ...(submission.dateReceived ? { received: submission.dateReceived } : {}),
    ...(submission.dateAccepted ? { accepted: submission.dateAccepted } : {}),
    ...(submission.datePublished
      ? { published: submission.datePublished }
      : {}),
  }

  if (Object.keys(dates).length) metadata.dates = dates
  if (submission.volumeNumber) metadata.volume = submission.volumeNumber
  if (submission.issueNumber) metadata.issue = submission.issueNumber

  return metadata
}

const buildMetadata = (
  manuscript: Manuscript,
  options: OxaConverterOptions,
  abstract: OxaBlock[],
): Record<string, unknown> => ({
  ...(options.enableRFC ? rfcMetadata(manuscript, options) : {}),
  ...(options.enableExperimental
    ? experimentalMetadata(manuscript, abstract)
    : {}),
})

export default buildMetadata
