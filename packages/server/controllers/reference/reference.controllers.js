const { default: axios } = require('axios')

const { logger } = require('@coko/server')

const { Config } = require('../../models')

const {
  getFormattedReferencesFromCrossRef,
  getFormattedReferencesFromCrossRefDOI,
} = require('../../utils/crossrefCommsUtils')

const {
  getFormattedReferencesFromDatacite,
} = require('../../utils/dataciteCommusUtils')

const {
  createReference,
  formatCitation,
  formatMultipleCitations,
} = require('../../utils/reference')

axios.interceptors.request.use(req => {
  // logger.debug('Starting Request:', JSON.stringify(req, null, 2))
  return req
})

axios.interceptors.response.use(resp => {
  // logger.debug('Response:', JSON.stringify(resp.data, null, 2))
  return resp
})

// You know, it's probably bad to have two formatCitation functions!
const formatCitationFn = async (citation, groupId) => {
  try {
    const { result, citeHtml, error } = await formatCitation(
      JSON.parse(citation),
      groupId,
    )

    return { formattedCitation: result, citeHtml, error }
  } catch (error) {
    return { formattedCitation: '', citeHtml: '', error: error.message }
  }
}

const formatMultipleCitationsFn = async (input, groupId) => {
  try {
    const { result, calloutTexts, orderedReferenceIds, error } =
      await formatMultipleCitations(
        groupId,
        JSON.parse(input.references),
        JSON.parse(input.callouts),
      )

    return {
      orderedCitations: result,
      calloutTexts,
      orderedReferenceIds,
      error,
    }
  } catch (error) {
    return {
      orderedCitations: [],
      calloutTexts: [],
      orderedReferenceIds: [],
      error: error.message,
    }
  }
}

const getDataciteCslFromDOI = async (input, groupId) => {
  const activeConfig = await Config.query().findOne({
    groupId,
    active: true,
  })

  const crossrefRetrievalEmail =
    activeConfig.formData.production?.crossrefRetrievalEmail

  try {
    const matches = await getFormattedReferencesFromDatacite(
      input.text,
      groupId,
      false,
    )

    if (
      matches.length === 0 &&
      activeConfig.formData.production.fallbackOnCrossrefAfterDatacite
    ) {
      logger.error('Datacite timed out.')
      logger.error(
        'Trying CrossRef instead – note this may be imprecise!',
        input.text,
      )

      // NOTE: This will call CrossRef. HOWEVER: CrossRef always returns something! It could be wrong!
      const result = tryCrossref(input.text, crossrefRetrievalEmail, groupId)

      return result
    }

    const toReturn = {
      matches,
      success: Boolean(matches.length),
      message: matches.length ? '' : 'error',
    }

    return toReturn
  } catch (error) {
    logger.error('Datacite response error:', error.message)
    return { matches: [], success: false, message: 'error' }
  }
}

const getDataciteCslFromTitle = async (input, groupId) => {
  const activeConfig = await Config.query().findOne({
    groupId,
    active: true,
  })

  const crossrefRetrievalEmail =
    activeConfig.formData.production?.crossrefRetrievalEmail

  try {
    const matches = await getFormattedReferencesFromDatacite(
      input.text,
      groupId,
      true,
    )

    if (matches.length === 0) {
      logger.error('Datacite timed out.')
      logger.error('Trying CrossRef instead.', input.text)
      // TODO: at this point, query CrossRef with the DOI
      tryCrossref(input.text, crossrefRetrievalEmail)

      return { matches: [], success: false, message: 'error' }
    }

    return { matches, success: true, message: '' }
  } catch (error) {
    logger.error('Datacite response error:', error.message)
    return { matches: [], success: false, message: 'error' }
  }
}

