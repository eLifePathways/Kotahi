/* eslint-disable react/prop-types */

import { SectionContent, PaddedContent } from '../../../shared'
import { ActionButtonContainer, FormActionButton } from '../style'
import PublishStatus from '../components/PublishStatus'

import Header from './Header'
import Branding from './Branding'
import Footer from './Footer'
import SiteStatus from './SiteStatus'

const LayoutForm = ({
  formikProps,
  flaxSiteUrlForGroup,
  cmsLayout,
  submitButtonText,
  onHeaderPageOrderChanged,
  onFooterPageOrderChanged,
  createFile,
  deleteFile,
  triggerAutoSave,
}) => {
  const renderPrivateOption = () => {
    return (
      <SectionContent>
        <PaddedContent>
          <SiteStatus
            cmsLayout={cmsLayout}
            flaxSiteUrlForGroup={flaxSiteUrlForGroup}
            triggerAutoSave={triggerAutoSave}
          />
        </PaddedContent>
      </SectionContent>
    )
  }

  const renderBranding = () => {
    return (
      <SectionContent>
        <PaddedContent>
          <Branding
            cmsLayout={cmsLayout}
            createFile={createFile}
            deleteFile={deleteFile}
            formikProps={formikProps}
            triggerAutoSave={triggerAutoSave}
          />
        </PaddedContent>
      </SectionContent>
    )
  }

  const renderHeader = () => {
    return (
      <SectionContent>
        <PaddedContent>
          <Header
            cmsLayout={cmsLayout}
            onPageOrderUpdated={onHeaderPageOrderChanged}
          />
        </PaddedContent>
      </SectionContent>
    )
  }

  const renderFooter = () => {
    return (
      <SectionContent>
        <PaddedContent>
          <Footer
            cmsLayout={cmsLayout}
            createFile={createFile}
            deleteFile={deleteFile}
            formikProps={formikProps}
            onPageOrderUpdated={onFooterPageOrderChanged}
            triggerAutoSave={triggerAutoSave}
          />
        </PaddedContent>
      </SectionContent>
    )
  }

  return (
    <div>
      {renderBranding()}
      {renderHeader()}
      {renderFooter()}
      {renderPrivateOption()}
      <ActionButtonContainer>
        <div>
          <FormActionButton
            onClick={formikProps.handleSubmit}
            primary
            type="button"
          >
            {submitButtonText}
          </FormActionButton>
        </div>
        <PublishStatus cmsComponent={cmsLayout} />
      </ActionButtonContainer>
    </div>
  )
}

export default LayoutForm
