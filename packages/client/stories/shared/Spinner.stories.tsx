import { useState, type ReactNode } from 'react'
import styled from 'styled-components'
import { grid } from '@coko/client'

import preview from '../../.storybook/preview'
import Button from '../../app/ui/shared/Button'
import Spinner from '../../app/ui/shared/Spinner'

const ReverseWrapper = styled.div`
  padding: 16px;
  display: inline-block;
  background-color: ${(props): string => props.theme.colorPrimary};
`

const DelayDemoWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${grid(4)};
`

const DelayDemo = (): ReactNode => {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <DelayDemoWrapper>
      <Button onClick={(): void => setIsLoading(current => !current)}>
        {isLoading ? 'Stop loading' : 'Start loading'}
      </Button>

      {isLoading && <Spinner delay={1000} />}
    </DelayDemoWrapper>
  )
}

const FullPageArea = styled.div`
  height: 400px;
  border: 1px dashed ${(props): string => props.theme.colorBorder};
`

const ToggleButton = styled(Button)`
  margin-bottom: ${grid(4)};
`

const NestedSpinner = styled(Spinner)`
  max-width: 480px;
`

const NestedPanel = styled.div`
  padding: ${grid(6)};
  border: 1px dashed ${(props): string => props.theme.colorBorder};
`

type WrappingContentDemoProps = {
  delay?: number
  initialSpinning?: boolean
  description?: string
}

const WrappingContentDemo = (props: WrappingContentDemoProps): ReactNode => {
  const { delay, initialSpinning = true, description = 'Saving...' } = props
  const [isSpinning, setIsSpinning] = useState(initialSpinning)

  return (
    <>
      <ToggleButton onClick={(): void => setIsSpinning(current => !current)}>
        {isSpinning ? 'Stop spinning' : 'Start spinning'}
      </ToggleButton>

      <NestedSpinner
        delay={delay}
        description={description || undefined}
        spinning={isSpinning}
      >
        <NestedPanel>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas a
            consectetur felis. Vestibulum hendrerit eleifend nulla, ac facilisis
            urna faucibus ac. Nunc at leo eget felis eleifend scelerisque.
          </p>
          <Button>A button you cannot click while loading</Button>
        </NestedPanel>
      </NestedSpinner>
    </>
  )
}

const meta = preview.meta({
  component: Spinner,
})

export const Base = meta.story({})

/** With an `aria-label`, the spinner is announced to screen readers as a status. Without one, it's hidden from them, for use next to visible text. */
export const WithAriaLabel = meta.story({
  args: {
    'aria-label': 'Loading',
  },
})

/** With a `delay` (in milliseconds), nothing renders until it has passed, so loads that finish quickly never show a spinner. Start loading to see the spinner appear after 1 second, or stop before then to see it never appear. */
export const WithDelay = meta.story({
  render: () => <DelayDemo />,
})

/** A `description` is shown under the spinner and announced to screen readers as a status, so no `aria-label` is needed. */
export const WithDescription = meta.story({
  args: {
    description: 'Loading manuscripts...',
  },
})

export const Small = meta.story({
  args: {
    size: 6,
  },
})

export const Large = meta.story({
  args: {
    size: 16,
  },
})

export const Reverse = meta.story({
  render: () => (
    <ReverseWrapper>
      <Spinner reverse />
    </ReverseWrapper>
  ),
})

export const ReverseWithDescription = meta.story({
  render: () => (
    <ReverseWrapper>
      <Spinner description="Loading manuscripts..." reverse />
    </ReverseWrapper>
  ),
})

/** Fills the space it's given and centres the spinner in it, for a page that's still loading its data. The dashed box stands in for the page area. */
export const FullPage = meta.story({
  render: () => (
    <FullPageArea>
      <Spinner description="Loading dashboard..." fullpage />
    </FullPageArea>
  ),
})

/** Wraps content, dims it and centres the spinner over it. The content can't be interacted with while loading. Use the button to toggle `spinning` and see the content without unmounting it. */
export const WrappingContent = meta.story({
  render: () => <WrappingContentDemo />,
})

/** With a `delay`, the content stays as it is when spinning starts, and only fades with the spinner over it once the delay has passed. Start spinning, then stop within a second to see the content never fade. */
export const WrappingContentWithDelay = meta.story({
  render: () => <WrappingContentDemo delay={1000} initialSpinning={false} />,
})

/** Without a `description` or `aria-label`, only the spinner shows over the content, and screen readers announce a default, translated "Loading". */
export const WrappingContentWithoutDescription = meta.story({
  render: () => <WrappingContentDemo description="" />,
})

/** With content taller than about 400px, the spinner is centred in the top part of it rather than in the middle, so it stays on screen without scrolling. */
export const WrappingTallContent = meta.story({
  render: () => (
    <NestedSpinner description="Loading...">
      <NestedPanel>
        {Array.from({ length: 30 }, (_, index) => (
          <p key={index}>Row {index + 1}</p>
        ))}
      </NestedPanel>
    </NestedSpinner>
  ),
})
