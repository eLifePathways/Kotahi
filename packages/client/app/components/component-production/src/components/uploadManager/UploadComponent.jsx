/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */

import { useCallback, useState } from 'react'
import { grid } from '@coko/client'
import { useDropzone } from 'react-dropzone'
import styled from 'styled-components'
import { color } from '../../../../../theme'
import { Icon, Spinner } from '../../../../shared'

const Message = styled.div`
  align-items: center;
  color: inherit;
  display: flex;
  justify-content: center;
  width: 100%;

  svg {
    margin-left: ${grid(1)};
  }
`

const DropZoneContainer = styled.div`
  align-items: center;
  background-color: #fafafa;
  border-color: #eee;
  border-radius: 2px;
  border-style: dashed;
  border-width: 2px;
  color: #bdbdbd;
  display: flex;
  flex: 1;
  flex-direction: column;
  outline: none;
  padding: 20px;
  transition: border 0.24s ease-in-out;
`

const UploadComponent = ({ uploadAssetsFn, label }) => {
  const [showSpinner, setShowSpinner] = useState(false)

  const onDrop = useCallback(async acceptedFiles => {
    setShowSpinner(true)
    await uploadAssetsFn(acceptedFiles)
    setShowSpinner(false)
  }, [])

  const { getRootProps, getInputProps } = useDropzone({ onDrop })

  return !showSpinner ? (
    <DropZoneContainer {...getRootProps()}>
      <input {...getInputProps()} />
      <Message>
        <>
          {label}
          <Icon color={color.brand1.base()} inline>
            file-plus
          </Icon>
        </>
      </Message>
    </DropZoneContainer>
  ) : (
    <Spinner />
  )
}

export default UploadComponent
