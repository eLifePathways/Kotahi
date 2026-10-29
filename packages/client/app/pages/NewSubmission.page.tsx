import {
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CombinedGraphQLErrors } from '@apollo/client'
import { useMutation, useQuery, useSubscription } from '@apollo/client/react'
import { uuid } from '@coko/client'

import { ConfigContext } from '../components/config/src'
import {
  CREATE_SUBMISSION,
  NEW_SUBMISSION_PROGRESS,
  NEW_SUBMISSION_SETTINGS,
} from '../queries'

import NewSubmission, {
  type NewSubmissionOption,
  type NewSubmissionStatus,
} from '../ui/pages/newSubmission/NewSubmission'

const ERROR_TRANSLATION_KEYS: Record<string, string> = {
  UNSUPPORTED_FILE_TYPE: 'newSubmission.errorUnsupportedFileType',
  FILE_TOO_LARGE: 'newSubmission.errorFileTooLarge',
  CONVERSION_FAILED: 'newSubmission.errorConversionFailed',
  CREATION_FAILED: 'newSubmission.errorCreationFailed',
}

const UPLOAD_SUBMIT_OPTIONS = [
  'allowAuthorUploadOnly',
  'allowAuthorUploadWithForm',
]

const SKIP_SUBMIT_OPTIONS = [
  'allowAuthorUploadWithForm',
  'allowAuthorSubmitForm',
  'allowAuthorSubmitFormWithBlankEditor',
]

const NewSubmissionPage = (): ReactNode => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const config = useContext(ConfigContext)

  // @ts-ignore
  const { groupId, urlFrag, instanceName, submission } = config
  const { title, submitOptions } = submission?.submissionPage ?? {}

  const showUpload =
    !submitOptions || UPLOAD_SUBMIT_OPTIONS.includes(submitOptions)
  const showSkip = !submitOptions || SKIP_SUBMIT_OPTIONS.includes(submitOptions)

  const [operationId] = useState(() => uuid())
  const [status, setStatus] = useState<NewSubmissionStatus>('idle')
  const [activeOption, setActiveOption] = useState<NewSubmissionOption>()
  const [errorMessage, setErrorMessage] = useState<string>()

  const { data: settingsData } = useQuery(NEW_SUBMISSION_SETTINGS)
  const [createSubmission] = useMutation(CREATE_SUBMISSION)

  const { maxUploadSizeMb, acceptedFileTypes } =
    // @ts-ignore
    settingsData?.newSubmissionSettings ?? {}

  useSubscription(NEW_SUBMISSION_PROGRESS, {
    variables: { operationId },
    onData: ({ data }) => {
      // @ts-ignore
      const step = data.data?.newSubmissionProgress
      if (!step) return

      setStatus(current =>
        current === 'completed' || current === 'error' ? current : step,
      )
    },
  })

  const isMounted = useRef(false)

  useEffect(() => {
    isMounted.current = true

    return (): void => {
      isMounted.current = false
    }
  }, [])

  const submit = useCallback(
    async (option: NewSubmissionOption, file?: File): Promise<void> => {
      setActiveOption(option)
      setErrorMessage(undefined)
      setStatus(file ? 'uploading' : 'creatingManuscript')

      try {
        const { data } = await createSubmission({
          variables: { groupId, file, operationId },
        })

        setStatus('completed')

        // do not redirect if you've moved to another page
        if (!isMounted.current) return

        const page = ['preprint1', 'preprint2'].includes(instanceName)
          ? 'evaluation'
          : 'submit'

        // @ts-ignore
        const manuscriptId = data.createSubmission.id

        navigate(`${urlFrag}/versions/${manuscriptId}/${page}`, {
          replace: true,
        })
      } catch (error) {
        const code = CombinedGraphQLErrors.is(error)
          ? error.errors[0]?.extensions?.code
          : undefined

        setStatus('error')

        setErrorMessage(
          t(
            ERROR_TRANSLATION_KEYS[String(code)] ??
              'newSubmission.errorUnknown',
            {
              maxSizeMb: maxUploadSizeMb,
            },
          ),
        )
      }
    },
    [
      createSubmission,
      groupId,
      instanceName,
      maxUploadSizeMb,
      navigate,
      operationId,
      t,
      urlFrag,
    ],
  )

  const handleUpload = useCallback(
    (files: File[]): void => {
      submit('upload', files[0])
    },
    [submit],
  )

  const handleSkip = useCallback((): void => {
    submit('skip')
  }, [submit])

  const hasAutoStarted = useRef(false)

  useEffect(() => {
    if (showUpload || !showSkip || hasAutoStarted.current) return
    hasAutoStarted.current = true
    submit('skip')
  }, [showSkip, showUpload, submit])

  return (
    <NewSubmission
      acceptedFileTypes={acceptedFileTypes}
      activeOption={activeOption}
      errorMessage={errorMessage}
      maxUploadSizeMb={maxUploadSizeMb}
      onSkip={handleSkip}
      onUpload={handleUpload}
      showSkip={showSkip}
      showUpload={showUpload}
      status={status}
      title={title}
    />
  )
}

export default NewSubmissionPage
