import type { ReactNode, CSSProperties } from 'react'
import styled, { css, RuleSet } from 'styled-components'

import { grid, th } from '@coko/client'

import { BadgeVariant } from './_constants'

const Wrapper = styled.span<{
  $small?: boolean
  $variant?: BadgeVariant
}>`
  background-color: ${th('colorSecondary')};
  color: ${th('colorTextReverse')};
  border-radius: ${th('borderRadius')};
  white-space: nowrap;
  font-family: ${th('fontInterface')};
  display: inline-flex;
  align-items: center;

  padding: ${grid(1)} ${grid(4)};
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};

  ${(props): RuleSet =>
    props.$small &&
    css`
      padding: ${grid(1)} ${grid(2)};
      font-size: ${th('fontSizeBaseSmaller')};
      line-height: ${th('lineHeightBaseSmaller')};
    `}

  ${(props): RuleSet =>
    props.$variant === 'primary' &&
    css`
      background-color: ${th('colorPrimary')};
    `};

  ${(props): RuleSet =>
    props.$variant === 'success' &&
    css`
      background-color: ${th('colorSuccess')};
    `};

  ${(props): RuleSet =>
    props.$variant === 'error' &&
    css`
      background-color: ${th('colorError')};
    `};

  ${(props): RuleSet =>
    props.$variant === 'warning' &&
    css`
      background-color: ${th('colorWarning')};
    `};

  ${(props): RuleSet =>
    props.$variant === 'disabled' &&
    css`
      background-color: ${th('colorDisabled')};
    `};
`

type BadgeProps = {
  children: ReactNode

  className?: string
  'data-testid'?: string
  outlined?: boolean
  small?: boolean
  style?: CSSProperties
  variant?: BadgeVariant
}

const Badge = ({
  className,
  children,
  'data-testid': dataTestId,
  small,
  style,
  variant,
}: BadgeProps): ReactNode => {
  return (
    <Wrapper
      $small={small}
      $variant={variant}
      className={className}
      data-testid={dataTestId}
      style={style}
    >
      {children}
    </Wrapper>
  )
}

export default Badge
