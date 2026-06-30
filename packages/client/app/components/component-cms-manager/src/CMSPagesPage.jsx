import { useContext, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/client/react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { th, grid } from '@coko/client'
import { Spinner, CommsErrorBanner, SectionContent } from '../../shared'

import CMSPageEditForm from './pages/CMSPageEdit'

import CMSPageEditSidebar from './pages/CMSPageEditSidebar'

import { ConfigContext } from '../../config/src'

import {
  EditPageContainer,
  EditPageLeft as BaseEditPageLeft,
  EditPageRight as BaseEditPageRight,
} from './style'

import Page from '../../../ui/shared/Page'

import {
  GET_CMS_PAGES,
  CREATE_CMS_PAGE,
  UPDATE_CMS_PAGE_DATA,
  REBUILD_FLAX_SITE,
  DELETE_CMS_PAGE,
} from '../../../queries'

const EditPageLeft = styled(BaseEditPageLeft)`
  overflow-y: auto;
`

const EditPageRight = styled(BaseEditPageRight)`
  background-color: transparent;
  border-left: 2px solid ${th('colorPrimary')};
  overflow-y: auto;

  /* stylelint-disable-next-line selector-class-pattern */
  .ProseMirror {
    padding: ${grid(2)};
  }
`

const FullHeightContainer = styled(EditPageContainer)`
  background: ${th('color.backgroundC')};
  height: calc(100vh - 160px);
`

const CMSPagesPage = () => {
  const navigate = useNavigate()
  const params = useParams()
  const { t } = useTranslation()
  const [isNewPage, setIsNewPage] = useState(false)
  const config = useContext(ConfigContext)
  const { urlFrag, groupName } = config

  const {
    loading,
    data,
    error,
    refetch: refetchCMSPages,
  } = useQuery(GET_CMS_PAGES)

  const [createNewCMSPage] = useMutation(CREATE_CMS_PAGE)
  const [updatePageDataQuery] = useMutation(UPDATE_CMS_PAGE_DATA)
  const [rebuildFlaxSiteQuery] = useMutation(REBUILD_FLAX_SITE)
  const [deleteCMSPage] = useMutation(DELETE_CMS_PAGE)

  const flaxSiteUrlForGroup = `${config.flaxSiteUrl}/${groupName}/`

  let currentCMSPageId = null

  if (params.pageId) {
    currentCMSPageId = params.pageId
  }

  const showPage = async currentCMSPage => {
    setIsNewPage(false)
    await refetchCMSPages()
    const link = `${urlFrag}/admin/cms/pages/${currentCMSPage.id}`
    navigate(link)
  }

  const addNewPage = () => {
    if (isNewPage) {
      return
    }

    const newPageLink = `${urlFrag}/admin/cms/pages/`
    navigate(newPageLink)

    setIsNewPage(true)
  }

  if (loading) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />

  const { cmsPages } = data

  let cmsPage = cmsPages.length > 0 ? cmsPages[0] : null

  if (currentCMSPageId) {
    cmsPage = cmsPages.find(obj => {
      return obj.id === currentCMSPageId
    })
  }

  if (isNewPage) {
    cmsPage = {}
  }

  return (
    <Page
      title={isNewPage ? t('cmsPage.pages.New Page') : t('cmsPage.pages.Pages')}
    >
      <FullHeightContainer>
        <SectionContent
          style={{ display: 'flex', flex: 1, overflow: 'hidden' }}
        >
          <EditPageLeft>
            <CMSPageEditSidebar
              cmsPages={cmsPages}
              currentCMSPage={cmsPage}
              isNewPage={isNewPage}
              onItemClick={selectedCmsPage => showPage(selectedCmsPage)}
              onNewItemButtonClick={() => addNewPage()}
            />
          </EditPageLeft>
          <EditPageRight>
            {cmsPage && (
              <CMSPageEditForm
                cmsPage={cmsPage}
                createNewCMSPage={createNewCMSPage}
                deleteCMSPage={deleteCMSPage}
                flaxSiteUrlForGroup={flaxSiteUrlForGroup}
                isNewPage={isNewPage}
                key={cmsPage.id}
                rebuildFlaxSiteQuery={rebuildFlaxSiteQuery}
                showPage={showPage}
                updatePageDataQuery={updatePageDataQuery}
              />
            )}
          </EditPageRight>
        </SectionContent>
      </FullHeightContainer>
    </Page>
  )
}

export default CMSPagesPage
