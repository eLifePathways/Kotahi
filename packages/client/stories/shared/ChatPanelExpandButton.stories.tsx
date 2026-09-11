import { useState, type ReactNode } from 'react'

import preview from '../../.storybook/preview'
import ChatPanelExpandButton from '../../app/ui/shared/ChatPanelExpandButton'

type DemoProps = {
  initialOpen?: boolean
  unreadCount?: number
}

const Demo = ({ initialOpen = false, unreadCount }: DemoProps): ReactNode => {
  const [isOpen, setIsOpen] = useState(initialOpen)

  return (
    <ChatPanelExpandButton
      isOpen={isOpen}
      onClick={() => setIsOpen(prev => !prev)}
      unreadCount={unreadCount}
    />
  )
}

const meta = preview.meta({
  component: ChatPanelExpandButton,
})

export const Visible = meta.story({
  render: () => <Demo />,
})

export const Hidden = meta.story({
  render: () => <Demo initialOpen />,
})

export const WithUnreadCount = meta.story({
  render: () => <Demo unreadCount={3} />,
})

export const WithDoubleDigitUnreadCount = meta.story({
  render: () => <Demo unreadCount={42} />,
})

export const WithUnreadCountOverLimit = meta.story({
  render: () => <Demo unreadCount={150} />,
})
