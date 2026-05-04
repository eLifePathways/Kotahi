/* eslint-disable react/prop-types */

import { useState } from 'react'
import styled from 'styled-components'
import { th, grid } from '@coko/client'
import { useTranslation } from 'react-i18next'
import { Action } from '../pubsweet'
import { color } from '../../theme'
import { ConfirmationModal } from '../component-modal/src/ConfirmationModal'

const Icon = styled.div`
  background: ${color.gray90};
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
  background: ${color.gray5};
  color: ${color.textReverse};
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
  color: ${color.text};
  font-size: ${th('fontSizeBaseSmall')};
  font-style: italic;
  line-height: ${th('lineHeightBaseSmall')};
  max-width: ${grid(12)};
  overflow: hidden;
  text-overflow: ellipsis;
`

const Uploading = styled.div`
  align-items: center;
  display: block;
  flex-direction: column;
  margin-bottom: ${grid(3)};
  margin-right: ${grid(3)};
  position: relative;
`

const Uploaded = styled(Uploading)`
  &:hover ${Extension} {
    background: ${color.backgroundA};
    color: ${color.brand1.base};
  }

  &:hover ${Icon} {
    background: ${color.brand1.base};
    opacity: 1;
  }

  &:hover::after,
  &:hover::before {
    transform: scaleX(1);
  }
`

const ErrorWrapper = styled.div`
  background: ${th('colorError')};
  border: calc(${th('borderWidth')} * 2) ${th('borderStyle')}
    ${color.textReverse};
  color: ${color.textReverse};
  font-size: ${th('fontSizeBaseSmall')};
  letter-spacing: 0.01em;
  line-height: ${th('lineHeightBaseSmall')};
  opacity: 1;
  padding: ${th('gridUnit')} ${th('gridUnit')};
  position: absolute;
  top: 25%;
  z-index: 4;
`

const getFileExtension = ({ name }) => name.replace(/^.+\./, '')

const UploadingFile = ({
  file,
  // progress,
  error,
  deleteFile,
  uploaded,
  index,
  remove,
  confirmBeforeDelete,
}) => {
  const Root = uploaded ? Uploaded : Uploading
  const { t } = useTranslation()
  const extension = getFileExtension(file)
  const isImage = file?.storedObjects[0]?.mimetype.startsWith('image/')
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const icon = (
    <Icon>
      {isImage && <img alt={file.name} src={file.storedObjects[0].url} />}
      {/* {!!progress && <Progress>{progress * 100}%</Progress>} */}
      <Extension>{extension}</Extension>
    </Icon>
  )

  return (
    <Root>
      {!!error && <ErrorWrapper>{error}</ErrorWrapper>}
      {uploaded ? (
        <a
          download={file.name}
          href={file.storedObjects[0].url}
          rel="noreferrer"
          target="_blank"
          title={file.name}
        >
          {icon}
        </a>
      ) : (
        icon
      )}
      <Filename>
        {uploaded ? (
          <a
            download={file.name}
            href={file.storedObjects[0].url}
            rel="noreferrer"
            target="_blank"
            title={file.name}
          >
            {file.name}
          </a>
        ) : (
          file.name
        )}
      </Filename>

      {!!deleteFile && !!remove && (
        <Action
          disabled={isDeleting}
          onClick={async () => {
            setIsDeleting(true)
            await (confirmBeforeDelete
              ? setIsConfirmingDelete(true)
              : deleteFile(file, index, remove))
            setIsDeleting(false)
          }}
        >
          {t('dragndrop.Remove')}
        </Action>
      )}

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

export default UploadingFile
