/* eslint-disable react/prop-types */

import { useTranslation } from 'react-i18next'
import Alert from './Alert'

const PublishingResponse = ({ response }) => {
  const { t } = useTranslation()
  if (!response?.steps) return null

  return response.steps.map(step => {
    const { errorDetails, errorMessage, stepLabel, succeeded, unpublished } =
      step

    if (unpublished) {
      return (
        <Alert key={stepLabel} type="success">
          {t('decisionPage.decisionTab.unpublishResponse')}
        </Alert>
      )
    }

    if (succeeded) {
      return (
        <Alert key={stepLabel} type="success">
          {t('decisionPage.decisionTab.postedTo', { stepLabel })}
        </Alert>
      )
    }

    return (
      <>
        <Alert detail={errorMessage} key={stepLabel} type="error">
          {t('decisionPage.decisionTab.errorPosting', { stepLabel })}
        </Alert>
        {errorDetails?.map((key, detail) => (
          <Alert detail={detail} key={`detail-${key}`} type="error">
            {t('decisionPage.decisionTab.errorPosting', { stepLabel })}
          </Alert>
        ))}
      </>
    )
  })
}

export default PublishingResponse
