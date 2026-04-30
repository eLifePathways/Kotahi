/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */

/* eslint-disable new-cap */
/* eslint-disable jsx-a11y/no-autofocus */

import { useRef, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import { Wax } from 'wax-prosemirror-core'
import { ThemeProvider } from 'styled-components'
import { gql } from '@apollo/client'
import waxTheme from './layout/waxTheme'
import { JournalContext } from '../../xpub-journal/src'

import yjsConfig from './config/yjsConfig'

import productionWaxEditorConfig from './config/ProductionWaxEditorConfig'
import ProductionWaxEditorLayout from './layout/ProductionWaxEditorLayout'
import ProductionWaxEditorNoCommentsLayout from './layout/ProductionWaxEditorNoCommentsLayout'

import authorProofingWaxEditorConfig from './config/AuthorProofingWaxEditorConfig'
import AuthorProofingWaxEditorLayout from './layout/AuthorProofingWaxEditorLayout'

const getAnystyleCslQuery = gql`
  query ($textReferences: String!) {
    buildCitationsCSL(textReferences: $textReferences) {
      cslReferences
      error
    }
  }
`

const getCrossRefQuery = gql`
  query ($input: CitationSearchInput) {
    getFormattedReferences(input: $input) {
      success
      message
      matches {
        doi
        author {
          given
          family
          sequence
        }
        issue
        issued {
          raw
        }
        page
        title
        volume
        journalTitle
        formattedCitation
        citeHtml
      }
    }
  }
`

const getDataciteQuery = gql`
  query ($input: CitationSearchInput) {
    getDataciteCslFromDOI(input: $input) {
      success
      message
      matches {
        doi
        author {
          given
          family
          sequence
        }
        issue
        issued {
          raw
        }
        page
        title
        volume
        journalTitle
        formattedCitation
      }
    }
  }
`

const getCiteProcQuery = gql`
  query ($citation: String!) {
    formatCitation(citation: $citation) {
      formattedCitation
      citeHtml
      error
    }
  }
`

const getCalloutTextQuery = gql`
  query ($input: CitationData) {
    formatMultipleCitations(input: $input) {
      orderedCitations
      calloutTexts {
        id
        text
      }
      orderedReferenceIds
      error
    }
  }
`

// TODO Save this image via the server
const renderImage = file => {
  const reader = new FileReader()
  return new Promise((resolve, reject) => {
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    // Some extra delay to make the asynchronicity visible
    setTimeout(() => {
      reader.readAsDataURL(file)
    }, 150)
  })
}

const ProductionWaxEditor = ({
  aiConfig,
  client,
  value,
  validationStatus,
  readonly,
  autoFocus,
  saveSource,
  getComments,
  setComments,
  placeholder,
  // fileUpload,
  useComments,
  user,
  manuscriptId,
  onAssetManager,
  isAuthorProofingVersion,
  getDataFromDatacite = false,
  fallbackOnCrossrefAfterDatacite = false,
  // yjsProvider,
  wsProvider,
  ydoc,
  name,
}) => {
  const handleAssetManager = () => onAssetManager(manuscriptId)
  const journal = useContext(JournalContext)

  const waxUser = {
    userId: user.id || '-',
    userColor: {
      addition: 'royalblue',
      deletion: 'indianred',
    },
    username: user.username || 'demo',
  }

  const editorRef = useRef(null)

  useEffect(() => {
    return () => {
      if (editorRef.current && saveSource !== null) {
        saveSource(editorRef.current.getContent())
      }
    }
  }, [])

  const updateAnystyle = async text => {
    const { content } = text

    // console.log('Coming in for Anystyle: ', content)
    return client
      .query({
        query: getAnystyleCslQuery,
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
  }

  const updateCrossRef = async (text, useDatacite = false) => {
    // console.log('Coming in for CrossRef: ', text)
    // console.log('use DataCite: ', useDatacite)
    return text
      ? client
          .query({
            query: useDatacite ? getDataciteQuery : getCrossRefQuery,
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
  }

  const updateCiteProc = async csl => {
    // console.log('Coming in for citeproc: ', csl)
    return client
      .query({
        query: getCiteProcQuery,
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
  }

  const updateCallout = async (references, callouts) => {
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
        query: getCalloutTextQuery,
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
  }

  // eslint-disable-next-line no-nested-ternary
  const productionLayout = isAuthorProofingVersion
    ? AuthorProofingWaxEditorLayout(readonly)
    : useComments // TODO: Check if we actually ever use useComments in production mode?
      ? ProductionWaxEditorLayout(readonly)
      : ProductionWaxEditorNoCommentsLayout(readonly)

  let config = isAuthorProofingVersion
    ? authorProofingWaxEditorConfig(
        handleAssetManager,
        updateAnystyle,
        updateCrossRef,
        updateCiteProc,
        getComments,
        setComments,
        aiConfig,
      )
    : productionWaxEditorConfig(
        handleAssetManager,
        updateAnystyle,
        updateCrossRef,
        updateCiteProc,
        getComments,
        setComments,
        updateCallout,
        readonly,
        getDataFromDatacite || false,
        aiConfig,
        fallbackOnCrossrefAfterDatacite || false,
      )

  config = yjsConfig(config, { wsProvider, ydoc, yjsType: name })

  return (
    <ThemeProvider theme={{ textStyles: journal.textStyles, ...waxTheme }}>
      <div className={validationStatus}>
        <Wax
          autoFocus={autoFocus}
          config={config}
          fileUpload={file => renderImage(file)}
          key={`readonly-${readonly}`} // Force remount to overcome Wax bugs on changing between editable and readonly
          layout={productionLayout}
          onChange={source => {
            saveSource(source)
          }}
          placeholder={placeholder}
          readonly={readonly}
          ref={editorRef}
          scrollMargin={200}
          scrollThreshold={200}
          user={waxUser}
          value={value}
        />
      </div>
    </ThemeProvider>
  )
}

ProductionWaxEditor.propTypes = {
  value: PropTypes.string,
  validationStatus: PropTypes.string,
  readonly: PropTypes.bool,
  autoFocus: PropTypes.bool,
  saveSource: PropTypes.func,
  isAuthorProofingVersion: PropTypes.bool,
  placeholder: PropTypes.string,
  fileUpload: PropTypes.func,
  useComments: PropTypes.bool,
  user: PropTypes.shape({
    userId: PropTypes.string,
    userName: PropTypes.string,
    userColor: PropTypes.shape({
      addition: PropTypes.string,
      deletion: PropTypes.string,
    }),
  }),
}

ProductionWaxEditor.defaultProps = {
  value: '',
  validationStatus: '',
  readonly: false,
  autoFocus: false,
  placeholder: '',
  isAuthorProofingVersion: false,
  fileUpload: () => {},
  saveSource: () => {},
  useComments: true,
  user: {},
}

export default ProductionWaxEditor
