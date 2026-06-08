const fs = require('fs')
const path = require('path')

const citeproc = require('citeproc-js-node')

const { logger, uuid } = require('@coko/server')

const { Config } = require('../models')

// eslint-disable-next-line new-cap
const sys = new citeproc.simpleSys()

const createFormattedReference = async (data, groupId, isDatacite = false) => {
  const {
    DOI: doi,
    author,
    page,
    title,
    issue,
    volume,
    'container-title': journalTitle,
  } = data

  // logger.info('issued data:', data.issued)

  const rawDate = data.issued?.raw ? data.issued.raw : false

  const yearFromDateParts = data.issued['date-parts']?.length
    ? String(data.issued['date-parts'][0][0] || '')
    : ''

  const year = rawDate || yearFromDateParts

  const outputData = {
    doi,
    DOI: doi,
    author: pluckAuthors(author),
    page,
    issue,
    volume,
    issued: { raw: String(year) },
    title: pluckTitle(title),
    journalTitle: pluckJournalTitle(journalTitle),
  }

  const formattedCitation = await formatCitation(
    isDatacite ? data : outputData,
    groupId,
  )

  outputData.formattedCitation = formattedCitation.result
  outputData.citeHtml = formattedCitation.citeHtml
  return outputData
}

const createReference = data => {
  const {
    DOI: doi,
    author,
    page,
    title,
    issue,
    volume,
    'container-title': journalTitle,
  } = data

  return {
    doi,
    author: pluckAuthors(author),
    page,
    issue,
    volume,
    title: pluckTitle(title),
    journalTitle: pluckJournalTitle(journalTitle),
  }
}

const getFirstPageFromPageRange = range => {
  const match = range.match(/(?<=^\s*)\d+/)
  return match?.[0] || null
}

/** Converts a CSL object into a JATS-flavoured HTML citation string,
 * using the style and locale configured for the group */
const formatCitation = async (cslObject, groupId) => {
  const thisRef = `ref-${uuid()}`
  const csl = { ...cslObject }
  // Content needs to be shaped like this:
  // {
  //  "ref1": {
  //		"id": "ref1",
  //		"title": "Adiposity and Cognitive Decline in the Cardiovascular Health Study",
  //		"author": [....]
  //   }
  // }
  // where the id is the key and the rest is the value. If we had an array coming in, turn it into an object
  csl.id = thisRef
  // Fix possible missing items
  if (csl.page && !csl['page-first'])
    csl['page-first'] = getFirstPageFromPageRange(csl.page)
  if (csl.doi && !csl.DOI) csl.DOI = csl.doi

  const activeConfig = await Config.query().findOne({ groupId, active: true })

  const localeName =
    activeConfig.formData.production?.citationStyles?.localeName || 'en-US'

  const styleName =
    activeConfig.formData.production?.citationStyles?.styleName || 'apa'

  // const styleName = getStyleNameFromTitle(styleTitle)

  // logger.info('Citeproc settings: ', localeName, styleName)

  // localeName can be either 'en-US' or 'en-GB'

  const localeData = fs.readFileSync(
    path.join(__dirname, `/csl-locales/locales-${localeName}.xml`),
    'utf8',
  )

  sys.addLocale(localeName, localeData)

  // styleName can be any of the files in the csl directory. We might change this in the future to work with an uploaded file

  const styleString = fs.readFileSync(
    path.join(__dirname, `/csl/${styleName}.csl`),
    'utf8',
  )

  const engine = sys.newEngine(styleString, localeName, null)

  let error = ''
  const referenceCSL = {}
  let result = ''
  let citeText = ''

  try {
    // logger.info('stringifiedCSL: ', stringifiedCSL)
    // logger.info(typeof stringifiedCSL)
    referenceCSL[thisRef] = csl

    sys.items = referenceCSL

    engine.updateItems(Object.keys(referenceCSL))

    const processSingleCitation = citation => {
      // Format the citation input correctly
      const citationItem = {
        citationID: `citation-${uuid()}`,
        citationItems: [citation],
        properties: {
          noteIndex: 0,
        },
      }

      // Process the citation cluster
      // eslint-disable-next-line no-unused-vars
      const [res, [[_, citeHtml, id]]] = engine.processCitationCluster(
        citationItem,
        [], // No previous citations need for single citation
        [],
        'html',
      )

      return { citeHtml, id }
    }

    const citeData = processSingleCitation(csl)

    citeText = citeData.citeHtml

    // logger.info('Citation ID:', citeData.id)

    const bib = engine.makeBibliography()
    // bib is the bibliography array. The first item is a metadata object; the second is an array of HTML strings.

    if (bib.length > 1) {
      // We are dealing with the array of HTML strings, the second item in the array.
      const results = bib[1]
      // Even if there's a single result, it's in an array.
      result = results[0]
      // This is CSL-flavored HTML, need to make it JATS-flavored HTML.
      // Not 100% sure that all of the HTML coming out of this will work for us, keep an eye out.

      // Worth noting that sometimes there are spaces between tags, sometimes not. We're going to remove them all.
      result = result
        .replace(/<div class="csl-entry">\s*/g, '<p class="ref">')
        .replace(/\s*<\/div>/g, '</p>')
        .replace(/<i>/g, '<em>')
        .replace(/<\/i>/g, '</em>')
        .replace(/<b>/g, '<strong>')
        .replace(/<\/b>/g, '</strong>')
        .trim()
    }
  } catch (e) {
    /*

      This (a result coming back from CrossRef) is crashing it:

      kotahi-server-1            | Reference CSL:  {
      kotahi-server-1            |   '80bb49ae-380d-40e9-978f-61cf7d45211b': {
      kotahi-server-1            |     DOI: '10.1016/s0033-3506(73)80126-x',
      kotahi-server-1            |     issue: '3',
      kotahi-server-1            |     page: '94',
      kotahi-server-1            |     title: [
      kotahi-server-1            |       'The Work of the World Health Organization in 1971, Annual Report of the Director-General 4071 Geneva World Health Organization 1972 £1.50'
      kotahi-server-1            |     ],
      kotahi-server-1            |     volume: '87',
      kotahi-server-1            |     'container-title': [ 'Public Health' ],
      kotahi-server-1            |     id: '80bb49ae-380d-40e9-978f-61cf7d45211b'
      kotahi-server-1            |   }
      kotahi-server-1            | } 
      kotahi-server-1            | 

      Plugging this into a CSL validator says that it's missing a type and that title and container-title should not be arrays.
      But: arrayed titles are being used for other references that correctly work; they don't have types either.

      If we can't format it, we're not showing it as a choice on the front end. It would be nice to fix this though.

      */

    logger.error('\n\n\nCiteproc error', e)
    logger.error('Reference CSL: ', referenceCSL, '\n\n\n')
    error = e.message
  }

  // logger.info('Comming out of formatting.js:', result, citeHtml, error)
  return { result, citeHtml: citeText, error }
}

