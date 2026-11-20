import { useCallback } from 'react'

import {
  GET_ANYSTYLE_CSL,
  GET_CROSSREF,
  GET_DATACITE,
  GET_CITE_PROC,
  GET_CALLOUT_TEXT,
} from '../../../queries'

const useCitationApi = client => {
  const updateAnystyle = useCallback(
    async text => {
      const { content } = text

      // console.log('Coming in for Anystyle: ', content)
      return client
        .query({
          query: GET_ANYSTYLE_CSL,
          variables: {
            textReferences: content,
          },
          fetchPolicy: 'network-only',
        })
        .then(result => {
          // console.log('Result:', result)

          if (
            result?.data?.buildCitationsCSL?.cslReferences &&
            !result?.data?.buildCitationsCSL?.error
          ) {
            // console.log(
            //   'Coming back from Anystyle CSL: ',
            //   result.data.buildCitationsCSL.cslReferences,
            // )
            return result.data.buildCitationsCSL.cslReferences
          }

          console.error(
            'Server-side error: ',
            result.data.buildCitationsCSL.error,
          )
          return content
        })
    },
    [client],
  )

  const updateCrossRef = useCallback(
    async (text, useDatacite = false) => {
      // console.log('Coming in for CrossRef: ', text)
      // console.log('use DataCite: ', useDatacite)
      return text
        ? client
            .query({
              query: useDatacite ? GET_DATACITE : GET_CROSSREF,
              variables: {
                input: {
                  text,
                  // count, // We could have this in there if we wanted more results to override the default
                },
              },
              fetchPolicy: 'network-only',
            })
            .then(result => {
              // eslint-disable-next-line no-console
              console.log('Result:', result)

              if (
                result?.data?.getFormattedReferences?.success &&
                result.data.getFormattedReferences.matches &&
                result.data.getFormattedReferences.matches.length
              ) {
                // This returns an array of CSL
                return result.data.getFormattedReferences.matches
              }

              if (
                result?.data?.getDataciteCslFromDOI?.success &&
                result.data.getDataciteCslFromDOI.matches &&
                result.data.getDataciteCslFromDOI.matches.length
              ) {
                return {
                  matches: result.data.getDataciteCslFromDOI.matches,
                  fromCrossref:
                    result.data.getDataciteCslFromDOI?.message === 'crossref',
                }
              }

              if (result?.data?.getDataciteCslFromDOI?.message) {
                console.error('DOI not found at Datacite!')
                return []
              }

              console.error(
                'Crossref error: ',
                result.data.getFormattedReferences?.message || result.data,
              )
              return []
            })
        : null
    },
    [client],
  )

  const updateCiteProc = useCallback(
    async csl => {
      // console.log('Coming in for citeproc: ', csl)
      return client
        .query({
          query: GET_CITE_PROC,
          variables: {
            citation: JSON.stringify(csl),
          },
          fetchPolicy: 'network-only',
        })
        .then(result => {
          // console.log('Citeproc result:', result)

          if (
            result?.data?.formatCitation?.formattedCitation &&
            result?.data?.formatCitation?.citeHtml
          ) {
            // This returns an array of CSL
            return {
              formattedCitation: result.data.formatCitation.formattedCitation,
              citeHtml: result.data.formatCitation.citeHtml,
            }
          }

          console.error('Server-side error: ', result.data.formatCitation.error)
          return JSON.stringify(csl)
        })
    },
    [client],
  )

  const updateCallout = useCallback(
    async (references, callouts) => {
      // console.log(
      //   'Coming in for citeproc input references: ',
      //   JSON.stringify(references),
      // )
      // console.log(
      //   'Coming in for citeproc input callouts: ',
      //   JSON.stringify(callouts),
      // )
      return client
        .query({
          query: GET_CALLOUT_TEXT,
          variables: {
            input: {
              references: JSON.stringify(references),
              callouts: JSON.stringify(callouts),
            },
          },
          fetchPolicy: 'network-only',
        })
        .then(result => {
          // console.log('Citeproc result:', result)

          if (
            result?.data?.formatMultipleCitations?.orderedCitations &&
            result?.data?.formatMultipleCitations?.calloutTexts &&
            result?.data?.formatMultipleCitations?.orderedReferenceIds
          ) {
            // This returns an array of orderedCitations and calloutTexts
            return {
              orderedCitations:
                result.data.formatMultipleCitations.orderedCitations,
              calloutTexts: result.data.formatMultipleCitations.calloutTexts,
              orderedReferenceIds:
                result.data.formatMultipleCitations.orderedReferenceIds,
            }
          }

          console.error(
            'Server-side error: ',
            result.data.formatMultipleCitations.error,
          )
          return null
        })
    },
    [client],
  )

  return { updateAnystyle, updateCrossRef, updateCiteProc, updateCallout }
}

export default useCitationApi
