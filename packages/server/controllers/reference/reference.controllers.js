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
  formatCitation,
  formatMultipleCitations,
} = require('../../utils/reference')

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
  const activeConfig = await Config.findOne({
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
      logger.error('Datacite had an error or timed out.')
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

// This returns a reference as CSL with a formatetedCitation property that includes the HTML version of the citation.
const getFormattedReferences = async (input, groupId) => {
  const activeConfig = await Config.findOne({
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
  getFormattedReferences,
}
