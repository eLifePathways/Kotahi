const { default: axios } = require('axios')
const rateLimit = require('axios-rate-limit')
const { logger } = require('@coko/server')

const { createFormattedReference } = require('./reference')

const http = rateLimit(axios.create(), {
  maxRequests: 10,
  perMilliseconds: 1000,
})

const apiUrl = 'https://api.crossref.org/v1/works/'
const defaultMailTo = 'unknown@unknown.com'

/** Pass the response of every CrossRef API call to this function to ensure rate limits are updated */
const updateRateLimit = response => {
  const maxRequests = parseInt(
    response.headers['x-rate-limit-limit'] ?? '0',
    10,
  )

  const perMilliseconds =
    parseInt(response.headers['x-rate-limit-interval'] ?? '0', 10) * 1000

  if (maxRequests && perMilliseconds)
    http.setRateLimitOptions({
      maxRequests,
      // We're slowing down further by a small arbitrary factor, as CrossRef sometimes gives
      // HTTP 429 errors if we go at the speed it nominates.
      perMilliseconds: perMilliseconds * 1.1,
    })
}

// Note that unlike CrossRef, DataCite doesn't impose rate limits, though their firewall
// imposes a hard limit of around 10 queries/sec from a single IP address.
const getUrlByDoiFromDataCite = async doi => {
  try {
    const response = await axios.get(`https://doi.org/api/handles/${doi}`)

    if (response.status === 200) {
      const url = response.data?.values?.[0]?.data?.value
      // Check if the URL exists in the response
      if (url) return url
      // eslint-disable-next-line no-console
      console.log(`No URL found for DOI ${doi} in DataCite response.`)
      return null
    }

    logger.error(
      `Failed to retrieve URL for DOI ${doi} from DataCite: ${response.statusText}`,
    )
    return null
  } catch (error) {
    if (error.response.status === 404)
      // eslint-disable-next-line no-console
      console.log(`Unknown DOI ${doi}. DataCite cannot return URL for this.`)
    else
      logger.error(
        `Failed to retrieve URL from DataCite for DOI ${doi}: ${error}`,
      )
    return null
  }
}

const getCrossRefCitationFromDoi = async (doi, contactEmail) => {
  const mailTo = contactEmail ?? defaultMailTo

  try {
    const response = await http.get(`${apiUrl}${doi}`, {
      params: {
        mailto: mailTo,
      },
      headers: {
        'User-Agent': `Kotahi (Axios 0.21; mailto:${mailTo})`,
      },
    })

    updateRateLimit(response)

    if (response.status === 200) {
      // console.log(
      //   '\n\n\n\nComing back from CrossRef: ',
      //   response?.data?.message?.items?.[0],
      // )
      return response.data.message?.resource?.primary?.URL
    }

    logger.error(
      `Could not retrieve citation from CrossRef for DOI ${doi}: ${response.statusText}`,
    )
    return null
  } catch (error) {
    // if (error.response?.status === 404) {
    // }

    // if (error.response?.status === 429) {
    // }

    logger.error(
      `Failed to retrieve URL from CrossRef for DOI ${doi}: ${error}`,
    )
    return null
  }
}

/** Get the target URL that a DOI resolves to. This attempts to obtain it from CrossRef first (observing rate limiting),
 * and failing that, from DataCite.
 * @param contactEmail An email address to supply in the header to CrossRef in case they need to contact about rate limiting etc.
 */
