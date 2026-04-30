/* eslint-disable no-await-in-loop */
const { useTransaction, logger } = require('@coko/server')
const { chunk } = require('lodash')

// Paths are relative to the generated migrations folder
const Form = require('../form.model')
const Group = require('../../group/group.model')
const Config = require('../../config/config.model')
const Manuscript = require('../../manuscript/manuscript.model')
const Review = require('../../review/review.model')

const fieldNameMap = {
  'meta.title': 'submission.$title',
  'submission.title': 'submission.$title',
  'submission.description': 'submission.$title',
  'submission.articleDescription': 'submission.$title',
  'meta.abstract': 'submission.$abstract',
  'submission.abstract': 'submission.$abstract',
  'submission.citations': 'submission.references', // Not a "standard" field, but standardising nonetheless
  'submission.doiSuffix': 'submission.$doiSuffix',
  'submission.DOI': 'submission.$doi',
  'submission.doi': 'submission.$doi',
  'submission.articleURL': 'submission.$sourceUri', // Caution! elife uses this for DOI. We handle this with a special case below.
  'submission.biorxivURL': 'submission.$sourceUri',
  'submission.link': 'submission.$sourceUri',
  'submission.url': 'submission.$sourceUri',
  'submission.uri': 'submission.$sourceUri',
  'submission.authors': 'submission.$authors',
  'submission.authorNames': 'submission.$authors',
  'submission.labels': 'submission.$customStatus',
  'submission.label': 'submission.$customStatus',
  'submission.editDate': 'submission.$editDate',
  verdict: '$verdict',
  // Other fields referred to throughout the code, but not standardised for now, include:
  // submission.links
  // submission.references
  // submission.volumeNumber
  // submission.issueNumber
  // submission.issueYear
  // submission.journal
  // submission.objectType
  // submission.articleId (elife)
  // submission.review1
  // submission.review1date
  // submission.review1creator
  // submission.review1suffix
  // submission.summary
  // submission.summarydate
  // submission.summarycreator
  // submission.summarysuffix
  // submission.topic
  // submission.topics
  // submission.Funding
  // submission.AuthorCorrespondence
  // submission.competingInterests
  // submission.dateReceived
  // submission.dateAccepted
  // submission.datePublished
  // submission.initialTopicsOnImport
  // doi
  // pmid (pubmed ID)
  // authors
}

const getNewFieldName = (fieldName, instanceType) => {
  if (
    (instanceType === 'preprint1' || instanceType === 'elife') && // 'elife' is the old name and should no longer be used, but checking for paranoia
    fieldName === 'submission.articleURL'
  )
    return 'submission.$doi'
  return fieldNameMap[fieldName] || fieldName
}

const replaceFieldName = (field, instanceType) => {
  return {
    ...field,
    name: getNewFieldName(field.name, instanceType) || field.name,
  }
}

const tweakDataValueByField = (value, fieldName) => {
  if (fieldName === 'submission.$abstract' && Array.isArray(value))
    return value.join(' ') // Correcting for bug #628, whereby some abstracts were imported as arrays of strings
  if (fieldName === 'submission.$doi' && value.startsWith('https://doi.org/'))
    return value.split('https://doi.org/')[1]
  return value
}

const renameDataInManuscript = (manuscript, instanceType) => {
  const addedFields = new Set()

  const fieldEntries = Object.fromEntries(
    Object.entries(manuscript.meta)
      .map(([key, value]) => [`meta.${key}`, value])
      .concat(
        Object.entries(manuscript.submission).map(([key, value]) => [
          `submission.${key}`,
          value,
        ]),
      ),
  )

  Object.keys(fieldNameMap).forEach(key => {
    const value = fieldEntries[key]
    const newFieldName = getNewFieldName(key, instanceType)

    if (value && !addedFields.has(newFieldName)) {
      const newValue = tweakDataValueByField(value, newFieldName)
      if (!newValue) return // continue, rather than overwrite wth blank data
      delete fieldEntries[key]
      fieldEntries[newFieldName] = newValue
      addedFields.add(newFieldName) // To avoid overwriting. We have an order of precedence when two fields are mapped to the same standard field.
    }
  })

  const newMeta = {}
  const newSubmission = {}
  Object.entries(fieldEntries).forEach(([key, value]) => {
    if (key.startsWith('submission.')) {
      newSubmission[key.split('submission.')[1]] = value
    } else if (key.startsWith('meta.')) {
      newMeta[key.split('meta.')[1]] = value
    }
  })

  return {
    meta: newMeta,
    submission: JSON.stringify(newSubmission),
  }
}

