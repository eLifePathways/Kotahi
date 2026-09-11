import { type ReactNode } from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { grid, th } from '@coko/client'

import { collapseTransition } from '../constants'
import { Chat } from '../base/Icons'

// min-width + a large border-radius: round for one digit, pill beyond that.
const UnreadBadge = styled.span`
  color: ${th('colorTextReverse')};
  background-color: ${th('colorPrimary')};
  border: 2px solid white;
  border-radius: 999px;
  font-size: ${th('fontSizeBaseSmaller')};

  display: flex;
  align-items: center;
  justify-content: center;

  height: 22px;
  min-width: 22px;

  padding-top: 1px;
  padding-left: 6px;
  padding-right: 6px;

  position: absolute;
  /* left, not right: pill grows rightward instead of from the centre. */
  left: 29px;
  bottom: -8px;
`

// position: relative; anchors UnreadBadge
const ExpandButton = styled.button<{ $visible: boolean }>`
  color: ${th('colorTextReverse')};
  background-color: ${th('colorPrimary')};
  border: none;
  border-radius: 50%;
  position: relative;

  cursor: pointer;
  pointer-events: ${(props): string => (props.$visible ? 'auto' : 'none')};

  display: inline-flex;
  align-items: center;
  justify-content: center;

  height: ${grid(10)};
  width: ${grid(10)};

  opacity: ${(props): string => (props.$visible ? '1' : '0')};
  visibility: ${(props): string => (props.$visible ? 'visible' : 'hidden')};
  transition:
    opacity ${collapseTransition},
    visibility ${collapseTransition};

  > span[role='img'] {
    font-size: 1.2rem;
  }
`

type ChatPanelExpandButtonProps = {
  /** Whether the ChatPanel it opens is currently expanded. */
  isOpen: boolean
  /** Called when the user clicks the control. */
  onClick: () => void
  /** Accessible label. */
  label?: string
  /** Badge count, eg. unread messages. Displayed as "99+" above 99. */
  unreadCount?: number
  /** Forwarded to the root element, eg. for a parent to position it. */
  className?: string
}

/** The control that opens a ChatPanel; lives on the main content side. */
const ChatPanelExpandButton = ({
  isOpen,
  onClick,
  label,
  unreadCount,
  className,
}: ChatPanelExpandButtonProps): ReactNode => {
  const { t } = useTranslation()
  const resolvedLabel = label ?? t('chat.Show Chat')

  return (
    <ExpandButton
      $visible={!isOpen}
      aria-label={resolvedLabel}
      className={className}
      data-testid="expand-chat"
      onClick={onClick}
      title={resolvedLabel}
    >
      <Chat aria-hidden />
      {!!unreadCount && (
        <UnreadBadge>{unreadCount > 99 ? '99+' : unreadCount}</UnreadBadge>
      )}
    </ExpandButton>
  )
}

export default ChatPanelExpandButton
