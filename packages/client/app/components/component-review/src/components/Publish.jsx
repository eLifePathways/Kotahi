/* eslint-disable react/prop-types */
/* eslint-disable promise/always-return, promise/catch-or-return */

import { useState, useContext } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import i18next from 'i18next'
import styled, { useTheme } from 'styled-components'
import { th, grid } from '@coko/client'
import { Formik } from 'formik'

import { ConfigContext } from '../../../config/src'
import { RadioBox } from '../../../component-formbuilder/src/components/builderComponents'
import { Legend } from '../../../component-formbuilder/src/components/style'
import { ValidatedFieldFormik } from '../../../pubsweet'
import {
  Title,
  SectionHeader,
  SectionRowGrid,
  SectionActionInfo,
  SectionAction,
} from './style'
import { ActionButton, SectionContent } from '../../../shared'
import Alert from './publishing/Alert'
import PublishingResponse from './publishing/PublishingResponse'
import { getLanguages } from '../../../../i18n'
import { FlexRow } from '../../../../globals'

const ActionButtonsWrapper = styled(FlexRow)`
  gap: 8px;

  /* Keep labels on one line when a status icon is added */
  > * {
    flex-shrink: 0;
    white-space: nowrap;
  }
`

const UnpublishButton = styled(ActionButton)`
  cursor: pointer;
  outline: 1px solid ${th('color.error.base')};
`

const PublishButton = styled(ActionButton)`
  cursor: pointer;
  outline: 1px solid ${th('color.brand1.base')};
`

const PublishWrapper = styled.div`
  div {
    margin-bottom: ${grid(4)};
  }

  /* ActionButton's spinner/status icons are divs; don't push them off-centre */
  button div {
    margin-bottom: 0;
  }
`

const AdaStatusWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${grid(4)};
  margin-bottom: ${grid(4)};
