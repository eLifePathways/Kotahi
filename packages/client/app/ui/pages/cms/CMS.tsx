import { type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { grid } from '@coko/client'

import Card from '../../shared/Card'
import Grid from '../../shared/Grid'
import Page from '../../shared/Page'
import PageDescription from '../../shared/PageDescription'

const CardGrid = styled(Grid)`
  padding-bottom: ${grid(6)};
`

const CMS = (): ReactNode => {
  const { groupName } = useParams()
  const { t } = useTranslation()

  return (
    <Page title={t('cmsIndexPage.title')}>
      <PageDescription>{t('cmsIndexPage.description')}</PageDescription>

      <CardGrid gap={5} minColumnWidth={100} minRowHeight={60}>
        <Card
          testId="card-link-pages"
          title={t('cmsIndexPage.pagesTitle')}
          type="link"
          url={`/${groupName}/admin/cms/pages`}
        >
          {t('cmsIndexPage.pagesDescription')}
        </Card>

        <Card
          testId="card-link-layout"
          title={t('cmsIndexPage.layoutTitle')}
          type="link"
          url={`/${groupName}/admin/cms/layout`}
        >
          {t('cmsIndexPage.layoutDescription')}
        </Card>

        <Card
          testId="card-link-article"
          title={t('cmsIndexPage.articleTitle')}
          type="link"
          url={`/${groupName}/admin/cms/article`}
        >
          {t('cmsIndexPage.articleDescription')}
        </Card>

        <Card
          testId="card-link-metadata"
          title={t('cmsIndexPage.metadataTitle')}
          type="link"
          url={`/${groupName}/admin/cms/metadata`}
        >
          {t('cmsIndexPage.metadataDescription')}
        </Card>

        <Card
          testId="card-link-filebrowser"
          title={t('cmsIndexPage.fileBrowserTitle')}
          type="link"
          url={`/${groupName}/admin/cms/filebrowser`}
        >
          {t('cmsIndexPage.fileBrowserDescription')}
        </Card>

        <Card
          testId="card-link-collections"
          title={t('cmsIndexPage.collectionsTitle')}
          type="link"
          url={`/${groupName}/admin/cms/collections`}
        >
          {t('cmsIndexPage.collectionsDescription')}
        </Card>
      </CardGrid>
    </Page>
  )
}

export default CMS
