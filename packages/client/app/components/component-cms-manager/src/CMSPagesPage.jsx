import { useContext, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/client/react'
import { useTranslation } from 'react-i18next'
import { Spinner, CommsErrorBanner } from '../../shared'

import CMSPageEditForm from './pages/CMSPageEdit'

import CMSPageEditSidebar from './pages/CMSPageEditSidebar'

import { ConfigContext } from '../../config/src'

import { EditPageContainer, EditPageLeft, EditPageRight } from './style'

import PageHeader from './components/PageHeader'

import {
  createCMSPageMutation,
  getCMSPages,
  updateCMSPageDataMutation,
  rebuildFlaxSiteMutation,
  deleteCMSPageMutation,
} from './queries'

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
  } = useQuery(getCMSPages)

  const [createNewCMSPage] = useMutation(createCMSPageMutation)
  const [updatePageDataQuery] = useMutation(updateCMSPageDataMutation)
  const [rebuildFlaxSiteQuery] = useMutation(rebuildFlaxSiteMutation)
  const [deleteCMSPage] = useMutation(deleteCMSPageMutation)

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
    <EditPageContainer>
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
        <PageHeader
          leftSideOnly
          mainHeading={
            isNewPage ? t('cmsPage.pages.New Page') : t('cmsPage.pages.Pages')
          }
        />
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
    </EditPageContainer>
  )
}

export default CMSPagesPage
