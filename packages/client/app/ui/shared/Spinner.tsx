// https://cssloaders.github.io/#rect

import { useEffect, useState, type AriaAttributes, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css, keyframes, type RuleSet } from 'styled-components'

import { grid, th } from '@coko/client'

const flipX = keyframes`
  0% {
    transform: perspective(var(--perspective)) rotateX(0deg) rotateY(0deg);
  }

  50% {
    transform: perspective(var(--perspective)) rotateX(-180deg) rotateY(0deg);
  }

  100% {
    transform: perspective(var(--perspective)) rotateX(-180deg) rotateY(-180deg);
  }
`

const pulse = keyframes`
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }
`

const Wrapper = styled.span<{ $reverse: boolean; $size: number }>`
  display: inline-block;
  background: ${(props): string =>
    props.$reverse ? props.theme.colorTextReverse : props.theme.colorPrimary};

  width: ${(props): string => grid(props.$size)(props)};
  height: ${(props): string => grid(props.$size)(props)};

  --perspective: calc(${(props): string => grid(props.$size)(props)} * 4);
  animation: ${flipX} 0.9s linear infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: ${pulse} 2s ease-in-out infinite;
  }
`

const WithDescription = styled.span`
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: ${grid(3)};
`

const Description = styled.span<{ $reverse: boolean }>`
  color: ${(props): string =>
    props.$reverse ? props.theme.colorTextReverse : props.theme.colorPrimary};
  font-size: ${th('fontSizeBaseSmall')};
`

const FullPage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`

const Nested = styled.div`
  position: relative;
`

const NestedContent = styled.div<{ $isLoading: boolean }>`
  transition:
    opacity 0.3s ease,
    filter 0.3s ease;

  ${(props): RuleSet | false =>
    props.$isLoading &&
    css`
      opacity: 0.3;
      filter: blur(1px);
      user-select: none;
    `}
`

const NestedOverlay = styled.div`
  position: absolute;
  inset: 0;
  max-height: ${grid(100)};

  display: flex;
  align-items: center;
  justify-content: center;
`

const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
`

type SpinnerContentProps = {
  className?: string
  size: number
  reverse: boolean
  description?: ReactNode
}

const SpinnerContent = (props: SpinnerContentProps): ReactNode => {
  const { className, size, reverse, description } = props

  if (description) {
    return (
      <WithDescription aria-hidden className={className}>
        <Wrapper $reverse={reverse} $size={size} />
        <Description $reverse={reverse}>{description}</Description>
      </WithDescription>
    )
  }

  return (
    <Wrapper
      $reverse={reverse}
      $size={size}
      aria-hidden
      className={className}
    />
  )
}

type LiveStatusProps = {
  message: ReactNode
}

const LiveStatus = ({ message }: LiveStatusProps): ReactNode => {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100)
    return (): void => clearTimeout(timer)
  }, [])

  return <VisuallyHidden role="status">{isReady && message}</VisuallyHidden>
}

type SpinnerProps = {
  className?: string
  size?: number
  'aria-label'?: AriaAttributes['aria-label']
  reverse?: boolean
  delay?: number
  description?: ReactNode
  fullpage?: boolean
  children?: ReactNode
  spinning?: boolean
}

const Spinner = (props: SpinnerProps): ReactNode => {
  const {
    className,
    size = 10,
    'aria-label': ariaLabel,
    reverse = false,
    delay = 0,
    description,
    fullpage = false,
    children,
    spinning = true,
  } = props

  const { t } = useTranslation()
  const [hasDelayPassed, setHasDelayPassed] = useState(false)

  useEffect(() => {
    if (!spinning || delay <= 0) return undefined

    const timer = setTimeout(() => setHasDelayPassed(true), delay)

    return (): void => {
      clearTimeout(timer)
      setHasDelayPassed(false)
    }
  }, [spinning, delay])

  const isVisible = spinning && (delay <= 0 || hasDelayPassed)

  if (children) {
    return (
      <Nested aria-busy={isVisible} className={className}>
        <NestedContent $isLoading={isVisible} inert={isVisible}>
          {children}
        </NestedContent>

        <LiveStatus
          message={
            isVisible && (ariaLabel ?? description ?? t('common.Loading'))
          }
        />

        {isVisible && (
          <NestedOverlay>
            <SpinnerContent
              description={description}
              reverse={reverse}
              size={size}
            />
          </NestedOverlay>
        )}
      </Nested>
    )
  }

  const message = ariaLabel ?? description
  const status = message && <LiveStatus message={isVisible && message} />

  if (!isVisible) return status || null

  if (fullpage) {
    return (
      <FullPage className={className}>
        <SpinnerContent
          description={description}
          reverse={reverse}
          size={size}
        />
        {status}
      </FullPage>
    )
  }

  return (
    <>
      <SpinnerContent
        className={className}
        description={description}
        reverse={reverse}
        size={size}
      />
      {status}
    </>
  )
}

export default Spinner
