/* eslint-disable react-hooks/immutability */
/* eslint-disable react/prop-types */

import { useState } from 'react'
import { Formik } from 'formik'
import { FilesUpload } from '../../../shared'
import { CompactSection } from '../../../component-cms-manager/src/style'

const setInitialValues = (
  existingConfig,
  selectedFile,
  fieldName,
  tempStoredFiles,
) => {
  const initialData = { ...existingConfig, ...tempStoredFiles?.current }

  if (selectedFile?.length < 1) {
    initialData[fieldName] = [initialData[fieldName]]
  } else {
    initialData[fieldName] = selectedFile
  }

  return initialData
}

const FilesUploadWithOnChange = ({ handleFileChange, ...otherProps }) => (
  <CompactSection>
    <FilesUpload
      {...otherProps}
      onFileAdded={file => handleFileChange(file)}
      onFileRemoved={() => handleFileChange(null)}
    />
  </CompactSection>
)

const BrandIcon = ({
  config,
  createFile,
  fieldName,
  fileType,
  deleteFile,
  mimeTypesToAccept,
  tempStoredFiles,
  ...restProps
}) => {
  const [selectedFile, setSelectedFile] = useState([])

  const handleFileChange = file => {
    setSelectedFile(file)

    tempStoredFiles.current[fieldName] = file
  }

  const initialData = setInitialValues(
    config,
    selectedFile,
    fieldName,
    tempStoredFiles,
  )

  return (
    <Formik
      initialValues={initialData}
      onSubmit={actions => {
        actions.setSubmitting(false)
      }}
    >
      <FilesUploadWithOnChange
        acceptMultiple={false}
        confirmBeforeDelete
        createFile={createFile}
        deleteFile={deleteFile}
        fieldName={fieldName}
        fileType={fileType}
        handleFileChange={handleFileChange}
        manuscriptId={config?.id}
        mimeTypesToAccept={mimeTypesToAccept}
        {...restProps}
      />
    </Formik>
  )
}

export default BrandIcon
