const { default: axios } = require('axios')
const he = require('he')
const { logger } = require('@coko/server')

const { createFormattedReference } = require('./reference')

// Query: is it possible that the DOI is coming in with escape characters or something that is causing the Datacite API to not find it?

const getFormattedReferencesFromDatacite = async (
  doi,
  groupId,
  useTitle = false,
) => {
  if (useTitle) {
    try {
      // e.g. https://api.datacite.org/dois?query=titles.title:%22DataCite%20Connections:%20A%20Case%20Study%22
      const response = await axios.get(
        `https://api.datacite.org/dois?query=titles.title:%22${he.encode(
          doi,
        )}%22`,
        // `https://data.crosscite.org/application/vnd.citationstyles.csl+json/${doi}`,
      )

      if (response.status === 200) {
        // console.log('Response: ', response.data)

        const formatted = await createFormattedReference(
          response.data,
          groupId,
          true,
        )

        // console.log('Formatted: ', formatted)
        return [formatted]
      }

      logger.error('Datacite failure!', response)
      return []
    } catch (error) {
      if (error.response?.status === 404) {
        logger.error(`Datacite 404 error: DOI ${doi} not found at Datacite.`)
      }

      if (error.response?.status === 429) {
        // TODO Consider implementing a backoff
        logger.error('Datacite rate limit error!')
      }

      logger.error('Datacite failure!', error.message)
      return []
    }
  } else {
    try {
      const response = await axios.get(
        `https://api.datacite.org/application/vnd.citationstyles.csl+json/${doi}`,
        // `https://data.crosscite.org/application/vnd.citationstyles.csl+json/${doi}`,
      )

      if (response.status === 200) {
        // console.log('Response: ', response.data)

        const formatted = await createFormattedReference(
          response.data,
          groupId,
          true,
        )

        // console.log('Formatted: ', formatted)
        return [formatted]
      }

      logger.error('Datacite failure!', response)
      return []
    } catch (error) {
      if (error.response?.status === 404) {
        logger.error(`Datacite 404 error: DOI ${doi} not found at Datacite.`)
      }

      if (error.response?.status === 429) {
        // TODO Consider implementing a backoff
        logger.error('Datacite rate limit error!')
      }

      logger.error('Datacite failure!', error.message)
      return []
    }
  }
}

module.exports = { getFormattedReferencesFromDatacite }
