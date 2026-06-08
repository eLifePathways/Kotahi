const FormData = require('form-data')
const fsPromised = require('fs').promises
const fs = require('fs')
const xml2js = require('xml2js')
const axios = require('axios')

const { config, uuid } = require('@coko/server')

const { fetchUserDetails } = require('../../../controllers/orcid.controllers')

const User = require('../../../models/user/user.model')
const Group = require('../../../models/group/group.model')
const Manuscript = require('../../../models/manuscript/manuscript.model')

const {
  getReviewForm,
  getDecisionForm,
  getSubmissionForm,
} = require('../../../controllers/review.controllers')

const {
  htmlToJats,
  getCrossrefCitationsFromList,
} = require('../../jatsexport/jatsUtils')

const Config = require('../../../models/config/config.model')

const DOI_PATH_PREFIX = 'https://doi.org/'
const ABSTRACT_PLACEHOLDER = '‖ABSTRACT‖'
const CITATIONS_PLACEHOLDER = '‖CITATIONS‖'

const builder = new xml2js.Builder()

const requestToCrossref = async (xmlFiles, activeConfig) => {
  const publishPromises = xmlFiles.map(async file => {
    const formData = new FormData()
    formData.append('login_id', activeConfig.formData.publishing.crossref.login)
    formData.append(
      'login_passwd',
      activeConfig.formData.publishing.crossref.password,
    )
    formData.append('fname', fs.createReadStream(file))

    const crossrefURL =
      activeConfig.formData.publishing.crossref.useSandbox === false
        ? 'https://doi.crossref.org/servlet/deposit'
        : 'https://test.crossref.org/servlet/deposit'

    const res = await axios.post(crossrefURL, formData, {
      headers: formData.getHeaders(),
    })
    // eslint-disable-next-line
    console.log('Response from Crossref')
    // eslint-disable-next-line
    console.log(res.data)
  })

  await Promise.all(publishPromises)
}

/** Publish either article or reviews to Crossref, according to config */
const publishToCrossref = async manuscript => {
  const activeConfig = await Config.getCached(manuscript.groupId)

  if (!activeConfig.formData.publishing.crossref.doiPrefix)
    throw new Error(
      'Could not publish to Crossref, as no DOI prefix is configured.',
    )

  if (activeConfig.formData.publishing.crossref.publicationType === 'article')
    await publishArticleToCrossref(manuscript).catch(err => {
      throw err
    })
  else
    await publishReviewsToCrossref(manuscript).catch(err => {
      throw err
    })
}

/** Get UTC timestamp in form yyyyMMddhhmmss */
const getCurrentCrossrefTimestamp = date => {
  const pad = val => (val < 10 ? `0${val}` : val.toString())

  const year = date.getUTCFullYear()
  const month = date.getUTCMonth() + 1 // +1 because month is zero-based
  const day = date.getUTCDate()
  const hour = date.getUTCHours()
  const minute = date.getUTCMinutes()
  const second = date.getUTCSeconds()

  return `${year}${pad(month)}${pad(day)}${pad(hour)}${pad(minute)}${pad(
    second,
  )}`
}

/** Get the list of citations as a fragment of Crossref-flavoured XML.
 * Citations are read from HTML, from submission.references, with one citation expected per paragraph. */
const getCitations = manuscript => {
  const rawCitationBlock = manuscript.submission.references

  let citations = []

  if (typeof rawCitationBlock === 'string') {
    citations = getCrossrefCitationsFromList(rawCitationBlock)
  }

  if (!citations || !citations.length) return null

  return citations
    .map(
      (c, i) =>
        `<citation key="${i}"><unstructured_citation>${c}</unstructured_citation></citation>`,
    )
    .join('')
}

/** Used to get a review or submission field
 * checking decision.jsonData[fieldName] or manuscript.submission[fieldName] */
const getReviewOrSubmissionField = (manuscript, fieldName) => {
  const decision = manuscript.reviews.find(r => r.isDecision)
  const decisionField = decision ? decision.jsonData[fieldName] : null

  if (decision && decisionField) {
    return decisionField
  }

  if (manuscript.submission[fieldName]) {
    return manuscript.submission[fieldName]
  }

  return null
}

