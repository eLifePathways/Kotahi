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

const FormBuilder = (): ReactNode => {
  const { groupName } = useParams()
  const { t } = useTranslation()

  return (
    <Page title={t('formsPage.title')}>
      <PageDescription>{t('formsPage.description')}</PageDescription>

      <CardGrid gap={5} minColumnWidth={100} minRowHeight={60}>
        <Card
          testId="card-link-submission"
          title={t('formsPage.submissionFormTitle')}
          type="link"
          url={`/${groupName}/admin/forms/submission-form-builder`}
        >
          {t('formsPage.submissionFormDescription')}
        </Card>

        <Card
          testId="card-link-review"
          title={t('formsPage.reviewFormTitle')}
          type="link"
          url={`/${groupName}/admin/forms/review-form-builder`}
        >
          {t('formsPage.reviewFormDescription')}
        </Card>

        <Card
          testId="card-link-decision"
          title={t('formsPage.decisionFormTitle')}
          type="link"
          url={`/${groupName}/admin/forms/decision-form-builder`}
        >
          {t('formsPage.decisionFormDescription')}
        </Card>
      </CardGrid>
    </Page>
  )
}

export default FormBuilder