const formatMultipleCitations = async (
  groupId,
  referenceData = {},
  calloutData = [],
) => {
  const citations = {}
  const itemIDs = []

  referenceData.items.forEach(item => {
    if (item.issued) {
      citations[item.id] = item
      itemIDs.push(item.id)
    }
  })

  const activeConfig = await Config.query().findOne({ groupId, active: true })

  const localeName =
    activeConfig.formData.production?.citationStyles?.localeName || 'en-US'

  const styleName =
    activeConfig.formData.production?.citationStyles?.styleName || 'apa'

  // const styleName = getStyleNameFromTitle(styleTitle)

  // logger.info('Citeproc settings: ', localeName, styleName)

  // localeName can be either 'en-US' or 'en-GB'

  const localeData = fs.readFileSync(
    path.join(__dirname, `/csl-locales/locales-${localeName}.xml`),
    'utf8',
  )

  sys.addLocale(localeName, localeData)

  // styleName can be any of the files in the csl directory. We might change this in the future to work with an uploaded file

  const styleString = fs.readFileSync(
    path.join(__dirname, `/csl/${styleName}.csl`),
    'utf8',
  )

  const engine = sys.newEngine(styleString, localeName, null)

  let error = ''
  let result = []
  const calloutTexts = []

  let preCitations = []

  let orderedReferenceIds = []

  try {
    sys.items = citations

    engine.updateItems(itemIDs)

    engine.setOutputFormat('text') // Available citeproc output format 'html', 'text', 'rtf'

    // eslint-disable-next-line no-unused-vars
    const { citeData, preCitationIds } = calloutData.reduce(
      (accumulator, citation) => {
        // logger.info('citation', citation)
        // logger.info('accumulator', accumulator)
        // logger.info('preCitationIds', accumulator.preCitationIds)
        // eslint-disable-next-line no-unused-vars
        const [res, [[_, citeHtml, id]]] = engine.processCitationCluster(
          citation,
          accumulator.preCitationIds,
          [],
        )

        accumulator.citeData.push(citeHtml)
        calloutTexts.push({ id: citation.citationID, text: citeHtml })
        accumulator.preCitationIds.push([citation.citationID, 0])
        return accumulator
      },
      { citeData: [], preCitationIds: [] },
    )

    // eslint-disable-next-line no-unused-vars
    preCitations = preCitationIds

    // logger.info(preCitationIds)

    const bib = engine.makeBibliography()

    orderedReferenceIds = bib[0].entry_ids.flat()
    // logger.info(bib)
    // logger.info(bib[0]['entry_ids']) // order of citations by ids
    // bib is the bibliography array. The first item is a metadata object; the second is an array of HTML strings.

    if (bib.length > 1) {
      // We are dealing with the array of HTML strings, the second item in the array.
      const results = bib[1]
      // Even if there's a single result, it's in an array.
      // This is CSL-flavored HTML, need to make it JATS-flavored HTML.
      // Not 100% sure that all of the HTML coming out of this will work for us, keep an eye out.

      // Worth noting that sometimes there are spaces between tags, sometimes not. We're going to remove them all.

      // html output
      // result = results.map(r =>
      //   r
      //     .replace(/<div class="csl-entry">\s*/g, '<p class="ref">')
      //     .replace(/\s*<\/div>/g, '</p>')
      //     .replace(/<i>/g, '<em>')
      //     .replace(/<\/i>/g, '</em>')
      //     .replace(/<b>/g, '<strong>')
      //     .replace(/<\/b>/g, '</strong>')
      //     .trim(),
      // )

      // text output
      result = results.map(r => `<p class="ref">${r.trim()}</p>`)
    }
  } catch (e) {
    logger.error('\n\n\nCiteproc error', e)
    error = e.message
  }

  // logger.info(
  //   'Comming out of formatting.js:',
  //   result, // reoredered citation array of html - p.ref
  //   calloutTexts, // callout text array of {id, text}
  //   preCitations,
  //   orderedReferenceIds, // citeproc order of biblographic citation ids
  //   error,
  // )

  return { result, calloutTexts, orderedReferenceIds, error }
}

const pluckAuthors = authors => {
  if (!authors) return authors
  return authors.map(({ given, family, sequence }) => {
    return { given, family, sequence }
  })
}

const pluckJournalTitle = journalTitle => journalTitle && journalTitle[0]

const pluckTitle = title => title && title[0]

module.exports = {
  createFormattedReference,
  createReference,
  formatCitation,
  formatMultipleCitations,
}