/** Get DOI in form 10.12345/<suffix>
 * If the configured prefix includes 'https://doi.org/' and/or a trailing slash, these are dealt with gracefully. */
const getDoi = (suffix, activeConfig) => {
  let prefix = activeConfig.formData.publishing.crossref.doiPrefix
  if (!prefix) throw new Error('No DOI prefix configured.')
  if (prefix.startsWith(DOI_PATH_PREFIX))
    prefix = prefix.replace(DOI_PATH_PREFIX, '')
  if (prefix.endsWith('/')) prefix = prefix.replace('/', '')
  if (!/^10\.\d{4,9}$/.test(prefix))
    throw new Error(
      `Unrecognised DOI prefix "${activeConfig.formData.publishing.crossref.doiPrefix}"`,
    )
  return `${prefix}/${suffix}`
}

const getContributor = (author, isAdditional) => {
  if (!author.firstName || !author.lastName)
    throw new Error(`Incomplete author record ${JSON.stringify(author)}`)

  const contributor = {
    person_name: {
      $: {
        contributor_role: 'author',
        sequence: isAdditional ? 'additional' : 'first',
      },
      given_name: author.firstName,
      surname: author.lastName,
    },
  }

  if (author.affiliation)
    contributor.person_name.affiliation = author.affiliation
  return contributor
}

/** Gets issueYear from submission.issueYear or failing that, from submission.volumeNumber.
 * Checks that the year looks sensible (in range 2000-2099)
 */
const getIssueYear = manuscript => {
  let yearString = manuscript.submission.$issueYear
  if (typeof yearString !== 'string')
    throw new Error('Could not determine issue year')
  yearString = yearString.trim()

  // Only works for years 2000-2099
  if (!/^20\d\d$/.test(yearString))
    throw new Error(
      `Issue year '${yearString}' does not appear to be a valid year.`,
    )
  return yearString
}

const checkIfRequiredFieldsArePublishable = (
  manuscript,
  submissionForm,
  fields,
) => {
  const fieldConfigurations = fields.map(fieldName =>
    submissionForm?.structure?.children.find(item => item.name === fieldName),
  )

  let shouldAllowPublish = true

  fieldConfigurations.forEach(field => {
    if (
      field?.permitPublishing !== 'always' &&
      (field?.permitPublishing !== 'true' ||
        !manuscript.formFieldsToPublish
          .find(ff => ff.objectId === manuscript.id)
          ?.fieldsToPublish?.includes(field.name))
    ) {
      shouldAllowPublish = false
    }
  })
  return shouldAllowPublish
}

/** Returns true if a DOI is not already in use.
 * It will also return true if the Crossref server is faulty or down, so that form submission is not prevented.
 */
const doiIsAvailable = async checkDOI => {
  try {
    // Try to find object listed at DOI
    await axios.get(`https://api.crossref.org/works/${checkDOI}/agency`)
    // eslint-disable-next-line no-console
    console.log(
      `DOI '${checkDOI}' is already taken. Custom suffix is unavailable.`,
    )
    return false // DOI is already in use
  } catch (err) {
    if (err.response.status === 404) {
      // HTTP 404 "Not found" response. The DOI is not known by Crossref
      // console.log(`DOI '${checkDOI}' is available.`)
      return true
    }
    // Unexpected HTTP response (5xx)
    // Assume that the DOI is available, otherwise server errors at crossref will prevent form submission in Kotahi

    return true
  }
}

/** Returns true if the DOI is registered with Crossref.
 * It will also return true if the Crossref server is faulty or down, so that form submission is not prevented.
 */
const doiExists = async checkDOI => {
  try {
    // Try to find object listed at DOI
    await axios.get(`https://api.crossref.org/works/${checkDOI}/agency`)
    return true
  } catch (err) {
    if (err && err.response && err.response.status === 404) {
      // HTTP 404 "Not found" response. The DOI is not known by Crossref
      // console.log(`DOI '${checkDOI}' is available.`)
      return false
    }
    // Unexpected response (e.g. HTTP 5xx)
    // Assume that the DOI exists, otherwise server errors at crossref will prevent form submission in Kotahi

    return true
  }
}

const emailRegex =
  /^[\p{L}\p{N}!/+\-_]+(\.[\p{L}\p{N}!/+\-_]+)*@[\p{L}\p{N}!/+\-_]+(\.[\p{L}_-]+)+$/u

