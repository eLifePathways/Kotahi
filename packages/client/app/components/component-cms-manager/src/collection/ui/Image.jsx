/* eslint-disable react/prop-types */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { Action } from '../../../../pubsweet'
import { LooseColumn } from '../../../../shared'
import { ConfirmationModal } from '../../../../component-modal/src/ConfirmationModal'
import UploadComponent from '../../../../component-production/src/components/uploadManager/UploadComponent'

const ImagePreview = styled.img`
  max-height: 200px;
  max-width: 100%;
`

const Image = ({ setImage, previewImage }) => {
  const [isDeletingImage, setIsDeletingImage] = useState(false)
  const { t } = useTranslation()

  const handleFileChange = ([img]) => {
    const reader = new FileReader()

    reader.onloadend = () => {
      setImage({ newImage: img, previewImage: reader.result })
    }

    if (img) {
      reader.readAsDataURL(img)
    }
  }

  return (
    <>
      {previewImage && <ImagePreview src={previewImage} />}
      {previewImage && (
        <div>
          <Action onClick={() => setIsDeletingImage(true)} primary>
            {t('dragndrop.Remove')}
          </Action>
        </div>
      )}
      <ConfirmationModal
        closeModal={() => setIsDeletingImage(false)}
        confirmationAction={() =>
          setImage({ newImage: null, previewImage: null })
        }
        confirmationButtonText={t('cmsPage.metadata.delete')}
        isOpen={isDeletingImage}
        message={<LooseColumn>{t('cmsPage.metadata.deleteImage')}</LooseColumn>}
      />
      <UploadComponent
        label={t('dragndrop.Drag and drop files', { fileType: 'image' })}
        uploadAssetsFn={handleFileChange}
      />
    </>
  )
}

export default Image
