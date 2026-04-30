/* eslint-disable react/prop-types */

import styled from 'styled-components'
import { th } from '@coko/client'

import { dateTimeFormatter, fileSizeFormatter } from './helpers'
import InfoItem from './InfoItem'
import { Button, Icons } from './Modal'

const { exitIcon } = Icons

const PreviewWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: flex-start;
  padding-left: 16px;
  width: 35%;
`

const ClosePreview = styled.div`
  display: flex;
  height: 4.96%;
  justify-content: flex-end;
  width: 100%;
`

const ImagePreviewer = styled.div`
  align-items: center;
  align-self: center;
  display: flex;
  height: 53.79%;
  justify-content: center;
  width: 100%;
`

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  height: 41.25%;
  overflow-y: auto;
  width: 100%;
`

const InfoHeaderWrapper = styled.div`
  background: white;
  border-bottom: 1px solid black;
  display: flex;
  margin-bottom: 4px;
  position: sticky;
  top: 0;
  width: 100%;
`

const InfoHeader = styled.h2`
  font-family: ${th('fontHeading')};
  font-size: ${th('fontSizeHeading4')};
  line-height: ${th('lineHeightHeading4')};
  margin: 0;
  padding: 0;
`

const ItemWrapper = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  margin-bottom: 4px;
  width: 100%;
`

const ItemHeader = styled.h5`
  font-family: ${th('fontHeading')};
  font-size: ${th('fontSizeHeading6')};
  line-height: ${th('lineHeightHeading6')};
  margin: 0;
  padding: 0;
`

const FileDetails = ({ file, updateFile, closeHandler }) => {
  const { alt, id, name, updated, storedObjects } = file

  const storedObjectOriginal = storedObjects.find(
    storedObject => storedObject.type === 'original',
  )

  const storedObjectSmall = storedObjects.find(
    storedObject => storedObject.type === 'small',
  )

  return (
    <PreviewWrapper>
      <ClosePreview>
        <Button
          danger
          icon={exitIcon}
          onClick={() => {
            closeHandler(undefined)
          }}
          title="Close"
        />
      </ClosePreview>
      <ImagePreviewer>
        <img
          alt={alt || '-'}
          src={
            storedObjectSmall ? storedObjectSmall.url : storedObjectOriginal.url
          }
        />
      </ImagePreviewer>
      <InfoSection>
        <InfoHeaderWrapper>
          <InfoHeader>Info</InfoHeader>
        </InfoHeaderWrapper>

        <ItemWrapper>
          <ItemHeader>Name</ItemHeader>
          <InfoItem
            editable
            key={`${id}-name`}
            type="name"
            updateFile={updateFile}
            value={name}
          />
        </ItemWrapper>
        <ItemWrapper>
          <ItemHeader>Alt</ItemHeader>
          <InfoItem
            editable
            key={`${id}-alt`}
            type="alt"
            updateFile={updateFile}
            value={alt || '-'}
          />
        </ItemWrapper>
        <ItemWrapper>
          <ItemHeader>Size</ItemHeader>
          <InfoItem
            key={`${id}-size`}
            value={fileSizeFormatter(storedObjectOriginal.size)}
          />
        </ItemWrapper>
        <ItemWrapper>
          <ItemHeader>Mimetype</ItemHeader>
          <InfoItem
            key={`${id}-mimetype`}
            value={storedObjectOriginal.mimetype}
          />
        </ItemWrapper>
        <ItemWrapper>
          <ItemHeader>Updated</ItemHeader>
          <InfoItem key={`${id}-updated`} value={dateTimeFormatter(updated)} />
        </ItemWrapper>
        {storedObjectOriginal.imageMetadata && (
          <>
            <ItemWrapper>
              <ItemHeader>Dimensions (W x H)</ItemHeader>
              <InfoItem
                key={`${id}-dimensions`}
                value={`${storedObjectOriginal.imageMetadata.width} x ${storedObjectOriginal.imageMetadata.height}`}
              />
            </ItemWrapper>
            <ItemWrapper>
              <ItemHeader>Color space</ItemHeader>
              <InfoItem
                key={`${id}-colorSpace`}
                value={storedObjectOriginal.imageMetadata.space}
              />
            </ItemWrapper>
            <ItemWrapper>
              <ItemHeader>Density</ItemHeader>
              <InfoItem
                key={`${id}-density`}
                value={storedObjectOriginal.imageMetadata.density || '-'}
              />
            </ItemWrapper>
          </>
        )}
      </InfoSection>
    </PreviewWrapper>
  )
}

export default FileDetails
