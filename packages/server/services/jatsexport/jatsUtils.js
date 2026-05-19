const htmlparser2 = require('htmlparser2')
const cheerio = require('cheerio')

const makeCitations = require('./makeCitations')
const htmlToJats = require('./htmlToJats')

const { getCrossrefCitationsFromList } = require('../../utils/crossrefUtils')

const processFunding = require('./processFunding')
const processKeywords = require('./processKeywords')
const processGlossary = require('./processGlossary')
const processAppendices = require('./processAppendices')
const processTablesWithCaptions = require('./processTablesWithCaptions')

// const { lte } = require('semver')

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace)
}

/** Finds all XML tags and:
 * converts them to another tag if they are in tagsToConvert (discarding all attributes);
 * deletes them if they are not in tagsToConvert or tagsToIgnore;
 * otherwise leaves them untouched
 * */

const fixNestedTables = html => {
  // Wax (and HTML) allows a <table> to be inside of a <td>. JATS doesn't allow this.
  // For now, we are deleting these nested tables so as to return valid JATS.

  const dom = htmlparser2.parseDocument(html)
  const $ = cheerio.load(dom, { xmlMode: true })
  $('td').each((index, el) => {
    const $elem = $(el)
    $elem.find('table').remove()
    return $elem
  })
  return $.html()
}

const removeTrackChanges = html => {
  const dom = htmlparser2.parseDOM(html)

  const $ = cheerio.load(dom, {
    xmlMode: true,
  })

  $('span.deletion').remove()
  return $.html()
}

const makeJournalMeta = journalMeta => {
  // this is working with a journalMeta with this shape:

  // journalId: [{type: "", value: ""}]
  // journalTitle: ""
  // abbrevJouralTitle: ""
  // issn: [{type: "", value: ""}]
  // journalPublisher: ""
  let thisJournalMeta = ''

  if (journalMeta) {
    if (journalMeta.journalId && journalMeta.journalId.length) {
      for (let i = 0; i < journalMeta.journalId.length; i += 1) {
        if (journalMeta.journalId[i].type && journalMeta.journalId[i].value) {
          thisJournalMeta += `<journal-id journal-id-type="${journalMeta.journalId[i].type}">${journalMeta.journalId[i].value}</journal-id>`
        }
      }
    }

    if (journalMeta.journalTitle) {
      thisJournalMeta += `<journal-title-group><journal-title>${journalMeta.journalTitle}</journal-title>`

      if (journalMeta.abbrevJournalTitle) {
        thisJournalMeta += `<abbrev-journal-title>${journalMeta.abbrevJournalTitle}</abbrev-journal-title>`
      }

      thisJournalMeta += `</journal-title-group>`
    }

    if (journalMeta.issn && journalMeta.issn.length) {
      for (let i = 0; i < journalMeta.issn.length; i += 1) {
        if (journalMeta.issn[i].type && journalMeta.issn[i].value) {
          thisJournalMeta += `<issn publication-format="${journalMeta.issn[i].type}">${journalMeta.issn[i].value}</issn>`
        }
      }
    }

    if (journalMeta.publisher && journalMeta.publisher.publisherName) {
      thisJournalMeta += `<publisher><publisher-name>${journalMeta.publisher.publisherName}</publisher-name></publisher>`
    }
  }

  return thisJournalMeta && `<journal-meta>${thisJournalMeta}</journal-meta>`
}

