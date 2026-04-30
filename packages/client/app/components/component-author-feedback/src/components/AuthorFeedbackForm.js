/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/prop-types */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Formik } from 'formik'
import { useMutation } from '@apollo/client'
import styled from 'styled-components'
import _ from 'lodash'

import {
  ActionButton,
  PaddedContent,
  FilesUpload,
  Attachment,
} from '../../../shared'
import { ValidatedFieldFormik } from '../../../pubsweet'
import SimpleWaxEditor from '../../../wax-collab/src/SimpleWaxEditor'
import { CREATE_FILE_MUTATION, DELETE_FILE_MUTATION } from '../../../../queries'
import SubmittedStatus from './SubmittedStatus'
import { Legend } from '../../../component-submit/src/style'

// Kept the file changes minimal with this single file can be split into separate files in further iterations for code optimization

export const ActionButtonContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: calc(8px * 2) calc(8px * 3);
`

export const FormActionButton = styled(ActionButton)`
  cursor: pointer;
  margin-right: 32px;
  min-width: 104px;
`
// Below are the used Components

const FileInputComponent = ({ entityId, disabled, ...restProps }) => {
  return (
    <FilesUpload
      acceptMultiple
      disabled={disabled}
      fieldName="files"
      fileType="authorFeedback"
      manuscriptId={entityId}
      {...restProps}
      onChange={() => {}}
    />
  )
}

const textInput = {
  component: SimpleWaxEditor,
  label: 'Text',
  name: 'text',
  type: 'text',
  otherProps: {},
}

const filesInput = {
  component: FileInputComponent,
  label: 'Attachments',
  name: 'fileIds',
  type: 'file',
  otherProps: {},
}

const required = value => {
  if (
    value === undefined ||
    value === '' ||
    ['<p></p>', '<p class="paragraph"></p>'].includes(value)
  ) {
    return 'Required'
  }

  return undefined
}

const AuthorFeedbackForm = ({
  currentUser,
  manuscript,
  submitAuthorProofingFeedback,
  isReadOnly,
}) => {
  const { authorFeedback, files: allFiles } = manuscript
  const { t } = useTranslation()

  const authorFeedbackFiles = authorFeedback.fileIds
    ? _(allFiles).keyBy('id').at(authorFeedback.fileIds).value()
    : []

  const [readOnly, setReadOnly] = useState(
    !!authorFeedback.submitted || isReadOnly,
  )

  const [
    submitAuthorProofingFeedbackStatus,
    setSubmitAuthorProofingFeedbackStatus,
  ] = useState(null)

  const submitButtonText = readOnly
    ? t('productionPage.Submitted')
    : t('productionPage.Submit')

  // Below are the create, delete file and formData save, submit actions
  const [createFile] = useMutation(CREATE_FILE_MUTATION)

  const [deleteFile] = useMutation(DELETE_FILE_MUTATION, {
    update(cache, { data: { deleteFile: fileToDelete } }) {
      const id = cache.identify({
        __typename: 'File',
        id: fileToDelete,
      })

      cache.evict({ id })
    },
  })

  const triggerAutoSave = async formData => {
    await submitAuthorProofingFeedback({
      variables: {
        id: manuscript.id,
        input: JSON.stringify({
          authorFeedback: {
            ...formData,
            edited: new Date(),
          },
        }),
      },
    })
  }

  const submit = async formData => {
    setSubmitAuthorProofingFeedbackStatus('pending')
    await submitAuthorProofingFeedback({
      variables: {
        id: manuscript.id,
        input: JSON.stringify({
          status: 'completed',
          authorFeedback: {
            text: formData.text,
            fileIds: formData.fileIds,
            submitterId: currentUser.id,
            submitted: new Date(),
          },
        }),
      },
    })

    setSubmitAuthorProofingFeedbackStatus('success')
    setReadOnly(true)
  }

  // Initial data for the form
  const setInitialData = authorFeedbackData => {
    let initialData = {}
    initialData = { ...authorFeedbackData }

    initialData.text = authorFeedbackData.text ? authorFeedbackData.text : ''
    initialData.fileIds = authorFeedbackData.fileIds
      ? authorFeedbackData.fileIds
      : []

    initialData.files = authorFeedbackFiles
    return initialData
  }

  return (
    <Formik
      initialValues={setInitialData(authorFeedback)}
      onSubmit={async values => submit(values)}
    >
      {formikProps => {
        const [selectedFiles, setSelectedFiles] = useState(
          formikProps.values.fileIds,
        )

        const onDataChanged = (name, value) => {
          formikProps.setFieldValue(name, value)
          triggerAutoSave({ [name]: value })
        }

        const onFileAdded = file => {
          setSelectedFiles(current => {
            const currentFiles = [...current]
            currentFiles.push(file.id)
            onDataChanged('fileIds', currentFiles)
            return currentFiles
          })
        }

        const onFileRemoved = file => {
          setSelectedFiles(current => {
            const currentFiles = current.filter(id => id !== file.id)
            onDataChanged('fileIds', currentFiles)
            return currentFiles
          })
        }

        return (
          <>
            <PaddedContent>
              <Legend>{t('productionPage.Feedback')}</Legend>
              <ValidatedFieldFormik
                component={textInput.component}
                key={textInput.name}
                name={textInput.name}
                onChange={value => onDataChanged(textInput.name, value)}
                readonly={readOnly}
                setFieldValue={formikProps.setFieldValue}
                setTouched={formikProps.setTouched}
                type={textInput.type}
                validate={required}
                {...textInput.otherProps}
              />
            </PaddedContent>
            <PaddedContent key={filesInput.name}>
              <Legend>{t('productionPage.Attachments')}</Legend>
              {readOnly ? (
                authorFeedbackFiles.map(file => (
                  <Attachment
                    file={file}
                    key={file.storedObjects[0].url}
                    uploaded
                  />
                ))
              ) : (
                <ValidatedFieldFormik
                  component={filesInput.component}
                  confirmBeforeDelete
                  createFile={createFile}
                  deleteFile={deleteFile}
                  entityId={manuscript.id}
                  key={selectedFiles.length}
                  name={filesInput.name}
                  onFileAdded={onFileAdded}
                  onFileRemoved={onFileRemoved}
                  setFieldValue={formikProps.setFieldValue}
                  setTouched={formikProps.setTouched}
                  type={filesInput.type}
                  values={{
                    files: selectedFiles,
                  }}
                  {...filesInput.otherProps}
                />
              )}
            </PaddedContent>
            <ActionButtonContainer>
              <div>
                <FormActionButton
                  disabled={readOnly}
                  onClick={formikProps.handleSubmit}
                  primary
                  status={submitAuthorProofingFeedbackStatus}
                  type="button"
                >
                  {submitButtonText}
                </FormActionButton>
              </div>
              <SubmittedStatus authorFeedback={authorFeedback} />
            </ActionButtonContainer>
          </>
        )
      }}
    </Formik>
  )
}

export default AuthorFeedbackForm
