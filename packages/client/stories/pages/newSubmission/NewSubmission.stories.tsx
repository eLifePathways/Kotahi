import {
  useState,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from 'react'
import styled from 'styled-components'

import preview from '../../../.storybook/preview'
import NewSubmission, {
  type NewSubmissionOption,
  type NewSubmissionStatus,
  type NewSubmissionStep,
} from '../../../app/ui/pages/newSubmission/NewSubmission'

type NewSubmissionProps = ComponentProps<typeof NewSubmission>

type DemoProps = Omit<
  NewSubmissionProps,
  'status' | 'activeOption' | 'errorMessage' | 'onUpload' | 'onSkip'
> & {
  outcome: 'completed' | 'error'
}

const uploadSteps: NewSubmissionStep[] = [
  'uploading',
  'converting',
  'cleaning',
  'inferringMetadata',
  'creatingManuscript',
]

const skipSteps: NewSubmissionStep[] = ['creatingManuscript']

const STEP_DURATION = 1500

const Demo = (props: DemoProps): ReactNode => {
  const { outcome, ...rest } = props
  const [status, setStatus] = useState<NewSubmissionStatus>('idle')
  const [activeOption, setActiveOption] = useState<NewSubmissionOption>()

  const simulate = (option: NewSubmissionOption): void => {
    const steps = option === 'upload' ? uploadSteps : skipSteps
    const failAt = outcome === 'error' ? 2 : steps.length

    setActiveOption(option)

    steps.slice(0, failAt).forEach((step, index) => {
      setTimeout(() => setStatus(step), index * STEP_DURATION)
    })

    setTimeout(
      () => {
        setStatus(outcome)
        setTimeout(() => setStatus('idle'), 3000)
      },
      Math.min(failAt, steps.length) * STEP_DURATION,
    )
  }

  return (
    <NewSubmission
      {...rest}
      activeOption={activeOption}
      errorMessage={
        activeOption === 'skip'
          ? 'The submission could not be created.'
          : 'The file could not be converted.'
      }
      onSkip={(): void => simulate('skip')}
      onUpload={(): void => simulate('upload')}
      status={status}
    />
  )
}

const baseArgs = {
  acceptedFileTypes: [
    '.docx',
    '.tex',
    '.latex',
    '.txt',
    '.dvi',
    '.pdf',
    '.epub',
    '.zip',
  ],
  maxUploadSizeMb: 50,
  showUpload: true,
  showSkip: true,
  status: 'idle',
  onUpload: (): void => {},
  onSkip: (): void => {},
} satisfies NewSubmissionProps

const FullHeight = styled.div`
  height: 100vh;
`

const fullHeight = (Story: () => ReactElement): ReactElement => (
  <FullHeight>
    <Story />
  </FullHeight>
)

const meta = preview.meta({
  component: NewSubmission,
})

/** Drop a file on the upload card (or click it) to step through uploading, converting, preparing, AI metadata and creating. Click the other card to step through creating a submission without a file. */
export const Base = meta.story({
  render: () => <Demo {...baseArgs} outcome="completed" />,
})

/** Uploading fails during conversion, and starting without a file fails while creating the submission. */
export const UploadFails = meta.story({
  render: () => <Demo {...baseArgs} outcome="error" />,
})

export const UploadOnly = meta.story({
  args: { ...baseArgs, showSkip: false } satisfies NewSubmissionProps,
})

/** With only "Start without a file" enabled, there's no choice to make, so the page shows a full-page spinner while the submission is created. */
export const FormOnly = meta.story({
  decorators: [fullHeight],
  args: { ...baseArgs, showUpload: false } satisfies NewSubmissionProps,
})

export const FormOnlyRedirecting = meta.story({
  decorators: [fullHeight],
  args: {
    ...baseArgs,
    showUpload: false,
    status: 'completed',
  } satisfies NewSubmissionProps,
})

export const FormOnlyFailed = meta.story({
  decorators: [fullHeight],
  args: {
    ...baseArgs,
    showUpload: false,
    status: 'error',
    errorMessage: 'The submission could not be created.',
  } satisfies NewSubmissionProps,
})

export const CustomTitleAndFileTypes = meta.story({
  args: {
    ...baseArgs,
    title: 'Submit your research',
    acceptedFileTypes: ['.docx', '.pdf'],
    maxUploadSizeMb: 20,
  } satisfies NewSubmissionProps,
})

export const Uploading = meta.story({
  args: {
    ...baseArgs,
    status: 'uploading',
    activeOption: 'upload',
  } satisfies NewSubmissionProps,
})

export const Converting = meta.story({
  args: {
    ...baseArgs,
    status: 'converting',
    activeOption: 'upload',
  } satisfies NewSubmissionProps,
})

export const Cleaning = meta.story({
  args: {
    ...baseArgs,
    status: 'cleaning',
    activeOption: 'upload',
  } satisfies NewSubmissionProps,
})

export const InferringMetadata = meta.story({
  args: {
    ...baseArgs,
    status: 'inferringMetadata',
    activeOption: 'upload',
  } satisfies NewSubmissionProps,
})

export const CreatingManuscript = meta.story({
  args: {
    ...baseArgs,
    status: 'creatingManuscript',
    activeOption: 'upload',
  } satisfies NewSubmissionProps,
})

export const CreatingWithoutFile = meta.story({
  args: {
    ...baseArgs,
    status: 'creatingManuscript',
    activeOption: 'skip',
  } satisfies NewSubmissionProps,
})

export const Created = meta.story({
  args: {
    ...baseArgs,
    status: 'completed',
    activeOption: 'upload',
  } satisfies NewSubmissionProps,
})

export const Failed = meta.story({
  args: {
    ...baseArgs,
    status: 'error',
    activeOption: 'upload',
    errorMessage: 'The file could not be converted.',
  } satisfies NewSubmissionProps,
})