const makeArticleMeta = (
  metadata,
  abstract,
  title,
  fundingList,
  keywordList,
) => {
  // metadata:
  // --pubDate: date
  // --id: id (if this is a publisher's ID and NOT a DOI)
  // --doi: doi
  // --title: title
  // --submission: submission form PARSED BEFORE IT GETS HERE
  //   --$title
  //   --$abstract: html
  //   --$authors: array
  //     --id: '3dcc3f77-647e-48b5-86d9-aa3540375f60',
  //     --email: string
  //     --lastName: string
  //     --firstName: string
  //     --affiliation: string
  //   --content: array of string (this is keywords)
  //   --issueNumber: string
  //   --volumeNumber: string
  // title: html string, from the title, if it exists
  // abstract: html string, from the abstract tag if it exists

  let thisArticleMeta = ''

  const formData = metadata.submission || {}

  if (formData.$doi) {
    // If we have a DOI in the metadata, we export that as the article ID: https://jats.nlm.nih.gov/archiving/tag-library/1.1d1/n-7s30.html
    thisArticleMeta += `<article-id pub-id-type="doi">${formData.$doi}</article-id>`
  }

  if (metadata.pmid) {
    // If there's a PubMed ID as metadata.pmid, we put that in.
    thisArticleMeta += `<article-id pub-id-type="pmid">${metadata.pmid}</article-id>`
  }

  if (metadata.id) {
    // And we're including the general ID, which publishers should know (in the form) will be (slightly) public
    thisArticleMeta += `<article-id pub-id-type="publisher-id">${metadata.id}</article-id>`
  }

  if (title || formData.$title) {
    thisArticleMeta += `<title-group><article-title>${
      title || formData.$title
    }</article-title></title-group>`
  }

  if (formData.$authors?.length) {
    let authorsList = ''
    let affilList = ''

    for (let i = 0; i < formData.$authors.length; i += 1) {
      if (formData.$authors[i].lastName && formData.$authors[i].firstName) {
        authorsList += `<contrib contrib-type="author"><name><surname>${formData.$authors[i].lastName}</surname><given-names>${formData.$authors[i].firstName}</given-names></name>`
      }

      if (formData.$authors[i].affiliation) {
        const thisId = formData.$authors[i].id || `author_${i}`
        authorsList += `<xref ref-type="aff" rid="auth-${thisId}" />`
        affilList += `<aff id="auth-${thisId}">${formData.$authors[i].affiliation}</aff>`
      }

      authorsList += `</contrib>`
    }

    thisArticleMeta += `<contrib-group>${authorsList}</contrib-group>${affilList}`
  }

  if (metadata.pubDate) {
    const theDate = new Date(metadata.pubDate)
    const date = theDate.getUTCDate()
    const month = theDate.getUTCMonth() + 1
    const year = theDate.getUTCFullYear()
    const pubDateString = `<pub-date publication-format="print" date-type="pub" iso-8601-date="${year}-${month}-${date}"><day>${date}</day><month>${month}</month><year>${year}</year></pub-date>`
    thisArticleMeta += pubDateString
  } else {
    thisArticleMeta += `<pub-date-not-available />`
  }

  if (formData.volumeNumber) {
    thisArticleMeta += `<volume>${formData.volumeNumber}</volume>`
  }

  if (formData.issueNumber) {
    thisArticleMeta += `<issue>${formData.issueNumber}</issue>`
  }

  if (abstract || formData.$abstract) {
    // TODO: note that the quotes in submission.$abstract can be escaped. Does this break our parser?
    thisArticleMeta += `<abstract>${htmlToJats(
      abstract || formData.$abstract,
    )}</abstract>`
  }

  if (keywordList && keywordList.length) {
    // If we have keywords in Wax, we use them. Otherwise, we might have them in the form, use them if they exist.
    thisArticleMeta += `<kwd-group kwd-group-type="author">${keywordList
      .map(x => `<kwd>${x}</kwd>`)
      .join('')}</kwd-group>`
  } else if (formData.content?.length) {
    // this is for keywords
    let contentList = ''

    for (let i = 0; i < formData.content.length; i += 1) {
      contentList += `<kwd>${formData.content[i]}</kwd>`
    }

    thisArticleMeta += `<kwd-group kwd-group-type="author">${contentList}</kwd-group>`
  }

  if (fundingList) {
    thisArticleMeta += fundingList
  }

  return `<article-meta>${thisArticleMeta}</article-meta>`
}

const makeFootnotesSection = html => {
  let deFootnotedHtml = html.replace(/ data-group="notes"/g, '')
  let footnoteCount = 0
  let fnSection = ''

  while (deFootnotedHtml.indexOf(`<footnote id="`) > -1) {
    // get id and text from Wax markup
    const id = deFootnotedHtml.split('<footnote id="')[1].split('">')[0]

    const text = deFootnotedHtml
      .split(`<footnote id="${id}">`)[1]
      .split('</footnote>')[0]

    const toReplace = `<footnote id="${id}">${text}</footnote>`
    footnoteCount += 1
    // replace body text with JATS tag
    deFootnotedHtml = deFootnotedHtml.replace(
      toReplace,
      `<xref ref-type="fn" rid="fnid${id}">${footnoteCount}</xref>`,
    )

    // add this to the list of footnotes
    // pass through spans in footnotes as @span, that will have to be taken care of later.

    // text = replaceAll(text, '<span', '<aside')
    // text = replaceAll(text, '</span>', '</aside>')

    fnSection += `<fn id="fnid${id}"><p>${htmlToJats(text, true)}</p></fn>`
  }

  if (footnoteCount > 0) {
    fnSection = `<fn-group>${fnSection}</fn-group>`
  }

  return { deFootnotedHtml, fnSection }
}

