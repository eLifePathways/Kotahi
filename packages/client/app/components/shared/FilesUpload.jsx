/* eslint-disable react/prop-types */

import PropTypes from 'prop-types'
import { cloneDeep, get } from 'lodash'
import { FieldArray } from 'formik'
import { grid, th } from '@coko/client'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import UploadingFile from './UploadingFile'
import { Dropzone } from './Dropzone'
import { Icon } from './Icon'
import { color } from '../../theme'

const Root = styled.div`
  align-items: center;
  border: 1px dashed ${color.gray60};
  border-radius: ${th('borderRadius')};
  display: flex;
  height: ${grid(8)};
  justify-content: center;
  /* line-height: ${grid(8)}; */
  padding: 0 ${grid(1)};
  text-align: center;
  white-space: nowrap;
  width: fit-content;
`

const Files = styled.div`
  display: flex;
  gap: ${grid(2)};
  margin-top: ${grid(2)};
`

const Message = styled.div`
  align-items: center;
  color: ${props => (props.disabled ? color.textPlaceholder : 'inherit')};
  display: flex;
  justify-content: center;
  width: 100%;

  svg {
    margin-left: ${grid(1)};
  }
`

const DropzoneAndList = ({
  form: {
    values,
    // setFieldValue
  },
  push,
  // insert,
  remove,
  createFile,
  deleteFile,
  persistentFileLabel,
  fileType,
  fieldName,
  acceptMultiple = true,
  mimeTypesToAccept,
  renderFileList,
  confirmBeforeDelete,
}) => {
  // Disable the input in case we want a single file upload
  // and a file has already been uploaded
  const { t } = useTranslation()

  const files = cloneDeep(get(values, fieldName) || [])
    .filter(file => file != null)
    .map((file, index) => {
      // This is so that we preserve the location of the file in the top-level
      // files array (needed for deletion).

      file.originalIndex = index
      return file
    })
    .filter(val => (fileType ? val.tags.includes(fileType) : true))

  const disabled = !acceptMultiple && !!files.length

  const defaultFileListing = clonedFiles => {
    return (
      <Files>
        {clonedFiles.map(file => (
          <UploadingFile
            confirmBeforeDelete={confirmBeforeDelete}
            deleteFile={deleteFile}
            file={file}
            index={file.originalIndex}
            key={file.name}
            remove={remove}
            uploaded
          />
        ))}
      </Files>
    )
  }

  return (
    <>
      {disabled && !persistentFileLabel ? null : (
        <Dropzone
          accept={mimeTypesToAccept}
          disabled={disabled}
          multiple={acceptMultiple}
          onDrop={async dropFiles => {
            await Promise.all(
              Array.from(dropFiles).map(async file => {
                const data = await createFile(file)
                push(data.createFile)
              }),
            )
          }}
        >
          {({ getRootProps, getInputProps }) => (
            <Root {...getRootProps()} data-testid="dropzone">
              <input {...getInputProps()} />
              <Message disabled={disabled}>
                {disabled ? (
                  t('dragndrop.Your file has been uploaded')
                ) : (
                  <>
                    {t('dragndrop.Drag and drop your files here')}
                    <Icon color={color.brand1.base()} inline>
                      file-plus
                    </Icon>
                  </>
                )}
              </Message>
            </Root>
          )}
        </Dropzone>
      )}

      {renderFileList
        ? renderFileList(files, { remove, deleteFile })
        : defaultFileListing(files)}
    </>
  )
}

DropzoneAndList.propTypes = {
  form: PropTypes.shape({
    values: PropTypes.shape({}),
    setFieldValue: PropTypes.func.isRequired,
  }).isRequired,
  push: PropTypes.func.isRequired,
  insert: PropTypes.func.isRequired,
  remove: PropTypes.func.isRequired,
  createFile: PropTypes.func.isRequired,
  deleteFile: PropTypes.func.isRequired,
  fileType: PropTypes.string.isRequired,
  fieldName: PropTypes.string.isRequired,
  acceptMultiple: PropTypes.bool,
  mimeTypesToAccept: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string.isRequired),
  ]),
}

const FilesUpload = ({
  fileType,
  fieldName,
  persistentFileLabel = false,
  manuscriptId,
  reviewId,
  initializeReview,
  acceptMultiple = true,
  mimeTypesToAccept,
  createFile: createF,
  deleteFile: deleteF,
  onChange,
  values,
  renderFileList,
  onFileAdded,
  onFileRemoved,
  confirmBeforeDelete,
  formElementId,
}) => {
  let existingFiles = []

  if (values?.[fieldName]) {
    existingFiles = values[fieldName]
  }

  const createFile = async file => {
    const meta = {
      fileType,
      manuscriptId,
      reviewId,
      formElementId,
    }

    if (!meta.reviewId && initializeReview)
      meta.reviewId = (await initializeReview()) || null

    const { data } = await createF({
      variables: {
        file,
        meta,
      },
    })

    if (onFileAdded) onFileAdded(data.createFile)
    if (onChange) onChange([...existingFiles, data.createFile.id], fieldName)

    return data
  }

  const deleteFile = async (file, index, remove) => {
    const { data } = await deleteF({ variables: { id: file.id } })
    remove(index)

    if (onChange) {
      const filteredFiles = existingFiles.filter(
        currFile => currFile !== file.id,
      )

      // Update the new array with the file deleted
      onChange(filteredFiles, fieldName)
    }

    if (onFileRemoved) onFileRemoved(file)

    return data
  }

  return (
    <FieldArray
      name={fieldName}
      render={formikProps => (
        <DropzoneAndList
          acceptMultiple={acceptMultiple}
          confirmBeforeDelete={confirmBeforeDelete}
          createFile={createFile}
          deleteFile={deleteFile}
          fieldName={fieldName}
          fileType={fileType}
          mimeTypesToAccept={mimeTypesToAccept}
          persistentFileLabel={persistentFileLabel}
          renderFileList={renderFileList}
          {...formikProps}
        />
      )}
    />
  )
}

FilesUpload.propTypes = {
  /** The type of attachment, e.g. 'manuscript' (for embedded images), or 'supplementary', 'visualAbstract', 'review', 'confidential', 'decision' */
  fileType: PropTypes.string.isRequired,
  fieldName: PropTypes.string.isRequired,
  /** All files belong to a manuscript */
  manuscriptId: PropTypes.string.isRequired,
  /** only supply onChange if you want the field data to contain the list of file IDs.
   * For submissions we don't store these in the form. */
  onChange: PropTypes.func,
  /** Some files may be attached to a review comment (or review decision).
   * If the review hasn't been started yet there may not be an ID
   * assigned for it yet, in which case initializeReview will be
   * called to create a new record in the DB. */
  reviewId: PropTypes.string,
  /** Function to create a new record in DB in case there is no reviewId yet */
  initializeReview: PropTypes.func,
  /** Allow multiple drag/drop or multiple selection in file dialog */
  acceptMultiple: PropTypes.bool,
  /** Keep showing the file label in case of single file selection */
  persistentFileLabel: PropTypes.bool,

  mimeTypesToAccept: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string.isRequired),
  ]),
}

export { FilesUpload }
