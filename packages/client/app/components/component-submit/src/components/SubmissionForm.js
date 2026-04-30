/* eslint-disable react/prop-types */

import { useTranslation } from 'react-i18next'
import { SectionContent } from '../../../shared'
import FormTemplate from './FormTemplate'
import { articleStatuses } from '../../../../globals'

const SubmissionForm = ({
  versionValues,
  form,
  onSubmit,
  onChange,
  republish,
  match,
  manuscript,
  createFile,
  deleteFile,
  setShouldPublishField,
  threadedDiscussionProps,
  validateDoi,
  validateSuffix,
  validationOrcid,
}) => {
  const { t } = useTranslation()

  let submissionButtonText = t('manuscriptSubmit.Submit your research object')
  let submitButtonShouldRepublish = false

  if (match.url.includes('/evaluation')) {
    if (manuscript.status === articleStatuses.published) {
      submitButtonShouldRepublish = true
      submissionButtonText = 'Republish'
    } else submissionButtonText = 'Submit Evaluation'
  }

  return (
    <SectionContent>
      <FormTemplate
        createFile={createFile}
        deleteFile={deleteFile}
        fieldsToPublish={
          manuscript.formFieldsToPublish.find(
            ff => ff.objectId === manuscript.id,
          )?.fieldsToPublish ?? []
        }
        form={form}
        initialValues={versionValues}
        isSubmission
        manuscriptId={manuscript.id}
        manuscriptShortId={manuscript.shortId}
        manuscriptStatus={manuscript.status}
        onChange={(value, path) => {
          onChange(value, path, manuscript.id)
        }}
        onSubmit={async (values, { validateForm, setSubmitting }) => {
          // TODO: Change this to a more Formik idiomatic form
          const isValid = Object.keys(await validateForm()).length === 0
          return isValid
            ? onSubmit(manuscript.id, values) // values are currently ignored!
            : setSubmitting(false)
        }}
        republish={submitButtonShouldRepublish && republish}
        setShouldPublishField={async (fieldName, shouldPublish) =>
          setShouldPublishField({
            variables: {
              manuscriptId: manuscript.id,
              objectId: manuscript.id,
              fieldName,
              shouldPublish,
            },
          })
        }
        shouldShowOptionToPublish={!!setShouldPublishField}
        showEditorOnlyFields={false}
        submissionButtonText={submissionButtonText}
        threadedDiscussionProps={threadedDiscussionProps}
        validateDoi={validateDoi}
        validateSuffix={validateSuffix}
        validationOrcid={validationOrcid}
      />
    </SectionContent>
  )
}

export default SubmissionForm