const makeAcknowledgements = html => {
  const searchFor1 = '<section class="acknowledgementsSection">'
  const searchFor2 = '</section>'
  let ack = ''
  let deackedHtml = html

  // NOTE: JATS only allows a single acknowledgements section.
  // If there are more than one acknowledgements sections in the text
  // (which Wax currently allows), only the last one is taken.

  while (deackedHtml.indexOf(searchFor1) > -1) {
    const thisAcknowledgements = deackedHtml
      .split(searchFor1)[1]
      .split(searchFor2)[0]

    deackedHtml = deackedHtml.replace(
      `${searchFor1}${thisAcknowledgements}${searchFor2}`,
      '',
    )
    ack = `<ack>${htmlToJats(thisAcknowledgements)}</ack>`
  }

  return { deackedHtml, ack: ack || '' }
}

const fixTableCells = html => {
  // This runs the content of <td>s individually though htmlToJats
  // This doesn't deal with <th>s though I don't think we're getting them.

  let deTabledHtml = html

  while (deTabledHtml.indexOf('<td>') > -1) {
    const tableCellContent = deTabledHtml.split('<td>')[1].split('</td>')[0]

    deTabledHtml = deTabledHtml.replace(
      `<td>${tableCellContent}`,
      `<!td!>${htmlToJats(tableCellContent)}`,
    )
  }

  // So that these don't get screwed up by later sectioning
  deTabledHtml = replaceAll(deTabledHtml, '<title>', '<@title>')
  deTabledHtml = replaceAll(deTabledHtml, '</title>', '</@title>')
  deTabledHtml = replaceAll(deTabledHtml, '<sec>', '<@sec>')
  deTabledHtml = replaceAll(deTabledHtml, '</sec>', '</@sec>')

  deTabledHtml = replaceAll(deTabledHtml, '<!td!>', '<td>')
  return { deTabledHtml }
}

const makeFrontMatter = html => {
  let deFrontedHtml = html
  let abstract = ''
  let title = '' // this would be where we'd put a title if we find one

  while (deFrontedHtml.indexOf('<section class="frontmatter">') > -1) {
    const frontMatter = deFrontedHtml
      .split('<section class="frontmatter">')[1]
      .split('</section>')[0]

    // look and see if there's a title

    if (frontMatter.indexOf('<h1>') > -1) {
      // if there's an H1 in the front matter, send it back as the title.
      // note that we are only taking the first one

      title = frontMatter.split('<h1>')[1].split('</h1>')[0]
    }

    // look and see if there's an abstract

    if (frontMatter.indexOf('<section class="abstractSection">') > -1) {
      // we are only taking the first one.
      // if there is more than one abstract, subsequent ones will be ignored

      abstract = frontMatter
        .split('<section class="abstractSection">')[1]
        .split('</section>')[0]
    }

    deFrontedHtml = deFrontedHtml.replace(
      `<section class="frontmatter">${frontMatter}</section>`,
      '',
    )
  }

  // finally, get rid of any abstracts that are not in the front matter

  while (deFrontedHtml.indexOf('<section class="abstractSection">') > -1) {
    const abstractSection = deFrontedHtml
      .split('<section class="abstractSection">')[1]
      .split('</section>')[0]

    if (!abstract) {
      // if we have not found an abstract so far, take this abstract (not in a front matter) as the absact
      abstract = abstractSection
    }

    deFrontedHtml = deFrontedHtml.replace(
      `<section class="abstractSection">${abstractSection}</section>`,
      '',
    )
  }

  return { abstract, deFrontedHtml, title }
}