const getUrlByDoi = async (doi, contactEmail) => {
  const mailTo = contactEmail ?? defaultMailTo

  try {
    const response = await http.get(`${apiUrl}${doi}`, {
      params: {
        mailto: mailTo,
      },
      headers: {
        'User-Agent': `Kotahi (Axios 0.21; mailto:${mailTo})`,
      },
    })

    updateRateLimit(response)

    if (response.status === 200)
      return response.data.message?.resource?.primary?.URL

    logger.error(
      `Could not retrieve URL for DOI ${doi}: ${response.statusText}`,
    )
    return null
  } catch (error) {
    if (error.response?.status === 404) {
      // DataCite appears to be capable of retrieving URLs for all agencies, though it's slower than CrossRef.
      // If we have trouble with DataCite, we can determine the agency as follows and then use that agency's API:
      //
      // const agencyResponse = await http.get(`${apiUrl}${doi}/agency`)
      // updateRateLimit(agencyResponse)
      // const agency = agencyResponse.data?.message?.agency?.id

      return getUrlByDoiFromDataCite(doi)
    }

    if (error.response?.status === 429) {
      // TODO Consider implementing a backoff
      return getUrlByDoiFromDataCite(doi) // Get from alternative service that's generally slower, but shouldn't give 429 error
    }

    logger.error(
      `Failed to retrieve URL from CrossRef for DOI ${doi}: ${error}`,
    )
    return null
  }
}

const getFormattedReferencesFromCrossRef = async (
  reference,
  count,
  crossrefRetrievalEmail,
  groupId,
) => {
  const params = {
    'query.bibliographic': reference,
    rows: count,
    select: 'DOI,author,issue,page,title,volume,container-title,issued',
    order: 'desc',
    sort: 'score',
  }

  if (crossrefRetrievalEmail) {
    params.mailto = crossrefRetrievalEmail
  } else {
    logger.error(
      'No Crossref retrieval email. If this isn’t set in the config, we may run into problems with rate limiting.',
    )
  }

  try {
    const response = await http.get('https://api.crossref.org/v1/works', {
      params,
      timeout: 15000,
      headers: {
        'User-Agent': `Kotahi (Axios 0.21${
          crossrefRetrievalEmail ? `; mailto:${crossrefRetrievalEmail}` : ''
        })`,
      },
    })

    updateRateLimit(response)

    if (response.status === 200)
      return response.data.message.items.reduce((accumulator, current) => {
        accumulator.push(createFormattedReference(current, groupId, false))
        return accumulator
      }, [])

    logger.error('Crossref failure!', response)
    return []
  } catch (error) {
    if (error.response?.status === 404) {
      logger.error('Crossref 404 error!')
    }

    if (error.response?.status === 429) {
      // TODO Consider implementing a backoff
      // return getUrlByDoiFromDataCite(doi) // Get from alternative service that's generally slower, but shouldn't give 429 error
      logger.error('Crossref rate limit error!!!')
    }

    logger.error('Crossref failure!', error.message)
    return []
  }
}

const getFormattedReferencesFromCrossRefDOI = async (
  doi,
  crossrefRetrievalEmail,
  groupId,
) => {
  const params = {
    'query.bibliographic': doi,
    rows: 1,
    select: 'DOI,author,issue,page,title,volume,container-title,issued',
    order: 'desc',
    sort: 'score',
  }

  if (crossrefRetrievalEmail) {
    params.mailto = crossrefRetrievalEmail
  } else {
    logger.error(
      'No Crossref retrieval email. If this isn’t set in the config, we may run into problems with rate limiting.',
    )
  }

  try {
    const response = await http.get('https://api.crossref.org/v1/works', {
      params,
      timeout: 15000,
      headers: {
        'User-Agent': `Kotahi (Axios 0.21${
          crossrefRetrievalEmail ? `; mailto:${crossrefRetrievalEmail}` : ''
        })`,
      },
    })

    updateRateLimit(response)

    if (response.status === 200)
      return response.data.message.items.reduce((accumulator, current) => {
        accumulator.push(createFormattedReference(current, groupId, false))
        return accumulator
      }, [])

    logger.error('Crossref failure!', response)
    return []
  } catch (error) {
    if (error.response?.status === 404) {
      logger.error('Crossref 404 error!')
    }

    if (error.response?.status === 429) {
      // TODO Consider implementing a backoff
      // return getUrlByDoiFromDataCite(doi) // Get from alternative service that's generally slower, but shouldn't give 429 error
      logger.error('Crossref rate limit error!!!')
    }

    logger.error('Crossref failure!', error.message)
    return []
  }
}

module.exports = {
  getUrlByDoi,
  getFormattedReferencesFromCrossRef,
  getCrossRefCitationFromDoi,
  getFormattedReferencesFromCrossRefDOI,
}
