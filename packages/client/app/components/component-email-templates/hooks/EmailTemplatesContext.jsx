/* eslint-disable react-hooks/exhaustive-deps, react-hooks/use-memo */
/* eslint-disable react/prop-types */

import { createContext, useContext, useCallback, useMemo } from 'react'
import debounce from 'lodash/debounce'
import { useTranslation } from 'react-i18next'
import useEmailTemplates from './useEmailTemplates'
import { AUTOSAVE_DELAY, CC_ERROR, DESCRIPTION_ERROR } from '../misc/constants'
import {
  getEmailContentFrom,
  validateCC,
  validateDescription,
} from '../misc/utils'
import { objIf } from '../../../shared/generalUtils'
import { useBool, useObject, useString } from '../../../hooks/dataTypeHooks'

const EmailTemplatesContext = createContext()

const SAVED_STATE_OPTIONS = {
  values: ['', 'success', 'pending'],
}

export const EmailTemplatesProvider = ({ children }) => {
  const { t } = useTranslation()
  const activeTemplate = useObject()
  const deleteModalState = useBool()
  const savedState = useString('', SAVED_STATE_OPTIONS)

  const { createTemplate, deleteTemplate, updateTemplate, templatesData } =
    useEmailTemplates({
      onFetch: ({ emailTemplates }) => {
        if (!emailTemplates?.length) return
        activeTemplate.update(emailTemplates[0])
      },
      onCreate: ({ createEmailTemplate }) => {
        const { emailTemplate } = createEmailTemplate ?? {}
        activeTemplate.update(emailTemplate)
      },
      onDelete: () => {
        activeTemplate.update(emailTemplates[0])
      },
    })

  const { data, loading, error } = templatesData ?? {}
  const { emailTemplates } = data ?? {}

  const isDraft = !activeTemplate.state?.id

  const handleSave = formData => {
    const { id } = activeTemplate.state
    const emailContent = getEmailContentFrom(formData)
    const variables = { input: { id, emailContent } }
    savedState.set('pending')
    updateTemplate({ variables })
    savedState.set('success')
  }

  const handleCreate = formData => {
    const emailContent = getEmailContentFrom(formData)
    const variables = { input: { emailContent } }
    createTemplate({ variables })
  }

  const handleDelete = () => {
    deleteTemplate({ variables: { id: activeTemplate.state.id } })
    deleteModalState.off()
  }

  const handleValidate = ({ description, cc }) => {
    const descriptionExists = validateDescription(
      description,
      activeTemplate.state?.emailContent?.description,
      emailTemplates,
    )

    const invalidEmails = cc && validateCC(cc)

    if (!descriptionExists && !invalidEmails) return {}

    const errors = {
      ...objIf(descriptionExists, { description: t(DESCRIPTION_ERROR) }),
      ...objIf(invalidEmails, { cc: t(CC_ERROR) }),
    }

    return errors
  }

  const handleSubmit = isDraft ? handleCreate : handleSave

  const autoSave = useCallback(
    debounce((id, input) => {
      if (isDraft) return
      updateTemplate({ variables: { input: { ...input, id } } })
    }, AUTOSAVE_DELAY),
    [JSON.stringify(activeTemplate.state)],
  )

  const context = useMemo(
    () => ({
      error,
      loading,
      emailTemplates,
      activeTemplate,
      isDraft,
      deleteModalState,
      savedState,
      autoSave,
      handleSubmit,
      handleDelete,
      handleValidate,
      t,
    }),
    [
      error,
      loading,
      emailTemplates,
      activeTemplate,
      isDraft,
      deleteModalState,
      savedState,
      autoSave,
      handleSubmit,
      handleDelete,
      handleValidate,
    ],
  )

  return (
    <EmailTemplatesContext.Provider value={context}>
      {children}
    </EmailTemplatesContext.Provider>
  )
}

/**
 * @typedef {object} EmailTemplatesContextValue
 * @property {import('../../../hooks/dataTypeHooks').UseObjectReturn} activeTemplate - The active email template object state.
 * @property {Array} emailTemplates - The list of email templates.
 * @property {boolean} loading - The loading state.
 * @property {object} error - The error state.
 * @property {import('../../../hooks/dataTypeHooks').UseBoolReturn} deleteModalState - The boolean state of the delete modal.
 * @property {function} handleDelete - Function to handle deleting a template.
 * @property {function} autoSave - Function to handle auto-saving a template.
 * @property {function} handleSubmit - Function to create or save depending if template is new.
 * @property {function} handleValidate - Function to handle validating a template.
 * @property {import('../../../hooks/dataTypeHooks').useStringReturn} savedState - The string state of the updateTemplate mutation ['success', 'pending'].
 * @property {boolean} isDraft - Boolean indicating if the activeTemplate is not stored on the db yet, true when activeTemplate has no ID.
 * @property {function} t - from 'react-i18next' useTranslation() hook.
 */

/**
 * Custom hook to access the EmailTemplatesContext.
 *
 * @returns {EmailTemplatesContextValue} context - The context value.
 */
export const useEmailTemplatesContext = () => useContext(EmailTemplatesContext)