const fixMath = html => {
  // This converts math-display and math-inline to <disp-formula> and <inline-formula>
  // TODO: maybe should convert LaTex to MathML here using MathJax too?

  const dom = htmlparser2.parseDocument(html)

  const $ = cheerio.load(dom, {
    xmlMode: true,
  })

  $('math-inline').replaceWith((index, el) => {
    const mathAsLatex = $(el).text()
    const replacement = `<inline-formula><alternatives><tex-math><![CDATA[${mathAsLatex}]]></tex-math></alternatives></inline-formula>`
    return replacement
  })

  $('math-display').replaceWith((index, el) => {
    const mathAsLatex = $(el).text()
    const replacement = `<disp-formula><alternatives><tex-math><![CDATA[${mathAsLatex}]]></tex-math></alternatives></disp-formula>`
    return replacement
  })

  // This keeps the tags in title safe.
  $('title').replaceWith((index, el) => {
    const titleText = $(el).text()
    const replacement = `<title>${titleText}</title>`
    return replacement
  })

  const output = $.html()

  return output
}

const makeJats = (html, articleMeta, journalMeta, activeConfig) => {
  // html is what's coming out of Wax
  // articleMeta is what's needed for front matter (see makeArticleMeta for description)
  // journalMeta is the journal metadata object (see makeJournalMeta for description)

  // 0. strip xsweet attributes out of html

  const styleName = activeConfig.formData.production?.citationStyles?.styleName

  const deAttributedHtml = html
    .replace(/ data-xsweet-[^=]+="[^"]+"/g, '')
    .replace(/ type="."/g, '')
    .replace(/ type="none"/g, '')

  const deNewlinedHtml = deAttributedHtml
    .replace(/\n\n/g, '\n')
    .replace(/\n\n/g, '\n')

  // 0. deal with footnotes

  const unTrackChangedHtml = removeTrackChanges(deNewlinedHtml)

  // 1. deal with funding statements

  const { defundedHtml, fundingList } = processFunding(unTrackChangedHtml)

  // 1.5 deal with keywords

  const { deKeywordedHtml, keywordList } = processKeywords(defundedHtml)

  // 2. deal with citations

  const { deglossariedHtml, glossary } = processGlossary(deKeywordedHtml)

  const { processedHtml, refList } = makeCitations(deglossariedHtml, styleName)

  const { deFootnotedHtml, fnSection } = makeFootnotesSection(processedHtml)

  const { deackedHtml, ack } = makeAcknowledgements(deFootnotedHtml)

  // 0.25 fix nested tables

  const removeNestedTables = fixNestedTables(deackedHtml)

  // 0.5 deal with table cells

  const { deTabledHtml } = fixTableCells(removeNestedTables)

  // TODO: deal with tables with captions

  const { deCaptionTabledHtml } = processTablesWithCaptions(deTabledHtml)

  // 1. deal with appendices

  const { deAppendixedHtml, appendices } =
    processAppendices(deCaptionTabledHtml)

  // 3 deal with faux frontmatter – these just get thrown away

  const { abstract, deFrontedHtml, title } = makeFrontMatter(deAppendixedHtml)

  // 4 deal with article and journal metadata

  const journalMetaSection = makeJournalMeta(journalMeta || {})

  const articleMetaSection = makeArticleMeta(
    articleMeta || {},
    abstract,
    title,
    fundingList || '',
    keywordList || '',
  )

  const front = `<front>${journalMetaSection}${articleMetaSection}</front>`

  const unfixedMath = htmlToJats(deFrontedHtml)

  // change math to JATS-suitable math

  let body = fixMath(unfixedMath)

  // this is to clean out the bad table tags
  body = replaceAll(body, '<@title>', '<title>')
  body = replaceAll(body, '</@title>', '</title>')
  body = replaceAll(body, '<@sec>', '<sec>')
  body = replaceAll(body, '</@sec>', '</sec>')
  body = `<body>${body}</body>`

  const back = `<back>${ack}${appendices}${refList}${fnSection}${glossary}</back>`

  // check if body or back are empty, don't pass if not there.
  const jats = `<article xml:lang="en" xmlns:mml="http://www.w3.org/1998/Math/MathML"	xmlns:xlink="http://www.w3.org/1999/xlink" dtd-version="1.3">${front}${
    body.length > 13 ? body : ''
  }${back.length > 13 ? back : ''}</article>`

  return { front, body, back, jats }
}

module.exports = {
  htmlToJats,
  getCrossrefCitationsFromList,
  makeJats,
}
