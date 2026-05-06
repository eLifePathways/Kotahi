/* eslint-disable react-hooks/exhaustive-deps, react-hooks/immutability */
/* eslint-disable react/prop-types */

import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'

import { ValidatedFieldFormik } from '../../../pubsweet'
import PageOrder from './PageOrder'
import {
  CompactSection,
  LayoutMainHeading,
  LayoutPageFooterContainer,
  LayoutSecondaryHeading,
} from '../style'
import { FilesUpload } from '../../../shared'
import PartnerListing from './PartnerListing'
import { inputComponents } from '../FormSettings'

const CompactSectionWithFullWidth = styled(CompactSection)`
  width: 100%;

  > div {
    width: 100%;
  }
`

const PartnerInputComponent = ({ entityId, ...restProps }) => {
  return (
    <FilesUpload
      acceptMultiple
      fieldName="partnerFiles"
      fileType="cms"
      manuscriptId={entityId}
      mimeTypesToAccept="image/*"
      {...restProps}
      onChange={() => {}}
    />
  )
}

const partnersInput = {
  component: PartnerInputComponent,
  label: 'Partners',
  name: 'partners',
  type: 'file',
}

const footerTextInput = {
  component: inputComponents.AbstractEditor,
  label: 'Footer text',
  name: 'footerText',
  type: 'text',
}

const Footer = ({
  formikProps,
  cmsLayout,
  createFile,
  deleteFile,
  triggerAutoSave,
  onPageOrderUpdated,
}) => {
  const [selectedFiles, setSelectedFiles] = useState(
    formikProps.values.partners,
  )

  useEffect(() => onDataChanged('partners', selectedFiles), [selectedFiles])
  const { t } = useTranslation()

  const onDataChanged = (name, value) => {
    formikProps.setFieldValue(name, value)
    triggerAutoSave({ [name]: value })
  }

  const onFileAdded = file => {
    setSelectedFiles(current => {
      const currentFiles = [...current]
      currentFiles.push({
        id: file.id,
        url: '',
        sequenceIndex: currentFiles.length,
      })
      return currentFiles
    })
  }

  const onFileRemoved = file => {
    setSelectedFiles(current => {
      return current.filter(currFile => currFile.id !== file.id)
    })
  }

  return (
    <LayoutPageFooterContainer>
      <LayoutMainHeading>{t('cmsPage.layout.Footer')}</LayoutMainHeading>
      <CompactSectionWithFullWidth key={partnersInput.name}>
        <LayoutSecondaryHeading>
          {t('cmsPage.layout.Partners')}
        </LayoutSecondaryHeading>
        <ValidatedFieldFormik
          component={partnersInput.component}
          createFile={createFile}
          deleteFile={deleteFile}
          entityId={cmsLayout.id}
          key={selectedFiles.length}
          name={partnersInput.name}
          onFileAdded={onFileAdded}
          onFileRemoved={onFileRemoved}
          renderFileList={(files, props) => (
            <PartnerListing
              files={files}
              formikProps={formikProps}
              key={files?.length}
              triggerAutoSave={triggerAutoSave}
              {...props}
            />
          )}
          setFieldValue={formikProps.setFieldValue}
          setTouched={formikProps.setTouched}
          type={partnersInput.type}
          values={{
            partnerFiles: selectedFiles,
          }}
          {...partnersInput.otherProps}
        />
      </CompactSectionWithFullWidth>

      <CompactSectionWithFullWidth key={footerTextInput.name}>
        <LayoutSecondaryHeading>
          {t('cmsPage.layout.Footer Text')}
        </LayoutSecondaryHeading>
        <ValidatedFieldFormik
          component={footerTextInput.component}
          name={footerTextInput.name}
          onChange={value => onDataChanged(footerTextInput.name, value)}
          setFieldValue={formikProps.setFieldValue}
          setTouched={formikProps.setTouched}
          type={footerTextInput.type}
          {...footerTextInput.otherProps}
        />
      </CompactSectionWithFullWidth>

      <CompactSectionWithFullWidth key="footer_page_links">
        <LayoutSecondaryHeading>
          {t('cmsPage.layout.Footer Page links')}
        </LayoutSecondaryHeading>
        <PageOrder
          initialItems={cmsLayout.flaxFooterConfig}
          onPageOrderUpdated={onPageOrderUpdated}
        />
      </CompactSectionWithFullWidth>
    </LayoutPageFooterContainer>
  )
}

export default Footer