/** Send submission to register an article, with appropriate metadata */
const publishArticleToCrossref = async manuscript => {
  let publishedDomain = config.get('flax-site').clientFlaxSiteUrl
  const activeConfig = await Config.getCached(manuscript.groupId)
  const group = await Group.query().findById(manuscript.groupId).first()

  const {
    formData: {
      publishing: { crossref },
      groupIdentity,
    },
  } = activeConfig

  const {
    depositorEmail,
    journalHomepage,
    depositorName,
    registrant,
    publishedArticleLocationPrefix,
  } = crossref

  if (publishedArticleLocationPrefix && publishedArticleLocationPrefix !== '') {
    publishedDomain = publishedArticleLocationPrefix
  }

  const {
    journalAbbreviatedName,
    licenseUrl,
    title: journalName,
  } = groupIdentity

  const { submission, shortId, id } = manuscript

  const {
    $title,
    $abstract,
    $authors,
    $issueYear,
    $issueNumber,
    $volumeNumber,
    $doi,
  } = submission

  if (!submission) throw new Error('Manuscript has no submission object')
  if (!$title) throw new Error('Manuscript has no submission.$title')
  if (!$abstract) throw new Error('Manuscript has no submission.$abstract')
  if (!$authors) throw new Error('Manuscript has no submission.$authors field')
  if (!$issueYear)
    throw new Error('Manuscript has no submission.$issueYear field')
  if (!$issueNumber)
    throw new Error('Manuscript has no submission.$issueNumber field')
  if (!$volumeNumber)
    throw new Error('Manuscript has no submission.$volumeNumber field')
  if (!Array.isArray($authors))
    throw new Error('Manuscript.submission.$authors is not an array')
  if (!emailRegex.test(depositorEmail))
    throw new Error(
      `Depositor email address "${depositorEmail}" is misconfigured`,
    )

  if (!journalName) {
    throw new Error(`Journal Name should be defined`)
  }

  const submissionForm = await getSubmissionForm(manuscript.groupId)

  if (
    !checkIfRequiredFieldsArePublishable(manuscript, submissionForm, [
      'submission.$title',
      'submission.$abstract',
      'submission.$issueNumber',
      'submission.$issueYear',
      'submission.$volumeNumber',
    ])
  ) {
    throw new Error(
      `Check your submission form configuration as some required fields are not publishable`,
    )
  }

  const issueYear = getIssueYear(manuscript)
  const publishDate = new Date()
  const journalDoi = getDoi(0, activeConfig)

  const doi =
    $doi ||
    getDoi(
      getReviewOrSubmissionField(manuscript, '$doiSuffix') || id,
      activeConfig,
    )

  if (!(await doiIsAvailable(doi))) throw Error('Custom DOI is not available.')

  const batchId = uuid()
  const citations = getCitations(manuscript)

  // Caution! Our json object must have properties in the correct order, and no undefined properties!

  const journal = {
    journal_metadata: {
      full_title: journalName,
      abbrev_title: journalAbbreviatedName,
      doi_data: {
        doi: journalDoi,
        resource: journalHomepage,
      },
    },
    journal_issue: {
      publication_date: { year: issueYear },
    },
    journal_article: {
      titles: { title: $title },
      contributors: {
        // This seems really counterintuitive but it's how xml2js requires it
        person_name: $authors.map(
          (author, i) => getContributor(author, i).person_name,
        ),
      },
      abstract: {
        $: { xmlns: 'http://www.ncbi.nlm.nih.gov/JATS1' },
        _: ABSTRACT_PLACEHOLDER,
      },
      publication_date: {
        month: publishDate.getUTCMonth() + 1, // +1 because the month is zero-based
        day: publishDate.getUTCDate(),
        year: publishDate.getUTCFullYear(),
      },
      publisher_item: {
        item_number: {
          $: { item_number_type: 'institution' },
          _: shortId,
        },
      },
    },
  }

  if ($issueNumber) {
    if ($volumeNumber)
      journal.journal_issue.journal_volume = {
        volume: $volumeNumber,
      }
    journal.journal_issue.issue = $issueNumber
  }

  if (licenseUrl)
    journal.journal_article.program = {
      $: {
        name: 'AccessIndicators',
        xmlns: 'http://www.crossref.org/AccessIndicators.xsd',
      },
      license_ref: licenseUrl,
    }

  journal.journal_article.doi_data = {
    doi,
    resource: `${publishedDomain}/${group.name}/articles/${shortId}/index.html`,
  }

  if (citations) journal.journal_article.citation_list = CITATIONS_PLACEHOLDER

  const json = {
    doi_batch: {
      $: {
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        'xsi:schemaLocation':
          'http://www.crossref.org/schema/4.4.2 http://www.crossref.org/schema/crossref4.4.2.xsd',
        xmlns: 'http://www.crossref.org/schema/4.4.2',
        version: '4.4.2',
        'xmlns:ai': 'http://www.crossref.org/AccessIndicators.xsd',
      },
      head: {
        doi_batch_id: batchId,
        timestamp: getCurrentCrossrefTimestamp(publishDate),
        depositor: {
          depositor_name: depositorName,
          email_address: depositorEmail,
        },
        registrant,
      },
      body: {
        journal,
      },
    },
  }

  const xml = builder
    .buildObject(json)
    .replace(ABSTRACT_PLACEHOLDER, htmlToJats($abstract))
    .replace(CITATIONS_PLACEHOLDER, citations)

  const dirName = `${+new Date()}-${id}`
  await fsPromised.mkdir(dirName)
  const fileName = `submission-${batchId}.xml`
  await fsPromised.appendFile(`${dirName}/${fileName}`, xml)

  const fileContent = await fsPromised.readFile(
    `${dirName}/${fileName}`,
    'utf-8',
  )

  // eslint-disable-next-line
  console.log(fileContent)
  const filePath = `${dirName}/${fileName}`
  await requestToCrossref([filePath], activeConfig)

  // eslint-disable-next-line
  console.log(dirName)
  // await fs.rmdirSync(dirName, { recursive: true })
}

