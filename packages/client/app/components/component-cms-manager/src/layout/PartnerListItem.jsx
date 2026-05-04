/* eslint-disable react-hooks/exhaustive-deps, react-hooks/use-memo */
/* eslint-disable react/prop-types */

import React, { useCallback, useEffect, useState } from 'react'
import styled, { css } from 'styled-components'
import { th, grid } from '@coko/client'
import { debounce } from 'lodash'

import { Action } from '../../../pubsweet'
import { TextInput } from '../../../shared'
import { ConfirmationModal } from '../../../component-modal/src/ConfirmationModal'

const Icon = styled.div`
  background: ${th('colorFurniture')};
  height: ${grid(10)};
  margin-bottom: ${th('gridUnit')};
  opacity: 0.5;
  overflow: hidden;
  padding: ${grid(1)};
  position: relative;
  width: ${grid(10)};

  img {
    width: ${grid(8)};
  }
`

const Extension = styled.div`
  background: ${th('colorText')};
  color: ${th('colorTextReverse')};
  font-size: ${th('fontSizeBaseSmall')};
  left: ${grid(2)};
  line-height: ${th('lineHeightBaseSmall')};
  position: absolute;
  right: 0;
  text-align: center;
  text-transform: uppercase;
  top: ${grid(2)};
`

const Filename = styled.div`
  color: ${th('colorText')};
  font-size: ${th('fontSizeBaseSmall')};
  font-style: italic;
  height: ${grid(2)};
  line-height: ${th('lineHeightBaseSmall')};
  overflow: auto;
  text-overflow: ellipsis;
`

const Uploading = styled.div`
  align-items: center;
  border: 1px solid #dedede;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-right: ${grid(4)};
  min-width: ${grid(28)};
  padding: 16px;
  position: relative;
`

const Uploaded = styled(Uploading)`
  &:hover ${Extension} {
    background: ${th('colorTextReverse')};
    color: ${th('colorPrimary')};
  }

  &:hover ${Icon} {
    background: ${th('colorPrimary')};
    opacity: 1;
  }

  &:hover::after,
  &:hover::before {
    transform: scaleX(1);
  }
`

const URLInput = styled(TextInput)`
  ${props =>
    !props.isValid &&
    css`
      border: 2px solid red !important;
    `}

  padding: ${grid(1)};
`

const getFileExtension = ({ name }) => name.replace(/^.+\./, '')

const PartnerListItem = ({
  file,
  deleteFile,
  uploaded,
  index,
  remove,
  onUrlAdded,
  url,
}) => {
  const Root = uploaded ? Uploaded : Uploading
  const extension = getFileExtension(file)
  const isImage = file?.storedObjects[0]?.mimetype.startsWith('image/')
  const urlAdded = useCallback(debounce(onUrlAdded ?? (() => {}), 1000), [])
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  useEffect(() => urlAdded.flush, [])

  const [isUrlValid, setIsUrlValid] = React.useState(true)

  const onChangeUrl = (updatedUrl, fileId) => {
    const regex = new RegExp(
      '^((https?|ftp)://)?' + // Protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // Domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR IP (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // Port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // Query string
        '(\\#[-a-z\\d_]*)?$',
      'i',
    )

    if (!regex.test(updatedUrl)) {
      setIsUrlValid(false)
      return
    }

    setIsUrlValid(true)
    urlAdded(updatedUrl, fileId)
  }

  const icon = (
    <Icon>
      {isImage && <img alt={file.name} src={file.storedObjects[0].url} />}
      <Extension>{extension}</Extension>
    </Icon>
  )

  const fileName = (
    <Filename>
      <a
        download={file.name}
        href={file.storedObjects[0].url}
        rel="noreferrer"
        target="_blank"
        title={file.name}
      >
        {file.name}
      </a>
    </Filename>
  )

  return (
    <Root>
      <a
        download={file.name}
        href={file.storedObjects[0].url}
        rel="noreferrer"
        target="_blank"
        title={file.name}
      >
        {icon}
      </a>
      {fileName}

      {!!deleteFile && !!remove && (
        <Action onClick={() => setIsConfirmingDelete(true)}>Remove</Action>
      )}

      <URLInput
        defaultValue={url}
        isValid={isUrlValid}
        key={file.id}
        onChange={event => onChangeUrl(event.target.value, file.id)}
        placeholder="https://partner.com"
        type="url"
      />

      <ConfirmationModal
        closeModal={() => setIsConfirmingDelete(false)}
        confirmationAction={() => deleteFile(file, index, remove)}
        confirmationButtonText="Delete"
        isOpen={isConfirmingDelete}
        message="Permanently delete file ?"
      />
    </Root>
  )
}

export default PartnerListItem