`

const Publish = ({
  areVerdictOptionsComplete,
  dois,
  manuscript,
  onRefreshAdaStatus,
  publishManuscript,
  unpublish,
  updateAda,
}) => {
  // Hooks from the old world
  const config = useContext(ConfigContext)
  const theme = useTheme()
  const [isPublishing, setIsPublishing] = useState(false)
  const [isUnpublishing, setIsUnpublishing] = useState(false)
  // Which button the current response/error belongs to
  const [lastAction, setLastAction] = useState(null)
  const [publishResponse, setPublishResponse] = useState(null)
  const [publishAdaResponse, setPublishAdaResponse] = useState(null)
  const [publishingError, setPublishingError] = useState(null)

  const [isRefreshingAdaStatus, setIsRefreshingAdaStatus] = useState(false)

  const { t } = useTranslation()

  const notAccepted = !['accepted', 'published', 'unpublished'].includes(
    manuscript.status,
  )

  const doiMessage =
    dois !== null &&
    (dois.length > 0 ? (
      <p>
        {t('decisionPage.decisionTab.doisToBeRegistered', {
          dois: dois.join(', '),
        })}
      </p>
    ) : (
      <p>{t('decisionPage.decisionTab.noDoisToBeRegistered')}</p>
    ))

  const formatPublishedDate = date => {
    const curLang = getLanguages().find(elem => elem.value === i18next.language)

    return !!curLang && !!curLang.funcs?.formatDate
      ? curLang.funcs?.formatDate(date, true, false)
      : date
  }

  const handlePublish = () => {
    setLastAction('publish')
    setPublishingError(null)
    setIsPublishing(true)

    publishManuscript({ variables: { id: manuscript.id } })
      .then((res, error) => {
        setIsPublishing(false)
        setPublishResponse(res.data.publishManuscript, error)
      })
      .catch(error => {
        console.error(error)
        setIsPublishing(false)
        setPublishingError(error.message)
      })
  }

  const handleUnpublish = () => {
    setLastAction('unpublish')
    setPublishingError(null)
    setIsUnpublishing(true)

    unpublish(manuscript.id)
      .then(() => {
        setPublishResponse({ steps: [{ unpublished: true }] })
      })
      .catch(error => {
        console.error(error)
        setPublishingError(error.message)
      })
      .finally(() => setIsUnpublishing(false))
  }

  const handleRefreshAdaStatus = () => {
    setIsRefreshingAdaStatus(true)

    onRefreshAdaStatus({ variables: { id: manuscript.id } }).finally(() => {
      setIsRefreshingAdaStatus(false)
    })
  }

  const adaState = manuscript.submission?.adaState
  const adaProcessStatus = manuscript.submission?.adaProcessStatus
  const adaJobId = manuscript.submission?.adaJobId
  const adaJobStatus = manuscript.submission?.adaJobStatus
  const adaJobDetails = manuscript.submission?.adaJobDetails

  const adaJobFailed = adaJobStatus === 'Failed' && !!adaJobDetails
  const adaDisplayStatus = adaJobFailed ? adaJobStatus : adaProcessStatus

  const getActionStatus = (action, isInProgress) => {
    if (isInProgress) return 'pending'
    if (lastAction !== action) return undefined
    if (publishingError) return 'failure'
    if (publishResponse) return 'success'
    return undefined
  }

  const publishingStatus = getActionStatus('publish', isPublishing)
  const unpublishingStatus = getActionStatus('unpublish', isUnpublishing)

  return (
    <PublishWrapper>
      <SectionContent>
        <SectionHeader>
          <Title>{t('decisionPage.decisionTab.Publishing')}</Title>
        </SectionHeader>

        <SectionRowGrid>
          <SectionActionInfo>
            {manuscript.published && manuscript.status !== 'unpublished' && (
              <Trans
                i18nKey="decisionPage.decisionTab.publishedOn"
                shouldUnescape
              >
                {{ date: formatPublishedDate(manuscript.published) }}
              </Trans>
            )}

            {!manuscript.published &&
              notAccepted &&
              areVerdictOptionsComplete && (
                <div>
                  <p>{t('decisionPage.decisionTab.publishOnlyAccepted')}</p>
                  {doiMessage}
                </div>
              )}
            {!manuscript.published &&
              !(notAccepted && areVerdictOptionsComplete) && (
                <div>
                  <p>{t('decisionPage.decisionTab.publishingNewEntry')}</p>
                  {doiMessage}
                </div>
              )}
            {publishResponse && (
              <PublishingResponse response={publishResponse} />
            )}
            {publishingError && <Alert type="error">{publishingError}</Alert>}
          </SectionActionInfo>
          <SectionAction>
            <ActionButtonsWrapper>
              {manuscript.published && manuscript.status !== 'unpublished' && (
                <UnpublishButton
                  color={theme.color.error.base}
                  data-testid="unpublish-button"
                  disabled={isPublishing}
                  onClick={handleUnpublish}
                  status={unpublishingStatus}
                >
                  {t('decisionPage.decisionTab.Unpublish')}
                </UnpublishButton>
              )}
              <PublishButton
                data-testid="publish-button"
                // Not disabled while pending, so the spinner shows (ActionButton ignores clicks then)
                disabled={
                  (notAccepted && areVerdictOptionsComplete) || isUnpublishing
                }
                onClick={handlePublish}
                primary
                status={publishingStatus}
              >
                {manuscript.published && manuscript.status !== 'unpublished'
                  ? t('decisionPage.decisionTab.Republish')
                  : t('decisionPage.decisionTab.Publish')}
              </PublishButton>
            </ActionButtonsWrapper>
          </SectionAction>
        </SectionRowGrid>
      </SectionContent>
      {config.publishing.ada?.enableAdaPublish && (
        <SectionContent>
          <SectionHeader>
            <Title>{t('decisionPage.decisionTab.PublishingAda')}</Title>
          </SectionHeader>
          <SectionRowGrid>
            <Formik
              initialValues={{ adaState: manuscript.submission?.adaState }}
              onSubmit={(values, { setSubmitting }) => {
                updateAda({
                  variables: { id: manuscript.id, adaState: values.adaState },
                })
                  .then((res, error) => {
                    setPublishAdaResponse(res.data.updateAda, error)
                    setSubmitting(false)
                  })
                  .catch(error => {
                    setSubmitting(false)
                    setPublishingError(error.message)
                  })
              }}
            >
              {({ values, setFieldValue, handleSubmit }) => (
                <form onSubmit={handleSubmit}>
                  <Legend>
                    {t('decisionPage.decisionTab.PublishingAdaState')}
                  </Legend>
                  {adaProcessStatus && adaJobId && (
                    <AdaStatusWrapper>
                      <span>
                        {t('decisionPage.decisionTab.currentAdaStatus')}:
                      </span>
                      <span>{adaDisplayStatus}</span>
                      {adaJobFailed && (
                        <Alert type="error">{adaJobDetails}</Alert>
                      )}
                      <ActionButton
                        disabled={isRefreshingAdaStatus}
                        onClick={handleRefreshAdaStatus}
                        primary
                      >
                        {t('decisionPage.decisionTab.refreshAdaStatus')}
                      </ActionButton>
                    </AdaStatusWrapper>
                  )}
                  <ValidatedFieldFormik
                    component={RadioBox}
                    name="adaState"
                    onChange={v => {
                      setFieldValue('adaState', v)
                    }}
                    options={[
                      {
                        value: 'draft',
                        label: t('decisionPage.decisionTab.Draft'),
                        disabled: !!adaState,
                      },
                      {
                        value: 'process',
                        label: t('decisionPage.decisionTab.Process'),
                        disabled: adaState !== 'draft',
                      },
                      {
                        value: 'findable',
                        label: t('decisionPage.decisionTab.Findable'),
                        disabled: !(
                          adaState === 'process' &&
                          adaProcessStatus === 'Processed'
                        ),
                      },
                      {
                        value: 'publish',
                        label: t('decisionPage.decisionTab.Publish'),
                        disabled: !(
                          adaState === 'findable' &&
                          adaProcessStatus === 'Calibration and Validation'
                        ),
                      },
                    ]}
                    value={values.adaState}
                  />
                  <ActionButton
                    disabled={
                      (notAccepted && areVerdictOptionsComplete) || isPublishing
                    }
                    onClick={handleSubmit}
                    primary
                  >
                    {t('decisionPage.decisionTab.UpdateAda')}
                  </ActionButton>
                  {publishAdaResponse && (
                    <PublishingResponse response={publishAdaResponse} />
                  )}
                </form>
              )}
            </Formik>
          </SectionRowGrid>
        </SectionContent>
      )}
    </PublishWrapper>
  )
}

export default Publish
