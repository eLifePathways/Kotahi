/* eslint-disable react/prop-types */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ConfirmationModal } from '../../../component-modal/src/ConfirmationModal'
import { LooseColumn, Icon } from '../../../shared'

const DIcon = styled(Icon)`
  top: -4px;
`

const DeleteIcon = ({ onClick: defaultOnClick }) => {
  const { t } = useTranslation()

  const [isDeletingResource, setIsDeletingResource] = useState(false)

  const handleClick = () => {
    setIsDeletingResource(true)
  }

  return (
    <>
      <DIcon noPadding onClick={handleClick} size={2}>
        trash
      </DIcon>
      <ConfirmationModal
        closeModal={() => setIsDeletingResource(false)}
        confirmationAction={async () => {
          defaultOnClick()
        }}
        confirmationButtonText={t('cmsPage.fileBrowser.confirmDelete')}
        isOpen={isDeletingResource}
        message={
          <LooseColumn>{t('cmsPage.fileBrowser.deleteResource')}</LooseColumn>
        }
      />
    </>
  )
}

export default DeleteIcon
