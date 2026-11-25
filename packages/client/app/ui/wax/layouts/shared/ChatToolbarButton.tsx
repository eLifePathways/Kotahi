import type { ReactNode } from 'react'
import styled, { css, type RuleSet } from 'styled-components'
import { th, grid } from '@coko/client'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronUp } from 'react-feather'

type Colors = { base: string; hover: string; icon: string }

const colors = (open: boolean): Colors =>
  open
    ? {
        base: 'color.brand1.base',
        hover: 'color.brand1.tint25',
        icon: 'color.textReverse',
      }
    : { base: 'color.textReverse', hover: 'color.gray80', icon: 'color.text' }

const Button = styled.a<{ $isTopBarOpen: boolean }>`
  align-items: center;
  background-color: ${(props): RuleSet => css`
    ${th(colors(props.$isTopBarOpen).base)}
  `};
  border: 1px solid ${th('color.gray50')};
  border-radius: ${th('borderRadius')};
  display: flex;
  /* Matches InputWrapper's min-height (SuperChatInput/style.jsx) so the
     toolbar toggle lines up with the input box beside it. */
  height: 40px;
  justify-content: center;
  margin-right: 10px;
  padding: 21px 0 20px;

  &:hover {
    background-color: ${(props): RuleSet => css`
      ${th(colors(props.$isTopBarOpen).hover)}
    `};
  }

  svg {
    stroke: ${(props): RuleSet => css`
      ${th(colors(props.$isTopBarOpen).icon)}
    `};
    width: 0.8em;
  }
`

const IconWrapper = styled.span`
  display: inline-flex;
  padding: ${grid(1)};
`

type ToolbarButtonProps = {
  onClick: () => void
  isTopBarOpen: boolean
}

const ToolbarButton = ({
  onClick,
  isTopBarOpen,
}: ToolbarButtonProps): ReactNode => {
  const { t } = useTranslation()

  return (
    <Button
      $isTopBarOpen={isTopBarOpen}
      onClick={onClick}
      title={isTopBarOpen ? t('chat.Hide formatting') : t('chat.Formatting')}
    >
      <IconWrapper role="img">
        {isTopBarOpen ? <ChevronDown /> : <ChevronUp />}
      </IconWrapper>
    </Button>
  )
}

export default ToolbarButton
