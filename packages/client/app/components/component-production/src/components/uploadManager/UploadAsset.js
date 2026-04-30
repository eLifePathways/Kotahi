/* eslint-disable react-hooks/exhaustive-deps */

import { useCallback, useState } from 'react'
import PropTypes from 'prop-types'
import { useMutation, gql } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { grid, th, serverUrl } from '@coko/client'

import { color } from '../../../../../theme'
import { convertTimestampToRelativeDateString } from '../../../../../shared/dateUtils'
import { Placeholder } from '../../../../component-dashboard/src/style'
import { ConfirmationModal } from '../../../../component-modal/src/ConfirmationModal'
import FileRow from '../FileRow'
import {
  Container,
  SectionContent,
  SectionRow,
  ActionButton,
} from '../../../../shared'
import { HeadingCell } from '../styles'
import UploadComponent from './UploadComponent'
import { TagDropdown } from './TagDropDown'

const UPDATE_TAG_FILE = gql`
  mutation UpdateTagsFile($input: UpdateTagsFileInput!) {
    updateTagsFile(input: $input) {
      id
      name
      tags
      created
      storedObjects {
        type
        key
        mimetype
        size
        url
      }
    }
  }
`

const UploadAssetContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
  overflow: auto;
  padding: calc(8px * 2) calc(8px * 3);
`

export const FileTableStyled = styled.div`
  font-size: ${th('fontSizeBaseSmall')};
  width: 100%;
`

export const StyledSectionRow = styled(SectionRow)`
  display: flex;
`

export const FilesHeading = styled.div`
  align-items: center;
  background-color: ${color.backgroundA};
  border-top: 1px solid ${color.gray90};
  column-gap: ${grid(2)};
  display: flex;
  flex-direction: row;
  line-height: 1.4em;
  text-align: left;
  width: 100%;

  &:first-child {
    border-top: none;
    padding: ${grid(0.5)} ${grid(2)};
  }

  &:not(:first-child) {
    padding: ${grid(1.5)} ${grid(2)};
  }
`

const WrapperUpload = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 10px;

  span {
    font-weight: bold;
  }
`

