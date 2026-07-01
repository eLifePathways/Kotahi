/* eslint-disable react/prop-types */
import { useState } from 'react'
import { Formik } from 'formik'
import { useTranslation } from 'react-i18next'
import Modal from '../../../../component-modal/src/Modal'
import {
  ErrorMessageWrapper,
  Legend,
} from '../../../../component-formbuilder/src/components/style'
import { ActionButton, Alert, Section, TextInput } from '../../../../shared'
import ValidatedField from '../../../../component-submit/src/components/ValidatedField'

const EditPayloadModal = ({ isOpen, onClose, onSubmit, originalMessage }) => {
  const { t } = useTranslation()
  const [errorMessage, setErrorMessage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const { id, payload } = originalMessage
  const initialValues = { payload: JSON.stringify(payload, null, 2) }

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (values, actions) => {
        setIsSubmitting(true)
        setErrorMessage(null)

        const { reason, success } = await onSubmit({ ...values, id })

        if (success) {
          actions.resetForm()
          onClose()
        } else {
          setErrorMessage(reason)
        }

        setIsSubmitting(false)
      }}
    >
      {({ errors, handleSubmit, setFieldValue }) => {
        const formIsValid = !Object.keys(errors).length
        const { payload: payloadFieldError } = errors || {}
        let submitButtonStatus = null

        if (isSubmitting) {
          submitButtonStatus = 'pending'
        } else if (errorMessage) {
          submitButtonStatus = 'failure'
        }

        // const textField = <TextField

        return (
          <form onSubmit={handleSubmit}>
            <Modal
              contentStyles={{ minWidth: '800px' }}
              isOpen={isOpen}
              leftActions={
                !formIsValid && (
                  <ErrorMessageWrapper>
                    {payloadFieldError ??
                      t('coarNotifyInboxPage.correctPayload')}
                  </ErrorMessageWrapper>
                )
              }
              onClose={onClose}
              rightActions={
                <>
                  <ActionButton
                    onClick={handleSubmit}
                    primary
                    status={submitButtonStatus}
                    type="submit"
                  >
                    {t('coarNotifyInboxPage.resendPayload')}
                  </ActionButton>
                  <ActionButton disabled={isSubmitting} onClick={onClose}>
                    {t('common.Cancel')}
                  </ActionButton>
                </>
              }
              shouldCloseOnOverlayClick={false}
              title={t('coarNotifyInboxPage.editCoarPayloadTitle')}
            >
              <Section>
                <Alert
                  bottomMargin={4}
                  message={t('coarNotifyInboxPage.modalDescription')}
                  showIcon
                  type="warning"
                />
                <Legend>{t('coarNotifyInboxPage.payload')}</Legend>
                <ValidatedField
                  as="textarea"
                  component={TextInput}
                  name="payload"
                  onChange={val =>
                    setFieldValue(
                      'payload',
                      val.target ? val.target.value : val,
                    )
                  }
                  style={{
                    fontFamily: 'monospace',
                    height: 'auto',
                    minHeight: '400px',
                    padding: '8px',
                  }}
                  validate={value => {
                    try {
                      JSON.parse(value)
                    } catch (e) {
                      // e.message is like: "Unexpected token '}' at position 42"
                      const match = e.message.match(/position (\d+)/)

                      if (match) {
                        const pos = parseInt(match[1], 10)

                        const line =
                          (value.slice(0, pos).match(/\n/g) || []).length + 1

                        return `Invalid JSON: ${e.message} (line ${line})`
                      }

                      return `Invalid JSON: ${e.message}`
                    }

                    return false
                  }}
                />
                {errorMessage && (
                  <Alert
                    //   bottomMargin={4}
                    description={errorMessage}
                    showIcon
                    type="error"
                  />
                )}
              </Section>
            </Modal>
          </form>
        )
      }}
    </Formik>
  )
}

export default EditPayloadModal
