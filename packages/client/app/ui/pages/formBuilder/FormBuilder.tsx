import { type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { grid } from '@coko/client'

import CardGrid from '../../shared/CardGrid'
import Page from '../../shared/Page'
import PageDescription from '../../shared/PageDescription'

const Grid = styled(CardGrid)`
  padding-bottom: ${grid(6)};
`

const FormBuilder = (): ReactNode => {
  const { groupName } = useParams()
  const { t } = useTranslation()

  return (
    <Page title={t('formsPage.title')}>
      <PageDescription>{t('formsPage.description')}</PageDescription>
      <Grid
        items={[
          {
            title: t('formsPage.submissionFormTitle'),
            description: t('formsPage.submissionFormDescription'),
            url: `/${groupName}/admin/forms/submission-form-builder`,
            key: 'submission',
          },
          {
            title: t('formsPage.reviewFormTitle'),
            description: t('formsPage.reviewFormDescription'),
            url: `/${groupName}/admin/forms/review-form-builder`,
            key: 'review',
          },
          {
            title: t('formsPage.decisionFormTitle'),
            description: t('formsPage.decisionFormDescription'),
            url: `/${groupName}/admin/forms/decision-form-builder`,
            key: 'decision',
          },
        ]}
      />
    </Page>
  )
}

export default FormBuilder
