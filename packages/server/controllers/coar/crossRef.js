const { uuid, logger } = require('@coko/server')
const axios = require('axios')
const { getRorOrganisation } = require('./utils')

const apiUrl = 'https://api.crossref.org/works/doi'

const getDataByDoi = async doi => {
  try {
    const response = await axios.get(`${apiUrl}/${doi}`, {})

    return response.data.message
    /* eslint-disable-next-line */
  } catch (error) {
    logger.error(`Resource not found in Crossref for DOI ${doi}`)
    return null
  }
}

const getPublishedDate = data => {
  const { assertion, published } = data
  const publishedDateData = data['published-online'] || published

  const [year, month, date] = publishedDateData
    ? publishedDateData['date-parts'][0].map(String)
    : []

  if (![year, month, date].length) {
    const publish = assertion.find(p => p.name === 'published')
    return publish?.value || ''
  }

  return `${date ? `${date}-` : ''}${month ? `${month}-` : ''}${
    year ? `${year}` : ''
  }`
}

const getTopics = data => {
  const subjects = data.subject
  const groupTitle = data['group-title']

  return subjects || [groupTitle]
}

const getJournal = data => {
  const { institution, publisher } = data
  return institution ? institution[0].name : publisher
}

const getAuthor = data => {
  const authors = data.author

  if (!authors || !Array.isArray(authors)) return ''

  const author = authors.find(a => a.sequence === 'first') ?? authors[0]

  return author ? `${author.family ?? ''}, ${author.given ?? ''}` : ''
}

const getAuthors = async data => {
  const { author } = data

  if (!author || !Array.isArray(author)) return []

  return Promise.all(
    author.map(async a => {
      const { affiliation, family, given, ORCID } = a

      const ror =
        (await Promise.all(
          affiliation?.map(async af => {
            const value = af.id[0]?.id ?? ''

            const label =
              value !== '' && af.name
                ? af.name
                : await getRorOrganisation(value)

            return { label, value }
          }),
        )) ?? []

      const orcid = ORCID?.match(/\d{4}-\d{4}-\d{4}-\d{3}[0-9X]\b/) ?? ''

      return {
        firstName: given,
        middleName: '',
        lastName: family,
        email: '',
        id: uuid(),
        ror,
        orcid,
      }
    }),
  )
}

const getCrossrefDataViaDoi = async doi => {
  const data = await getDataByDoi(doi)

  if (!data) return null

  const { title, abstract, resource } = data
  const publishedDate = getPublishedDate(data)
  const topics = getTopics(data)
  const journal = getJournal(data)
  const author = getAuthor(data)
  const $authors = await getAuthors(data)

  return {
    title: title[0],
    topics,
    publishedDate,
    abstract,
    journal,
    author,
    url: resource?.primary.URL,
    $authors,
    data,
  }
}

module.exports = {
  getCrossrefDataViaDoi,
  getDataByDoi,
}