const populateUserInfo = async userIds => {
  const systemUsers = await User.query().findByIds(userIds)
  return Promise.all(systemUsers?.map(async user => fetchUserDetails(user)))
}

const filterFieldsBasedOnPublishableCriteria = (
  manuscript,
  review,
  children,
) => {
  return children.filter(
    item =>
      (review.jsonData[item.name] && // Checking that the review/decision actually contains data in this field
        item.permitPublishing === 'always') ||
      (item.permitPublishing === 'true' &&
        manuscript.formFieldsToPublish
          .find(ff => ff.objectId === review.id)
          ?.fieldsToPublish?.includes(item.name)),
  )
}

const publishReviewsToCrossref = async manuscript => {
  const activeConfig = await Config.getCached(manuscript.groupId)

  const decisionForm = await getDecisionForm(manuscript.groupId)
  const reviewForm = await getReviewForm(manuscript.groupId)

  const group = await Group.query().findById(manuscript.groupId).first()

  let publishedDomain = config.get('flax-site').clientFlaxSiteUrl

  const {
    formData: {
      publishing: { crossref },
    },
  } = activeConfig

  const {
    depositorEmail,
    depositorName,
    registrant,
    publishedArticleLocationPrefix,
  } = crossref

  if (publishedArticleLocationPrefix && publishedArticleLocationPrefix !== '') {
    publishedDomain = publishedArticleLocationPrefix
  }

  const { submission, shortId, id: manuscriptId } = manuscript

  const { $title, $doi } = submission

  if (!$doi) throw new Error('Field submission.$doi is not present')

  if (!config.get('flax-site').clientFlaxSiteUrl) {
    throw new Error('Flax should be configured and running')
  }

  const batchId = uuid()
  const publishDate = new Date()

  const filteredReviews = manuscript.reviews.filter(review => {
    const { isDecision, isHiddenFromAuthor } = review
    const isHidden = isHiddenFromAuthor === null || isHiddenFromAuthor === true

    const reviewFormPublishableFields = filterFieldsBasedOnPublishableCriteria(
      manuscript,
      review,
      reviewForm?.structure?.children,
    )

    const decisionFormPublishableFields =
      filterFieldsBasedOnPublishableCriteria(
        manuscript,
        review,
        decisionForm?.structure?.children,
      )

    if (
      decisionFormPublishableFields.length === 0 &&
      reviewFormPublishableFields.length === 0
    ) {
      throw new Error(
        'Your form configuration for Review and Decision does not allow publishing to external providers',
      )
    }

    if (!isDecision && reviewFormPublishableFields.length > 0 && !isHidden) {
      return true
    }

    if (isDecision && decisionFormPublishableFields.length > 0) {
      return true
    }

    return false
  })

  if (filteredReviews.length === 0) {
    throw new Error(
      'No reviews available to publish! If you can see reviews/decision please check Review and Decision forms to verify that there are publishable fields ',
    )
  }

  const reviewsToPublish = await Promise.all(
    filteredReviews.map(async review => {
      const reviewDOI = getDoi(review.id, activeConfig)
      // if (!(await doiIsAvailable(reviewDOI)))
      //   throw Error('Custom DOI is not available.')

      const descriptionStart = review.isDecision
        ? 'Editorial assessment of'
        : 'Referee report of'

      let users

      if (review.isDecision) {
        const [editor] = await Manuscript.getEditorIds(manuscriptId)

        if (editor) {
          users = await populateUserInfo([editor])
        }
      } else if (!review.isHiddenReviewerName && review.userId) {
        users = await populateUserInfo([review.userId])
      }

      return {
        $: {
          stage: 'pre-publication',
          type: review.isDecision ? 'aggregate' : 'referee-report',
        },
        ...(users && {
          contributors: {
            person_name: users.map((user, i) => {
              return {
                $: {
                  sequence: i === 0 ? 'first' : 'additional',
                  contributor_role: review.isDecision ? 'editor' : 'reviewer',
                },
                given_name: user.firstName,
                surname: user.lastName,
              }
            }),
          },
        }),
        titles: { title: `Editorial Assessment: ${$title}` },
        review_date: {
          month: review.created.getUTCMonth() + 1, // +1 because the month is zero-based
          day: review.created.getUTCDate(),
          year: review.created.getUTCFullYear(),
        },
        program: {
          $: { xmlns: 'http://www.crossref.org/relations.xsd' },
          related_item: {
            description: `${descriptionStart} ${$title}`,
            inter_work_relation: {
              $: {
                'relationship-type': 'isReviewOf',
                'identifier-type': 'doi',
              },
              _: $doi,
            },
          },
        },
        doi_data: {
          doi: reviewDOI,
          resource: `${publishedDomain}/${group.name}/articles/${shortId}/index.html#review-${review.id}`,
        },
      }
    }),
  )

  if (reviewsToPublish.length === 0) {
    throw new Error(
      'Your form configuration for Review and Decision does not allow publishing to external providers',
    )
  }

  const json = {
    doi_batch: {
      $: {
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        'xsi:schemaLocation':
          'http://www.crossref.org/schema/5.3.0 https://www.crossref.org/schemas/crossref5.3.0.xsd',
        xmlns: 'http://www.crossref.org/schema/5.3.0',
        version: '5.3.0',
        'xmlns:ai': 'http://www.crossref.org/AccessIndicators.xsd',
      },
      head: {
        doi_batch_id: batchId,
        timestamp: getCurrentCrossrefTimestamp(publishDate),
        depositor: {
          depositor_name: depositorName,
          email_address: depositorEmail,
        },
        registrant,
      },
      body: {
        peer_review: reviewsToPublish,
      },
    },
  }

  const xml = builder.buildObject(json)

  const dirName = `${+new Date()}-${manuscript.id}-peer_reviews`
  await fsPromised.mkdir(dirName)
  const fileName = `submission-${batchId}.xml`
  await fsPromised.appendFile(`${dirName}/${fileName}`, xml)

  const fileContent = await fsPromised.readFile(
    `${dirName}/${fileName}`,
    'utf-8',
  )

  // eslint-disable-next-line
  console.log(fileContent)
  const filePath = `${dirName}/${fileName}`
  await requestToCrossref([filePath], activeConfig)

  // eslint-disable-next-line
  console.log(filePath)
  // return fs.rmdirSync(dirName, { recursive: true })
}

module.exports = {
  publishToCrossref,
  getReviewOrSubmissionField,
  getDoi,
  doiIsAvailable,
  doiExists,
}
