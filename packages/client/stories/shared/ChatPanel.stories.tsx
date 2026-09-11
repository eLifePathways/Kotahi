import { useState, type ReactNode } from 'react'
import styled from 'styled-components'

import preview from '../../.storybook/preview'
import ChatPanel, { type ChatPanelTab } from '../../app/ui/shared/ChatPanel'

const Wrapper = styled.div`
  display: flex;
  height: 480px;
  border: 2px solid black;
`

const MainContent = styled.div`
  background: #f5f5f5;
  flex: 1;
  padding: 16px;
`

const ToggleButton = styled.button`
  margin-bottom: 16px;
`

const PanelBody = styled.div`
  height: 100%;
  overflow: auto;
  padding: 16px;
`

const chatItems: ChatPanelTab[] = [
  {
    key: 'author',
    label: 'Discussion with author',
    children: <PanelBody>Messages with the author go here.</PanelBody>,
  },
  {
    key: 'editorial',
    label: 'Editorial discussion',
    children: <PanelBody>Messages with the editorial team go here.</PanelBody>,
  },
]

// Items don't have to be chat-shaped at all - any label/content works.
const arbitraryItems: ChatPanelTab[] = [
  {
    key: 'notes',
    label: 'Notes',
    children: <PanelBody>A plain block of notes, not a chat.</PanelBody>,
  },
  {
    key: 'checklist',
    label: 'Checklist',
    children: (
      <PanelBody>
        <ul>
          <li>Read the manuscript</li>
          <li>Check figures</li>
          <li>Check references</li>
        </ul>
      </PanelBody>
    ),
  },
  {
    key: 'settings',
    label: 'Settings',
    children: (
      <PanelBody>
        <label htmlFor="story-notify">
          <input id="story-notify" type="checkbox" /> Notify me of changes
        </label>
      </PanelBody>
    ),
  },
]

type DemoProps = {
  initialOpen?: boolean
  items?: ChatPanelTab[]
}

const Demo = ({
  initialOpen = true,
  items = chatItems,
}: DemoProps): ReactNode => {
  const [isOpen, setIsOpen] = useState(initialOpen)

  return (
    <Wrapper>
      <MainContent>
        <ToggleButton onClick={() => setIsOpen(prev => !prev)} type="button">
          Toggle panel
        </ToggleButton>
        <div>Main content area</div>
      </MainContent>
      <ChatPanel
        isOpen={isOpen}
        items={items}
        onToggle={() => setIsOpen(false)}
      />
    </Wrapper>
  )
}

const meta = preview.meta({
  component: ChatPanel,
})

export const Open = meta.story({
  render: () => <Demo initialOpen />,
})

export const Collapsed = meta.story({
  render: () => <Demo initialOpen={false} />,
})

export const ArbitraryTabContent = meta.story({
  render: () => <Demo items={arbitraryItems} />,
})
