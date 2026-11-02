import { type ComponentProps, type ReactNode } from 'react'
import styled, { css, type RuleSet } from 'styled-components'
import { Button as CokoButton, th, grid } from '@coko/client'

type CokoButtonProps = ComponentProps<typeof CokoButton>

type Size = 'small' | 'medium' | 'large'

export type ButtonProps = Omit<CokoButtonProps, 'size'> & {
  reverse?: boolean
  size?: Size
}

// our own size scale, applied as explicit height/padding below - antd's
// 'size' prop is only used to get its built-in icon/font-size scaling
const ANTD_SIZE: Record<Size, 'small' | 'middle' | 'large'> = {
  small: 'small',
  medium: 'middle',
  large: 'large',
}

const sizeDimensions: Record<Size, RuleSet> = {
  small: css`
    /* stylelint-disable declaration-no-important */
    height: ${grid(6)} !important;
    padding-inline: ${grid(2)} !important;
  `,
  medium: css`
    height: ${grid(8)} !important;
    padding-inline: ${grid(4)} !important;
  `,
  large: css`
    height: ${grid(10)} !important;
    padding-inline: ${grid(4)} !important;
  `,
}

const iconOnlyWidth: Record<Size, RuleSet> = {
  small: css`
    width: ${grid(6)} !important;
  `,
  medium: css`
    width: ${grid(8)} !important;
  `,
  large: css`
    width: ${grid(10)} !important;
  `,
}

const StyledButton = styled(CokoButton)<{
  $reverse?: boolean
  $ghost?: boolean
  $size: Size
  $iconOnly: boolean
  $block?: boolean
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: none !important;
  ${(props): RuleSet => sizeDimensions[props.$size]}

  ${(props): RuleSet | false =>
    props.$iconOnly &&
    !props.$block &&
    css`
      ${iconOnlyWidth[props.$size]}
      padding-inline: 0 !important;
    `}

  ${(props): RuleSet | false =>
    props.$iconOnly &&
    !!props.$block &&
    css`
      padding-inline: 0 !important;
    `}

  ${(props): RuleSet | false =>
    props.$reverse &&
    props.$ghost &&
    css`
      color: ${th('colorTextReverse')};
      border-color: ${th('colorTextReverse')};
      border-width: 2px;
      background-color: transparent;

      &:hover,
      &:focus {
        color: ${th('colorTextReverse')} !important;
        border-color: ${th('colorTextReverse')} !important;
        background-color: ${th('colorOverlayWhiteHover')} !important;
      }

      &:active {
        color: ${th('colorTextReverse')} !important;
        border-color: ${th('colorTextReverse')} !important;
        background-color: ${th('colorOverlayWhitePressed')} !important;
      }

      &:focus-visible {
        outline: 2px solid ${th('colorTextReverse')} !important;
        outline-offset: 2px !important;
        box-shadow: none !important;
      }
    `}

  ${(props): RuleSet | false =>
    props.$reverse &&
    !props.$ghost &&
    css`
      color: ${th('colorPrimary')};
      border-color: ${th('colorTextReverse')};
      background-color: ${th('colorTextReverse')};

      &:hover,
      &:focus {
        color: ${th('colorPrimary')} !important;
        border-color: ${th('colorTextReverse')} !important;
        background:
          linear-gradient(
            ${th('colorOverlayBlackHover')},
            ${th('colorOverlayBlackHover')}
          ),
          ${th('colorTextReverse')} !important;
      }

      &:active {
        color: ${th('colorPrimary')} !important;
        border-color: ${th('colorTextReverse')} !important;
        background:
          linear-gradient(
            ${th('colorOverlayBlackPressed')},
            ${th('colorOverlayBlackPressed')}
          ),
          ${th('colorTextReverse')} !important;
      }

      &:focus-visible {
        outline: 2px solid ${th('colorTextReverse')} !important;
        outline-offset: 2px !important;
        box-shadow: none !important;
      }
    `}
`

const Button = ({
  reverse,
  ghost,
  block,
  size = 'large',
  children,
  ...props
}: ButtonProps): ReactNode => {
  return (
    <StyledButton
      $block={block}
      $ghost={ghost}
      $iconOnly={!children}
      $reverse={reverse}
      $size={size}
      block={block}
      ghost={ghost}
      size={ANTD_SIZE[size]}
      {...props}
    >
      {children}
    </StyledButton>
  )
}

export default Button
