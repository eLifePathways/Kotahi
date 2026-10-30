import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { grid, th } from '@coko/client'

import Card from '../../shared/Card'
import Grid from '../../shared/Grid'
import Page from '../../shared/Page'
import Spinner from '../../shared/Spinner'

const CARD_WIDTH = 130
const CARD_HEIGHT = 65
const CARD_GAP = 5

// #region styled
const CardGrid = styled(Grid)<{ $columns: number }>`
  max-width: ${(props): string =>
    grid(props.$columns * CARD_WIDTH + (props.$columns - 1) * CARD_GAP)(props)};
  padding-bottom: ${grid(6)};
`

const Hint = styled.div`
  color: ${th('colorTextMuted')};
  padding-top: ${grid(2)};
`

const Status = styled.div`
  display: flex;
  align-items: center;
  gap: ${grid(2)};
`

const Error = styled.div`
  color: ${th('colorError')};
`

const FullPageError = styled(Error)`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`
// #endregion styled

export type NewSubmissionStep =
  | 'uploading'
  | 'converting'
  | 'cleaning'
  | 'inferringMetadata'
  | 'creatingManuscript'

export type NewSubmissionStatus =
  | 'idle'
  | NewSubmissionStep
  | 'completed'
  | 'error'

const stepTranslationKeys: Record<NewSubmissionStep, string> = {
  uploading: 'newSubmission.stepUploading',
  converting: 'newSubmission.stepConverting',
  cleaning: 'newSubmission.stepCleaning',
  inferringMetadata: 'newSubmission.stepInferringMetadata',
  creatingManuscript: 'newSubmission.stepCreating',
}

export type NewSubmissionOption = 'upload' | 'skip'

type NewSubmissionProps = {
  /** Page title. Defaults to the translated "New submission". */
  title?: string
  /** File types the upload card accepts, as extensions and/or MIME types. Listed under the upload card's description, together with the size limit. */
  acceptedFileTypes?: string[]
  /** Largest file the upload card accepts, in MB. */
  maxUploadSizeMb?: number
  /** Show the "Upload a manuscript" card. */
  showUpload: boolean
  /** Show the "Start without a file" card. When it's the only option, the page shows a full-page spinner instead, since there's no choice to make. */
  showSkip: boolean
  /** Where the submission is in its lifecycle: `idle` before anything starts, one of the steps (`uploading`, `converting`, `cleaning`, `inferringMetadata`, `creatingManuscript`) while it's being created, then `completed` or `error`. */
  status: NewSubmissionStatus
  /** Which card the user chose, so the status is shown on that card and the other one is disabled. */
  activeOption?: NewSubmissionOption
  /** Message shown when `status` is `error`. */
  errorMessage?: string
  /** Called with the selected or dropped file when the user chooses to upload a manuscript. */
  onUpload: (files: File[]) => void
  /** Called when the user chooses to start without a file. */
  onSkip: () => void
}

const NewSubmission = (props: NewSubmissionProps): ReactNode => {
  const {
    title,
    acceptedFileTypes,
    maxUploadSizeMb,
    showUpload,
    showSkip,
    status,
    activeOption,
    errorMessage,
    onUpload,
    onSkip,
  } = props

  const { t } = useTranslation()

  const isBusy = status !== 'idle' && status !== 'error'

  const statusContent = (option: NewSubmissionOption): ReactNode => {
    if (activeOption !== option || status === 'idle') return null

    if (status === 'error') {
      return (
        <Error role="alert">
          {t('newSubmission.errorUploading', { error: errorMessage })}
        </Error>
      )
    }

    const stepText =
      status === 'completed'
        ? t('newSubmission.redirecting')
        : t(stepTranslationKeys[status])

    return (
      <Status>
        <Spinner aria-label={stepText} size={4} />
        <span aria-hidden>{stepText}</span>
      </Status>
    )
  }

  const pageTitle = title ?? t('newSubmission.New submission')

  if (!showUpload && showSkip) {
    if (status === 'error') {
      return (
        <Page title={pageTitle}>
          <FullPageError role="alert">
            {t('newSubmission.errorUploading', { error: errorMessage })}
          </FullPageError>
        </Page>
      )
    }

    let spinnerDescription = t('newSubmission.stepCreating')

    if (status === 'completed')
      spinnerDescription = t('newSubmission.redirecting')

    return (
      <Page title={pageTitle}>
        <Spinner description={spinnerDescription} fullpage />
      </Page>
    )
  }

  const columns = Number(showUpload) + Number(showSkip)

  return (
    <Page title={pageTitle}>
      <CardGrid
        $columns={columns}
        gap={CARD_GAP}
        minColumnWidth={CARD_WIDTH}
        minRowHeight={CARD_HEIGHT}
      >
        {showUpload && (
          <Card
            accept={acceptedFileTypes?.join(',')}
            busy={isBusy && activeOption === 'upload'}
            disabled={isBusy && activeOption !== 'upload'}
            onDrop={files => {
              if (files.length) onUpload(files)
            }}
            testId="card-upload-upload"
            title={t('newSubmission.uploadTitle')}
            type="upload"
          >
            {statusContent('upload') ?? (
              <>
                {t('newSubmission.uploadDescription')}
                {!!acceptedFileTypes?.length && !!maxUploadSizeMb && (
                  <Hint>
                    {t('newSubmission.fileRequirements', {
                      fileTypes: acceptedFileTypes.join(', '),
                      maxSizeMb: maxUploadSizeMb,
                    })}
                  </Hint>
                )}
              </>
            )}
          </Card>
        )}

        {showSkip && (
          <Card
            busy={isBusy && activeOption === 'skip'}
            disabled={isBusy && activeOption !== 'skip'}
            onClick={onSkip}
            testId="card-button-skip"
            title={t('newSubmission.skipTitle')}
            type="button"
          >
            {statusContent('skip') ?? t('newSubmission.skipDescription')}
          </Card>
        )}
      </CardGrid>
    </Page>
  )
}

export default NewSubmission
