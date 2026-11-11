import { describe, it, expect } from 'vitest'

import type Manuscript from '../../../models/manuscript/manuscript.model'
import buildMetadata from '../metadata'
import type { OxaBlock } from '../oxa.types'

const manuscript = {
  doi: '10.1000/fallback',
  submission: {
    $doi: '10.1000/xyz',
    $authors: [
      {
        id: 'a1',
        firstName: 'Jane',
        middleName: 'Q',
        lastName: 'Doe',
        email: 'jane@example.com',
        affiliation: ' University A ',
        orcid: '0000-0001-2345-6789',
      },
      {
        id: 'a2',
        firstName: 'Ann',
        lastName: 'Lee',
        affiliation: 'University A',
      },
      { firstName: 'Bo', affiliation: 'University B' },
    ],
    dateReceived: '2026-01-01',
    dateAccepted: '2026-02-01',
    datePublished: '2026-03-01',
    volumeNumber: '4',
    issueNumber: '2',
  },
} as unknown as Manuscript

const abstract: OxaBlock[] = [
  { type: 'Paragraph', children: [{ type: 'Text', value: 'Abstract' }] },
]

describe('buildMetadata', () => {
  it('returns nothing when RFC and experimental are both off', () => {
    expect(buildMetadata(manuscript, {}, abstract)).toEqual({})
  })

  it('adds authors, affiliations and the DOI when RFC is on', () => {
    expect(buildMetadata(manuscript, { enableRFC: true }, abstract)).toEqual({
      authors: [
        {
          identifier: 'author-a1',
          name: 'Jane Q Doe',
          orcid: '0000-0001-2345-6789',
        },
        { identifier: 'author-a2', name: 'Ann Lee' },
        { identifier: 'author-3', name: 'Bo' },
      ],
      affiliations: [
        { identifier: 'aff-1', name: 'University A' },
        { identifier: 'aff-2', name: 'University B' },
      ],
      identifiers: { doi: '10.1000/xyz' },
    })
  })

  it('falls back to the manuscript DOI', () => {
    const withoutSubmissionDoi = {
      doi: '10.1000/fallback',
      submission: {},
    } as unknown as Manuscript

    expect(
      buildMetadata(withoutSubmissionDoi, { enableRFC: true }, []),
    ).toEqual({ identifiers: { doi: '10.1000/fallback' } })
  })

  it('adds name parts, email and affiliation links when experimental is also on', () => {
    const metadata = buildMetadata(
      manuscript,
      { enableRFC: true, enableExperimental: true },
      abstract,
    )

    expect((metadata.authors as unknown[])[0]).toEqual({
      identifier: 'author-a1',
      name: 'Jane Q Doe',
      orcid: '0000-0001-2345-6789',
      givenName: 'Jane',
      familyName: 'Doe',
      email: 'jane@example.com',
      affiliations: ['@aff-1'],
    })

    expect((metadata.authors as unknown[])[2]).toEqual({
      identifier: 'author-3',
      name: 'Bo',
      givenName: 'Bo',
      affiliations: ['@aff-2'],
    })
  })

  it('adds abstract, dates, volume and issue when experimental is on', () => {
    expect(
      buildMetadata(manuscript, { enableExperimental: true }, abstract),
    ).toEqual({
      abstract,
      dates: {
        received: '2026-01-01',
        accepted: '2026-02-01',
        published: '2026-03-01',
      },
      volume: '4',
      issue: '2',
    })
  })
})