const renameDataInReview = (review, instanceType) => {
  const newJsonData = { ...review.jsonData }
  Object.keys(fieldNameMap).forEach(key => {
    const value = review.jsonData[key]
    const newFieldName = getNewFieldName(key, instanceType)

    if (value && !newJsonData[newFieldName]) {
      const newValue = tweakDataValueByField(value, newFieldName)
      if (!newValue) return // continue, rather than overwrite wth blank data
      if (newFieldName !== key) delete newJsonData[key]
      newJsonData[newFieldName] = newValue
    }
  })
  return { jsonData: JSON.stringify(newJsonData) }
}

const renameDataInSomeManuscripts = async (
  someManuscripts,
  instanceName,
  trx,
) => {
  let updatedCount = 0

  await Promise.all(
    someManuscripts.map(async manuscript => {
      const delta = renameDataInManuscript(manuscript, instanceName)
      await Manuscript.query(trx).patchAndFetchById(manuscript.id, delta)
      updatedCount += 1
    }),
  )

  return updatedCount
}

const renameDataInSomeReviews = async (someReviews, instanceName, trx) => {
  let updatedCount = 0

  await Promise.all(
    someReviews.map(async review => {
      const delta = renameDataInReview(review, instanceName)
      await Review.query(trx).patchAndFetchById(review.id, delta)
      updatedCount += 1
    }),
  )

  return updatedCount
}

const updateConfig = async (config, instanceType, trx) => {
  let newColumns = config.formData.manuscript.tableColumns
    .split(',')
    .map(c => c.trim())
    .map(c => getNewFieldName(c, instanceType))

  // Turn submission.$title into titleAndAbstract unless the abstract is already displayed in its own column.
  // 'titleAndAbstract' is a special built-in column type that links the title to submission.$sourceUri if
  // available, and shows the submission.$abstract as a tooltip if available.
  if (!newColumns.includes('submission.$abstract')) {
    newColumns = newColumns.map(c => {
      if (c === 'submission.$title') return 'titleAndAbstract'
      return c
    })
  }

  await Config.query(trx).patchAndFetchById(config.id, {
    formData: {
      ...config.formData,
      manuscript: {
        ...config.formData.manuscript,
        tableColumns: newColumns.join(','),
      },
    },
  })
}

exports.up = async () => {
  return useTransaction(async trx => {
    const groups = await Group.query(trx)

    for (const group of groups) {
      const { id: groupId, name: groupName } = group
      const configs = await Config.query(trx).where({ groupId })
      const activeConfig = configs.find(x => x.active)
      const { instanceName } = activeConfig.formData

      const forms = await Form.query(trx).where({ groupId })
      logger.info(`Total forms in group ${groupName}: ${forms.length}`)

      await Promise.all(
        forms.map(async form => {
          form.structure.children = form.structure.children.map(field =>
            replaceFieldName(field, instanceName),
          )
          form.structure.haspopup = form.structure.haspopup ?? 'false'
          await Form.query(trx).patchAndFetchById(form.id, form)
        }),
      )

      let updatedManuscriptsCount = 0

      const manuscripts = await Manuscript.query(trx).where({ groupId })

      for (const someManuscripts of chunk(manuscripts, 10)) {
        updatedManuscriptsCount += await renameDataInSomeManuscripts(
          someManuscripts,
          instanceName,
          trx,
        )
      }

      logger.info(
        `Updated ${updatedManuscriptsCount} manuscripts in group ${groupName}`,
      )

      const reviews = await Manuscript.relatedQuery('reviews', trx).for(
        Manuscript.query().where({ groupId }),
      )

      for (const someReviews of chunk(reviews, 10)) {
        await renameDataInSomeReviews(someReviews, instanceName, trx)
      }

      for (const config of configs)
        await updateConfig(config, instanceName, trx)
    }
  })
}
