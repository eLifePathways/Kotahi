import { type ReactNode } from 'react'
import styled, { css, RuleSet } from 'styled-components'
import { Upload as AntUpload } from 'antd'
import { grid, th, H2, Link as UILink } from '@coko/client'

import { ArrowRight, Upload } from '../base/Icons'
import Surface from './Surface'

// #region styled
const IconWrapper = styled.div`
  position: absolute;
  right: ${grid(4)};
  bottom: ${grid(3)};
  line-height: 0;
  opacity: 0;
  transition: opacity 0.3s ease;

  > span[role='img'] {
    font-size: 2rem;
    color: ${th('colorPrimary')};
  }
`

const Title = styled(H2)`
  border-bottom: 2px solid ${th('colorPrimary')};
`

const TitledContent = styled.div`
  padding-top: ${grid(4)};
`

const Body = styled(Surface)`
  position: relative;
  height: 100%;
  padding: ${grid(8)};
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
`

const hovered = css`
  ${Body} {
    box-shadow: var(--card-hover-shadow, 0 0 0 3px ${th('colorPrimary')});
    transform: var(--card-hover-transform, none);
  }

  ${IconWrapper} {
    opacity: 1;
  }
`

const focused = css`
  ${Body} {
    box-shadow: 0 0 0 3px ${th('colorPrimary')};
  }

  ${IconWrapper} {
    opacity: 1;
  }
`

const notHighlighted = css`
  &:hover,
  &:focus-visible,
  &:has(:focus-visible),
  &:has(.ant-upload-drag-hover) {
    ${Body} {
      box-shadow: ${th('boxShadow')};
      transform: none;
    }

    ${IconWrapper} {
      opacity: 0;
    }
  }
`

type StateProps = {
  $disabled?: boolean
  $busy?: boolean
}

const interactive = css`
  display: block;
  height: 100%;
  outline: none;

  &:hover {
    ${hovered}
  }

  &:focus-visible {
    ${focused}
  }
`

const states = css<StateProps>`
  ${(props): RuleSet =>
    props.$disabled &&
    css`
      cursor: not-allowed;
      opacity: 0.5;
      ${notHighlighted}
    `}

  ${(props): RuleSet =>
    props.$busy &&
    css`
      cursor: progress;
      ${notHighlighted}
    `}
`

const Link = styled(UILink)`
  ${interactive}

  &&:focus-visible {
    outline: none;
  }
`

const Button = styled.button<StateProps>`
  width: 100%;
  text-align: inherit;

  ${interactive}
  ${states}
`

const DropTarget = styled.div<StateProps>`
  ${interactive}
  cursor: pointer;

  &:has(:focus-visible),
  &:has(.ant-upload-drag-hover) {
    ${focused}
  }

  ${states}

  .ant-upload-wrapper {
    display: block;
    height: 100%;
  }

  && .ant-upload-drag,
  && .ant-upload-disabled {
    border: none;
    background: none;
    color: inherit;
    text-align: inherit;
    cursor: inherit;
  }

  && .ant-upload-drag .ant-upload-btn {
    display: block;
    padding: 0;
    outline: none;
    cursor: inherit;
  }

  && .ant-upload-drag-container {
    display: block;
    height: 100%;
  }
`
// #endregion styled

type BaseCardProps = {
  title?: string
  children?: ReactNode
  className?: string
  testId?: string
}

type LinkCardProps = {
  type: 'link'
  url: string
}

type ButtonCardProps = {
  type: 'button'
  onClick: () => void
  disabled?: boolean
  busy?: boolean
}

type UploadCardProps = {
  type: 'upload'
  onDrop: (files: File[]) => void
  accept?: string
  disabled?: boolean
  busy?: boolean
}

export type CardBehaviorProps =
  | LinkCardProps
  | ButtonCardProps
  | UploadCardProps

export type CardProps = CardBehaviorProps & BaseCardProps

type CardBodyProps = {
  title?: string
  className?: string
  children?: ReactNode
  icon?: ReactNode
}

const CardBody = (props: CardBodyProps): ReactNode => {
  const { title, className, children, icon } = props

  return (
    <Body className={className}>
      {title ? (
        <>
          <Title>{title}</Title>
          <TitledContent>{children}</TitledContent>
        </>
      ) : (
        children
      )}
      {icon && <IconWrapper>{icon}</IconWrapper>}
    </Body>
  )
}

const LinkCard = (props: LinkCardProps & BaseCardProps): ReactNode => {
  const { title, children, className, testId, url } = props

  return (
    <Link data-testid={testId} to={url}>
      <CardBody
        className={className}
        icon={<ArrowRight aria-hidden />}
        title={title}
      >
        {children}
      </CardBody>
    </Link>
  )
}

const ButtonCard = (props: ButtonCardProps & BaseCardProps): ReactNode => {
  const { title, children, className, testId, onClick, disabled, busy } = props

  return (
    <Button
      $busy={busy}
      $disabled={disabled}
      aria-busy={busy}
      data-testid={testId}
      disabled={disabled || busy}
      onClick={onClick}
      type="button"
    >
      <CardBody className={className} title={title}>
        {children}
      </CardBody>
    </Button>
  )
}

const UploadCard = (props: UploadCardProps & BaseCardProps): ReactNode => {
  const { title, children, className, testId, onDrop, accept, disabled, busy } =
    props

  return (
    <DropTarget
      $busy={busy}
      $disabled={disabled}
      aria-busy={busy}
      data-testid={testId}
    >
      <AntUpload.Dragger
        accept={accept}
        beforeUpload={file => {
          onDrop([file])
          return AntUpload.LIST_IGNORE
        }}
        disabled={disabled || busy}
        multiple={false}
        showUploadList={false}
      >
        <CardBody
          className={className}
          icon={<Upload aria-hidden />}
          title={title}
        >
          {children}
        </CardBody>
      </AntUpload.Dragger>
    </DropTarget>
  )
}

const Card = (props: CardProps): ReactNode => {
  switch (props.type) {
    case 'link':
      return <LinkCard {...props} />
    case 'button':
      return <ButtonCard {...props} />
    case 'upload':
      return <UploadCard {...props} />
    default:
      return props satisfies never
  }
}

export default Card
