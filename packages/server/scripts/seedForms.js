/* eslint-disable no-console */

const Form = require('../models/form/form.model')

// TODO: come up with predefined generic forms based on workflows
const SUBMISSION_FORM_PATHS = {
  journal: '../config/storage/forms-journal/submit.json',
  prc: '../config/storage/forms-prc/submit.json',
  preprint1: '../config/storage/forms/submit.json',
  preprint2: '../config/storage/forms-preprint2/submit.json',
}

const REVIEW_FORM_PATH = '../config/storage/forms/review.json'
const DECISION_FORM_PATH = '../config/storage/forms/decison.json'

const tryAddForm = async (purpose, category, group, seedFilePath, options) => {
  const { trx } = options

  const hasForm = !!(
    await Form.query(trx).where({ purpose, category, groupId: group.id })
  ).length

  if (hasForm) {
    console.log(
      `    Form for ${category} already exists in database. Skipping.`,
    )
  } else {
    const formStructure = require(seedFilePath)

    const form = {
      purpose,
      structure: formStructure,
      category,
      groupId: group.id,
    }

    await Form.query(trx).insert(form)
    console.log(
      `    Added ${category} form from ${seedFilePath} for "${group.name}" group to database.`,
    )
  }
}

const seed = async (group, config, options) => {
  const { trx } = options

  await Promise.all([
    tryAddForm(
      'submit',
      'submission',
      group,
      SUBMISSION_FORM_PATHS[config.formData.instanceName],
      { trx },
    ),
    tryAddForm('review', 'review', group, REVIEW_FORM_PATH, { trx }),
    tryAddForm('decision', 'decision', group, DECISION_FORM_PATH, { trx }),
  ])
}

module.exports = seed