// This returns a reference as CSL with a formatetedCitation property that includes the HTML version of the citation.
const getFormattedReferences = async (input, groupId) => {
  const activeConfig = await Config.query().findOne({
    groupId,
    active: true,
  })

  const crossrefRetrievalEmail =
    activeConfig.formData.production?.crossrefRetrievalEmail

  const crossrefSearchResultCount =
    activeConfig.formData.production?.crossrefSearchResultCount

  try {
    const matches = await getFormattedReferencesFromCrossRef(
      input.text,
      input.count || crossrefSearchResultCount || 3,
      crossrefRetrievalEmail,
      groupId,
    )

    if (matches.length === 0) {
      logger.error('Crossref timed out.')
      return { matches: [], success: false, message: 'error' }
    }

    return { matches, success: true, message: '' }
  } catch (error) {
    logger.error('Crossref response error:', error.message)
    return { matches: [], success: false, message: 'error' }
  }
}

// This function just returns a reference as CSL.
const getMatchingReferences = async (input, groupId) => {
  const activeConfig = await Config.query().findOne({
    groupId,
    active: true,
  })

  const crossrefRetrievalEmail =
    activeConfig.formData.production?.crossrefRetrievalEmail

  const crossrefSearchResultCount =
    activeConfig.formData.production?.crossrefSearchResultCount

  try {
    const matches = await getMatchingReferencesFromCrossRef(
      input.text,
      input.count || crossrefSearchResultCount || 3,
      crossrefRetrievalEmail,
    )

    if (matches.length === 0) {
      logger.error('Crossref timed out.')
      return { matches: [], success: false, message: 'error' }
    }

    return { matches, success: true, message: '' }
  } catch (error) {
    logger.error('Citeproc response error:', error.message)
    return { matches: [], success: false, message: 'error' }
  }
}

const getMatchingReferencesFromCrossRef = async (
  reference,
  count,
  crossrefRetrievalEmail,
) => {
  return axios
    .get('https://api.crossref.org/v1/works', {
      params: {
        'query.bibliographic': reference,
        rows: count,
        select: 'DOI,author,issue,page,title,volume,container-title',
        mailto: crossrefRetrievalEmail,
      },
      timeout: 15000,
      headers: {
        'User-Agent': `Kotahi (Axios 0.21; mailto:${crossrefRetrievalEmail})`,
      },
    })
    .then(response => {
      return response.data.message.items.reduce((accumulator, current) => {
        accumulator.push(createReference(current))
        return accumulator
      }, [])
    })
    .catch(e => {
      logger.error('Crossref failure!', e.message)
      return []
    })
}

// This looks up a citation based on the DOI. Not exposed in the frontend yet.
const getReferenceFromDoi = async (doi, groupId) => {
  const activeConfig = await Config.query().findOne({
    groupId,
    active: true,
  })

  const crossrefRetrievalEmail =
    activeConfig.formData.production?.crossrefRetrievalEmail

  try {
    const reference = await getReferenceWithDoi(doi, crossrefRetrievalEmail)

    return { reference, success: true, message: '' }
  } catch (error) {
    logger.error('Crossref response error for DOI lookup:', error.message)
    return { reference: {}, success: false, message: 'error' }
  }
}

const getReferenceWithDoi = async (doi, crossrefRetrievalEmail) => {
  return axios
    .get(`https://api.crossref.org/v1/works/${doi}`, {
      params: {
        mailto: crossrefRetrievalEmail,
      },
      timeout: 15000,
      headers: {
        'User-Agent': `Kotahi (Axios 0.21; mailto:${crossrefRetrievalEmail})`,
      },
    })
    .then(response => {
      return createReference(response.data.message)
    })
}

const tryCrossref = async (doi, crossrefRetrievalEmail, groupId) => {
  try {
    const matches = await await getFormattedReferencesFromCrossRefDOI(
      doi,
      crossrefRetrievalEmail,
      groupId,
    )

    if (matches.length === 0) {
      logger.error('Crossref timed out.')
      return { matches: [], success: false, message: 'error' }
    }

    return { matches, success: true, message: 'crossref' }
  } catch (error) {
    logger.error('Crossref response error:', error.message)
    return { matches: [], success: false, message: 'error' }
  }
}

module.exports = {
  formatCitationFn,
  formatMultipleCitationsFn,
  getDataciteCslFromDOI,
  getDataciteCslFromTitle,
  getFormattedReferences,
  getMatchingReferences,
  getMatchingReferencesFromCrossRef,
  getReferenceFromDoi,
  getReferenceWithDoi,
}
