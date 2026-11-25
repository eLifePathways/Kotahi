import type { MouseEvent, ReactNode } from 'react'
import type { Command, EditorState } from 'prosemirror-state'
import styled, { css, type RuleSet } from 'styled-components'
import { th } from '@coko/client'

import Button from '../../shared/Button'
import useCommand from './useCommand'

type CommandButtonProps = {
  command: Command
  isActive?: (state: EditorState) => boolean
  isEnabled?: (state: EditorState) => boolean
  icon?: ReactNode
  label?: ReactNode
  title: string
  className?: string
}

const StyledButton = styled(Button)<{ $active: boolean }>`
  font-size: ${th('fontSizeBaseSmall')};

  ${(props): RuleSet | false =>
    props.$active &&
    css`
      background: ${th('colorBackgroundHue')} !important;
      color: ${th('colorPrimary')} !important;
    `}
`

const preventFocusLoss = (event: MouseEvent): void => event.preventDefault()

const CommandButton = ({
  command,
  isActive,
  isEnabled,
  icon,
  label,
  title,
  className,
}: CommandButtonProps): ReactNode => {
  const { active, enabled, run } = useCommand(command, isActive, isEnabled)

  return (
    <StyledButton
      $active={active}
      aria-label={title}
      aria-pressed={isActive ? active : undefined}
      className={className}
      disabled={!enabled}
      icon={icon}
      onClick={run}
      onMouseDown={preventFocusLoss}
      size="small"
      title={title}
      type="text"
    >
      {label}
    </StyledButton>
  )
}

export default CommandButton
