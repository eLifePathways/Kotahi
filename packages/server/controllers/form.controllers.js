const { NotFoundError } = require('@coko/server')
const { mergeWith } = require('lodash')

const { Form } = require('../models')

const createForm = async form => {
  return Form.query().insertAndFetch(form)
}

const deleteForm = async formId => {
  await Form.query().deleteById(formId)
  return { query: {} }
}

const deleteFormElement = async (formId, elementId) => {
  const form = await Form.findById(formId)

  if (!form) return null
  form.structure.children = form.structure.children.filter(
    child => child.id !== elementId,
  )

  const formRes = await Form.query().patchAndFetchById(formId, {
    structure: form.structure,
  })

  return formRes
}

const formForPurposeAndCategory = async (purpose, category, groupId) => {
  const form = await Form.query().findOne({
    purpose,
    category,
    groupId,
  })

  if (!form) {
    throw notFoundError(
      'Category and purpose',
      `${purpose} ${category}`,
      this.name,
    )
  }

  // TODO Remove this once the form-builder no longer permits incomplete/malformed fields.
  form.structure.children = form.structure.children.filter(
    field => field.component && field.name,
  )

  return form
}

const getActiveForms = async groupId => {
  const forms = await Form.query()
    .where({ category: 'submission', purpose: 'submit', groupId })
    .orWhere({ category: 'review', purpose: 'review', groupId })
    .orWhere({ category: 'decision', purpose: 'decision', groupId })

  return {
    submissionForm: forms.find(f => f.purpose === 'submit'),
    reviewForm: forms.find(f => f.purpose === 'review'),
    decisionForm: forms.find(f => f.purpose === 'decision'),
  }
}

const getFormById = async formId => {
  return Form.findById(formId)
}

const getForms = async () => {
  return Form.query()
}

const getFormsByCategory = async (category, groupId) => {
  return Form.query().where({
    category,
    groupId,
  })
}

const notFoundError = (property, value, className) =>
  new NotFoundError(`Object not found: ${className} with ${property} ${value}`)

const updateForm = async form => {
  const originalForm = await Form.findById(form.id)

  const s3Components =
    originalForm.structure?.children?.filter(
      c => c.uploadAttachmentSource === 'external',
    ) || []

  const s3ComponentIds = s3Components.map(s => s.id)

  form.structure.children = form.structure.children.map(c => {
    if (s3ComponentIds.includes(c.id) && !c.s3AccessId && !c.s3AccessToken) {
      const originalCredentials = s3Components.find(s => s.id === c.id)

      return {
        ...c,
        s3AccessId: originalCredentials.s3AccessId,
        s3AccessToken: originalCredentials.s3AccessToken,
      }
    }

    return c
  })

  const result = await Form.query().patchAndFetchById(form.id, form)

  const purposeIndicatingActiveForm =
    result.category === 'submission' ? 'submit' : result.category

  const thisFormIsActive = result.purpose === purposeIndicatingActiveForm

  if (thisFormIsActive) {
    // Ensure all other forms in this category are inactive
    await Form.query()
      .patch({ purpose: 'other' })
      .whereNot({ purpose: 'other' })
      .where({ category: result.category, groupId: result.groupId })
      .whereNot({ id: result.id })
  }

  return result
}

const updateFormElement = async (element, formId) => {
  const form = await Form.findById(formId)
  if (!form) return null

  if (element.name === '$verdict' && Array.isArray(element.options)) {
    element.options = element.options.map(option => ({
      ...option,
      value: option.value.trim(),
    }))
  }

  const indexToReplace = form.structure.children.findIndex(
    field => field.id === element.id,
  )

  let name = null

  if (indexToReplace > 0) {
    name = form.structure.children[indexToReplace].name
  }

  const customMerge = (objValue, srcValue) => {
    // If both are arrays, return the updated array (srcValue)
    if (Array.isArray(srcValue)) {
      return srcValue
    }

    return undefined
  }

  if (indexToReplace < 0) form.structure.children.push(element)
  else {
    if (
      element.uploadAttachmentSource === 'external' &&
      (!element.s3AccessId || !element.s3AccessToken)
    ) {
      const { s3AccessId, s3AccessToken } =
        form.structure.children[indexToReplace]

      element.s3AccessId = s3AccessId
      element.s3AccessToken = s3AccessToken
    }

    form.structure.children[indexToReplace] =
      element.name === name
        ? mergeWith(
            form.structure.children[indexToReplace],
            element,
            customMerge,
          )
        : element
  }

  return Form.query().patchAndFetchById(formId, {
    structure: form.structure,
  })
}

module.exports = {
  createForm,
  deleteForm,
  deleteFormElement,
  formForPurposeAndCategory,
  getActiveForms,
  getFormById,
  getForms,
  getFormsByCategory,
  updateForm,
  updateFormElement,
}
