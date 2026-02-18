const { logger, uuid } = require('@coko/server')
const axios = require('axios')

const apiUrl = 'https://api.datacite.org/dois'

const allowedAuthorContributorTypes = [
  'ContactPerson',
  'DataCollector',
  'DataCurator',
  'ProjectLeader',
  'ProjectManager',
  'ProjectMember',
  'RelatedPerson',
  'Researcher',
  'RightsHolder',
]

const getDataByDoi = async doi => {
  try {
    const response = await axios.get(`${apiUrl}/${doi}`, {})

    return response.data.data.attributes
  } catch (error) {
    logger.error(`Resource not found in DataCite eefor DOI ${doi}`)
    return null
  }
}

const getTitle = titles => {
  const titleObj = titles[0]

  return titleObj?.title || ''
}

const getSubjects = subjects => subjects.map(s => s.subject)

const getPublishedDate = (dates, publicationYear) => {
  const dateObj = dates.find(d => d.dateType === 'Issued')

  if (dateObj) return dateObj.date

  if (publicationYear) return parseInt(publicationYear, 10)

  return ''
}

const getPublisher = publisher => {
  if (!publisher) return ''

  if (typeof publisher === 'string') return publisher

  return publisher.name
}

const getFirstAuthor = data => {
  const { contributors, creators } = data
  const creator = creators.find(c => c.nameType === 'Personal')

  if (creator) return creator.name

  const contactPerson = contributors.find(
    c => c.nameType === 'Personal' && c.contributorType === 'ContactPerson',
  )

  if (contactPerson) return contactPerson.name

  const contributor = creators.find(
    c =>
      c.nameType === 'Personal' &&
      allowedAuthorContributorTypes.includes(c.contributorType),
  )

  return contributor?.name || ''
}

const getAuthors = contributors => {
  return contributors
    .filter(
      c =>
        c.nameType === 'Personal' &&
        allowedAuthorContributorTypes.includes(c.contributorType),
    )
    .map(c => {
      const ror =
        c.affiliation
          ?.find(
            a =>
              typeof a === 'object' && a.affiliationIdentifierScheme === 'ROR',
          )
          ?.map(a => ({ label: a.name, value: a.affiliationIdentifier })) ?? []

      const orcid =
        c.nameIdentifiers
          ?.find(
            n => typeof n === 'object' && n.nameIdentifierScheme === 'ORCID',
          )
          ?.nameIdentifier.match(/\d{4}-\d{4}-\d{4}-\d{3}[0-9X]\b/) ?? ''

      return {
        firstName: c.givenName,
        middleName: '',
        lastName: c.familyName,
        email: '',
        id: uuid(),
        ror,
        orcid,
      }
    })
}

const getUrl = contentUrl => {
  if (!contentUrl) {
    return ''
  }

  return Array.isArray(contentUrl) ? contentUrl[0] : contentUrl
}

const getDataciteViaDoi = async doi => {
  const data = await getDataByDoi(doi)

  if (!data) return null

  const {
    contentUrl,
    contributors = [],
    dates = [],
    publicationYear,
    publisher,
    subjects = [],
    titles = [],
  } = data

  const title = getTitle(titles ?? [])
  const topics = getSubjects(subjects)
  const publishedDate = getPublishedDate(dates, publicationYear)
  const journal = getPublisher(publisher)
  const author = getFirstAuthor(data)
  const $authors = getAuthors(contributors)
  const url = getUrl(contentUrl)

  return {
    title,
    topics,
    publishedDate,
    // abstract,
    journal,
    author,
    url,
    $authors,
  }
}

module.exports = { getDataciteViaDoi }