const UploadAsset = ({ files, groupTemplateId, tag, onCopyAsImage }) => {
  const { t } = useTranslation()
  const [fileBeingDeletedId, setFileBeingDeletedId] = useState(null)
  const [filesState, setFilesState] = useState(files)
  const [updateFile] = useMutation(UPDATE_TAG_FILE)

  const uploadAssetsFn = useCallback(
    fileType => async acceptedFiles => {
      const body = new FormData()

      acceptedFiles.forEach(f => body.append('files', f))

      body.append('groupTemplateId', groupTemplateId)
      body.append('isCms', tag === 'isCms')
      body.append('isPdf', tag === 'isPdf')
      body.append('fileType', fileType)

      let result = await fetch(`${serverUrl}/api/uploadAsset`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body,
      })

      result = await result.json()
      setFilesState([...result])
      return result
    },
    [],
  )

  const updateFileFn = file => async updateTags => {
    const fileUpdated = await updateFile({
      variables: {
        input: {
          id: file.id,
          ...updateTags,
        },
      },
    })

    const { id } = fileUpdated.data.updateTagsFile

    setFilesState([
      ...filesState.map(f => {
        if (f.id === id) {
          return fileUpdated.data.updateTagsFile
        }

        return f
      }),
    ])
  }

  const onDelete = id => {
    return async () => {
      let result = await fetch(`${serverUrl}/api/deleteAsset`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })

      result = await result.json()
      setFilesState([...result])
    }
  }

  const onCopyAsUrl = file => {
    return () => navigator.clipboard.writeText(file.storedObjects[0].url)
  }

  const onCopyAsScriptLink = file => {
    return () =>
      navigator.clipboard.writeText(
        `<script data-name="${file.name}" data-fileid="${file.id}" src="${file.storedObjects[0].url}"></script>`,
      )
  }

  const onCopyAsCssLink = file => {
    return () =>
      navigator.clipboard.writeText(
        `<link data-name="${file.name}" data-fileid="${file.id}" rel="stylesheet" href="${file.storedObjects[0].url}" />`,
      )
  }

  const onCopyAsFont = file => {
    return () =>
      navigator.clipboard.writeText(
        `<link data-name="${file.name}" data-fileid="${file.id}" rel="preload" as="font" href="${file.storedObjects[0].url}" />`,
      )
  }

  const onCopyAsLink = file => {
    return () => {
      const aTag = `<a data-name="${file.name}" data-fileid="${file.id}" rel="preload" href="${file.storedObjects[0].url}" title="${file.name}" target="_blank">${file.name}</a>`

      const copiedStr = `{{ '${aTag}' | linkHandler(article.shortId, 'articles', cmsConfig.group, cmsLayout.hexCode) | safe }}`

      return navigator.clipboard.writeText(copiedStr)
    }
  }

  let counter = 1

  const columnsProps = [
    {
      name: 'id',
      centered: false,
      title: 'ID',
      // eslint-disable-next-line no-plusplus, no-unused-vars
      component: ({ file }) => counter++,
    },
    {
      name: 'created',
      centered: false,
      title: 'Created',
      component: ({ file }) => {
        return file && convertTimestampToRelativeDateString(file.created)
      },
    },
    {
      name: 'name',
      centered: false,
      title: 'Name',
      component: ({ file }) => file && file.name,
    },
    {
      name: 'tag',
      centered: false,
      title: 'Used For',

      component: ({ file }) => (
        <TagDropdown tags={file.tags} updateFileFn={updateFileFn(file)} />
      ),
    },
    {
      name: 'copy-as-image',
      centered: false,
      title: 'Copy as',

      component: ({ file }) => {
        const { mimetype } = file.storedObjects[0]

        if (mimetype.includes('image')) {
          return (
            <ActionButton onClick={onCopyAsImage(file)} primary>
              Image
            </ActionButton>
          )
        }

        if (mimetype.includes('javascript')) {
          return (
            <ActionButton onClick={onCopyAsScriptLink(file)} primary>
              Script
            </ActionButton>
          )
        }

        if (mimetype.includes('css')) {
          return (
            <ActionButton onClick={onCopyAsCssLink(file)} primary>
              Css
            </ActionButton>
          )
        }

        if (mimetype.includes('font')) {
          return (
            <ActionButton onClick={onCopyAsFont(file)} primary>
              Font
            </ActionButton>
          )
        }

        return (
          <ActionButton onClick={onCopyAsLink(file)} primary>
            Link
          </ActionButton>
        )
      },
    },
    {
      name: 'copy-as-url',
      centered: false,
      title: 'Copy as Url',

      component: ({ file }) => (
        <ActionButton onClick={onCopyAsUrl(file)}>Create URL</ActionButton>
      ),
    },
    {
      name: 'delete',
      centered: false,
      title: 'Delete',

      component: ({ file }) => (
        <ActionButton onClick={() => setFileBeingDeletedId(file.id)}>
          Delete
        </ActionButton>
      ),
    },
  ]

  return (
    <UploadAssetContainer>
      <SectionContent>
        <StyledSectionRow key="upload-asset">
          <WrapperUpload>
            <span>Css Upload:</span>
            <UploadComponent
              label={t('dragndrop.Drag and drop files', { fileType: 'CSS' })}
              uploadAssetsFn={uploadAssetsFn('css')}
            />
          </WrapperUpload>
          <WrapperUpload>
            <span>Javascript Upload:</span>
            <UploadComponent
              label={t('dragndrop.Drag and drop files', {
                fileType: 'javascript',
              })}
              uploadAssetsFn={uploadAssetsFn('javaScript')}
            />
          </WrapperUpload>
          <WrapperUpload>
            <span>Other Upload:</span>
            <UploadComponent
              label={t('dragndrop.Drag and drop other files here')}
              uploadAssetsFn={uploadAssetsFn('other')}
            />
          </WrapperUpload>
        </StyledSectionRow>
        <SectionRow key="files">
          <FileTableStyled>
            <FilesHeading>
              {columnsProps.map(info => (
                <HeadingCell key={info.name}>{info.title}</HeadingCell>
              ))}
            </FilesHeading>
            {filesState.length === 0 ? (
              <Placeholder>No Files found</Placeholder>
            ) : (
              filesState.map(file => (
                <FileRow
                  columnDefinitions={columnsProps}
                  file={file}
                  key={file.id}
                />
              ))
            )}
          </FileTableStyled>
        </SectionRow>
      </SectionContent>
      <ConfirmationModal
        closeModal={() => setFileBeingDeletedId(null)}
        confirmationAction={onDelete(fileBeingDeletedId)}
        confirmationButtonText={t('chat.delete')}
        isOpen={!!fileBeingDeletedId}
        message={
          <>
            {t('modals.deleteFile.Are you sure you want to delete this file?')}
          </>
        }
      />
    </UploadAssetContainer>
  )
}

UploadAsset.propTypes = {
  files: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      component: PropTypes.string,
    }).isRequired,
  ),
  groupTemplateId: PropTypes.string.isRequired,
  tag: PropTypes.oneOf(['isCms', 'isPdf']).isRequired,
  onCopyAsImage: PropTypes.func,
}

UploadAsset.defaultProps = {
  files: [],
  onCopyAsImage: file => {
    return () =>
      navigator.clipboard.writeText(
        `<img data-name="${file.name}" data-fileid="${file.id}" src="${file.storedObjects[0].url}" />`,
      )
  },
}

export default UploadAsset
