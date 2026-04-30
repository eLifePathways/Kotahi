/* eslint-disable */

/**
 * See comment in publicationMetadata.js in the same folder.
 */

const striptags = require('striptags')
const QRCode = require('qrcode-svg')

// const fs = require('fs')

// This should return an object with front matter from the form that should be sent to the PDF or to JATS.
// It takes the manuscript as an argument and returns a frontmatter object that can be sentt to the JATS or PDF processor.
// Because every form is different, different users will need to make their own versions of this to suit their needs.

// this should pull in (and be replaced by) a user version from config/journal/export/articleMetadata.js

let userArticleMetadata = {}

try {
  userArticleMetadata = require('../../../config/journal/export/articleMetadata.json')
} catch {
  // console.log("userArticleMetadata doesn't exist.")
}

const makeFormattedAuthors = (authors, correspondingAuthor) => {
  // authors is an array of objects with firstName, lastName, affiliation, email
  // correspondingAuthor is an email address

  // This returns something like this:
  // <p class="formattedAuthors">Bob Aaaaa <sup>a</sup><sup>*</sup>, Bob Bbbbbbb <sup>a</sup>, Bob Ccccccccc <sup>b</sup>, Bob Dddddddd <sup>c</sup></p>
  // <ul class="formattedAffiliations"><li>a: Affiliation 1</li>,<li>b: Affiliation 2</li>,<li>c: Affiliation 3</li></ul>

  let outHtml = `<p class="formattedAuthors">`
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'

  const affiliationMemo = [...new Set(authors.map(x => x.affiliation))]
    .sort()
    .map((affiliation, index) => ({
      label: alphabet[index % 26],
      value: affiliation,
    }))

  const outAuthors = [] // an array of formatted author names

  for (let i = 0; i < authors.length; i += 1) {
    let thisAuthor = ''

    // we are assuming that author.affiliation is a single string. We could make this an array?
    const affliationList = affiliationMemo
      .filter(x => x.value === authors[i].affiliation)
      .map(x => x.label)

    thisAuthor += `${authors[i].firstName} ${authors[i].lastName}`
    // We could include the email address here, but it's not necessary:
    // thisAuthor += ` <small>(${authors[i].email})</small>`

    if (affliationList.length) {
      thisAuthor += `<sup><small class="author-list-separation">${affliationList.join(
        ', ',
      )}</small></sup>`
    }

    if (correspondingAuthor && correspondingAuthor === authors[i].email) {
      // check if there is a corresponding author; if there is one, add a star to the author's name
      thisAuthor += `<sup class="author-corresponding-symbol">*</sup>`
    }

    outAuthors.push(thisAuthor)
  }

  outHtml += outAuthors.join(', ')

  outHtml += `</p>`
  outHtml += `<ul class="formattedAffiliations">${affiliationMemo
    .map(
      affiliation =>
        `<li><small>${affiliation.label}<span class="affiliation-decoration">:</span></small> ${affiliation.value}</li>`,
    )
    .join(' ')}</ul>`
  // console.log('\n\n\nFormatted authors: \n\n', outHtml, '\n\n\n')
  return outHtml
}

const articleMetadata = manuscript => {
  const meta = {}

  if (manuscript?.meta?.manuscriptId) {
    meta.id = manuscript.meta.manuscriptId
  }

  if (manuscript?.created) {
    // N.b. this is the internal date for Kotahi, not the date given in the form!
    meta.pubDate = manuscript.created
  }

  if (manuscript?.submission) {
    meta.submission = manuscript.submission

    if (manuscript.submission.$title) {
      meta.title = manuscript.submission.$title
    }

    if (manuscript.submission.topic) {
      meta.topic = manuscript.submission.topic
    }

    if (manuscript.submission.topics) {
      meta.topics = manuscript.submission.topics
    }

    if (manuscript.submission.$doi) {
      meta.doi = manuscript.submission.$doi

      // make the qrcode
      const qrcode = new QRCode({
        content: `https://dx.doi.org/${manuscript.submission.$doi}`,
        padding: 4,
        width: 80,
        height: 80,
        color: '#000000',
        background: '#ffffff',
        ecl: 'M',
        pretty: false,
        xmlDeclaration: false,
      }).svg()

      meta.qrcode = qrcode
    } else {
      meta.doi = 'DOI will be available soon.'
    }

    if (manuscript.submission.objectType) {
      meta.objectType = manuscript.submission.objectType
    }

    if (manuscript.submission.Funding) {
      meta.funding = manuscript.submission.Funding
    }

    if (manuscript.submission.$abstract) {
      meta.abstract = manuscript.submission.$abstract
    }

    if (manuscript.submission.AuthorCorrespondence) {
      meta.authorCorrespondence = manuscript.submission.AuthorCorrespondence
    }

    if (manuscript.submission.competingInterests) {
      // This is coming in as HTML; let's just export text because in the template it goes in a paragraph tag.
      meta.competingInterests = striptags(
        manuscript.submission.competingInterests,
      )
    }

    if (manuscript.submission.$authors?.length) {
      meta.authors = []

      meta.authors = manuscript.submission.$authors.map(author => ({
        email: author.email || '',
        firstName: author.firstName || '',
        lastName: author.lastName || '',
        affiliation: author.affiliation || '',
        id: author.id || '',
      }))

      meta.formattedAuthors = makeFormattedAuthors(
        meta.authors,
        manuscript.submission.AuthorCorrespondence, // does this need to be renamed?
      )
    }

    if (manuscript.submission.dateReceived) {
      meta.dateReceived = manuscript.submission.dateReceived
    }

    if (manuscript.submission.dateAccepted) {
      meta.dateAccepted = manuscript.submission.dateAccepted
    }

    if (manuscript.submission.datePublished) {
      meta.datePublished = manuscript.submission.datePublished
    }
  }

  // replace things by what's in the user version if we need to.

  Object.entries(userArticleMetadata).forEach(([key, value]) => {
    // if (value) meta[key] = value
    // TODO: I'm not 100% sure how this would actually be useful if someone actually had a userMetadata file.
    // I don't think you'd want to just have raw values in there (like for publisherMetadata).
    // Rather, I think you'd want to have a function that takes manuscript.submission and returns new values?
    // Is there a way to make that work while still keeping it JSON?
    if (value) meta[key] = manuscript.submission[value]
    // This might work for basic things on the submission form, but we should have something more elegant.
    // Make this work like what we're doing in server/publishing/docmaps/index.js
  })

  return meta
}

module.exports = articleMetadata
