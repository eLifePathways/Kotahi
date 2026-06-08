const cheerio = require('cheerio')
const htmlToJats = require('../../jatsexport/htmlToJats')
const { objIf, safeParse } = require('../../../utils/objectUtils')

const { CITATION_SELECTOR, CITATION_DATA_STRUCTURE } = require('./constants')

const calculateDataciteCitations = text => {
  const $ = cheerio.load(text)
  const citations = $(CITATION_SELECTOR)
  const citationDois = []
  citations.each((_, citation) => {
    const { doi } = safeParse($(citation).attr(CITATION_DATA_STRUCTURE))

    if (doi) {
      citationDois.push({
        relatedIdentifierType: 'DOI',
        relationType: 'IsCitedBy',
        relatedIdentifier: doi,
      })
    }
  })

  return citationDois
}

const getPublisher = formData => {
  const { rorUrl, title } = formData.groupIdentity

  const publisher = {
    name: title,
    ...objIf(rorUrl, {
      publisherIdentifier: rorUrl,
      schemeUri: 'https://ror.org',
      publisherIdentifierScheme: 'ROR',
    }),
  }

  return publisher
}

const getContributor = author => {
  const { ror: affiliation, orcid, firstName, lastName } = author
  if (!firstName || !lastName)
    throw new Error(`Incomplete author record ${JSON.stringify(author)}`)

  const affiliations = (
    Array.isArray(affiliation) ? [...affiliation] : [affiliation]
  ).filter(a => a?.value?.includes('ror.org'))

  const contributor = {
    nameType: 'Personal',
    givenName: firstName,
    familyName: lastName,
    ...objIf(orcid, {
      nameIdentifiers: [
        {
          nameIdentifierScheme: 'ORCID',
          schemeUri: 'https://orcid.org',
          nameIdentifier: orcid,
        },
      ],
    }),
    affiliation: affiliations.length
      ? affiliations.map(a => ({
          affiliationIdentifier: a.value,
          affiliationIdentifierScheme: 'ROR',
          schemeUri: 'https://ror.org',
          name: a.label,
        }))
      : [],
  }

  return contributor
}

const getContributors = formData => {
  const { title: name, rorUrl } = formData.groupIdentity

  const contributor = {
    contributorType: 'Sponsor',
    name,
    nameType: 'Organizational',
    affiliation: [
      {
        name,
        ...objIf(rorUrl, {
          affiliationIdentifierScheme: 'ROR',
          schemeUri: 'https://ror.org',
          affiliationIdentifier: rorUrl,
        }),
      },
    ],
  }

  return [contributor]
}

const getRightsList = localContext => {
  if (!localContext) return []

  const notices =
    localContext.notice?.map(n => ({
      rightsUri: localContext.url,
      rightsIdentifier: n.noticeType,
      rightsIdentifierScheme: 'Local Contexts',
      schemeUri: 'https://localcontexts.org/',
      rights: n.defaultText,
    })) || []

  const labels =
    localContext.label?.map(l => ({
      rightsUri: localContext.url,
      rightsIdentifier: l.identifier,
      rightsIdentifierScheme: 'Local Contexts',
      schemeUri: 'https://localcontexts.org/',
      rights: l.labelText,
    })) || []

  return notices.concat(labels)
}

const getFundingReferences = submission => {
  const { funderIdentifierType, Funding, awardnumber, awardtitle, awarduri } =
    submission

  return Funding
    ? [
        {
          funderName: Funding,
          funderIdentifierType,
          funderIdentifier: Funding,
          awardNumber: awardnumber || null,
          awardTitle: awardtitle || null,
          awardUri: awarduri || null,
        },
      ]
    : []
}

const getDescriptions = $abstract => {
  return $abstract
    ? [
        {
          descriptionType: 'Abstract',
          description: htmlToJats($abstract),
        },
      ]
    : []
}

const getRelatedIdentifiers = (meta, $dois) => {
  const citationDois = meta.source
    ? calculateDataciteCitations(meta.source)
    : []

  const relatedDois = getRelatedDois($dois)
  return [...citationDois, ...relatedDois]
}

const getRelatedDois = dois => {
  const doiUrl = 'https://doi.org/'
  return dois
    ? dois
        .filter(({ doi }) => doi !== '')
        .map(({ doi }) => ({
          relatedIdentifierType: 'DOI',
          relationType: 'HasPart',
          relatedIdentifier: doi.startsWith(doiUrl)
            ? doi.substring(doiUrl.length)
            : doi,
        }))
    : []
}

const getDates = (issueYear, publishDate) => {
  return [
    { dateType: 'Issued', date: issueYear },
    { dateType: 'Accepted', date: publishDate.toISOString() },
  ]
}

// eslint-disable-next-line no-unused-vars
const getRelatedItems = (submission, formData) => {
  const {
    groupIdentity: { journalName, journalAbbreviatedName },
  } = formData

  const relatedItems = []

  if (submission.$volumeNumber || submission.$issueNumber) {
    relatedItems.push({
      relatedItemType: 'Collection',
      relationType: 'IsPublishedIn',
      volume: submission.$volumeNumber,
      issue: submission.$issueNumber,
    })
  }

  if (journalName || journalAbbreviatedName) {
    const titles = []

    if (journalName) {
      titles.push({
        title: journalName,
      })
    }

    if (journalAbbreviatedName) {
      titles.push({
        title: journalAbbreviatedName,
        titleType: 'Subtitle',
      })
    }

    relatedItems.push({
      relatedItemType: 'Journal',
      relationType: 'IsPublishedIn',
      titles,
    })
  }

  return relatedItems
}

module.exports = {
  getDates,
  getContributor,
  getPublisher,
  getContributors,
  getDescriptions,
  getRightsList,
  getFundingReferences,
  getRelatedIdentifiers,
}
