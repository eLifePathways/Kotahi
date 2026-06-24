/* eslint-disable default-param-last */
/* eslint-disable import/namespace */

import * as validators from '../components/xpub-validators/src'
import { validateAuthors } from './authorsFieldDefinitions'
import { validateDoiField } from './doiFieldDefinition'

export const validateFormField =
  (
    vld = [],
    valueField = {},
    fieldName,
    doiValidation = false,
    doiUniqueSuffixValidation = false,
    validateDoi,
    validateSuffix,
    validationOrcid,
    componentType,
    threadedDiscussionProps,
  ) =>
  async value => {
    const validator = vld || []

    if (componentType === 'AuthorsInput') {
      if (
        validator.some(v => v.value === 'required') &&
        (value || []).length <= 0
      )
        return 'Required'

      return await validateAuthors(value, validationOrcid)
    }

    if (componentType === 'DoisInput') {
      if (
        validator.some(v => v.value === 'required') &&
        (value || []).length <= 0
      )
        return 'Required'
      if (value && doiValidation) return validateDoiField(value)
    }

    if (
      componentType === 'ThreadedDiscussion' &&
      validator.some(v => v.value === 'required')
    ) {
      let isThreadedDiscussionValid = false
      const threadedDiscussion = threadedDiscussionProps?.threadedDiscussion

      if (threadedDiscussion) {
        const firstComment = threadedDiscussion.threads?.[0].comments?.[0]

        const commentVersionsLength = firstComment?.commentVersions.length

        if (
          firstComment?.pendingVersion &&
          firstComment?.pendingVersion.comment !== '<p class="paragraph"></p>'
        ) {
          isThreadedDiscussionValid = true
        }

        if (
          commentVersionsLength &&
          firstComment?.commentVersions[commentVersionsLength - 1]
        ) {
          isThreadedDiscussionValid = true
        }
      }

      if (isThreadedDiscussionValid) {
        return undefined
      }

      return 'Required'
    }

    const errors = validator
      .map(v => v.value)
      .map(validatorFn => {
        // if there is YSWYG component and it's empty - the value is a paragraph
        const valueFormatted =
          componentType === 'AbstractEditor' &&
          ['<p></p>', '<p class="paragraph"></p>'].includes(value)
            ? ''
            : value

        if (validatorFn === 'required')
          return validators[validatorFn](valueFormatted)

        if (!valueField) return null
        return validators[validatorFn](valueField[validatorFn])(valueFormatted)
      })
      .filter(Boolean)

    if (errors.length) return errors[0]

    if (value && doiValidation) {
      return validateDoi(value)
    }

    if (value && doiUniqueSuffixValidation) {
      return validateSuffix(value)
    }

    return undefined
  }
