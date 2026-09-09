import { type ReactNode } from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { th, grid } from '@coko/client'

import Tabs from './Tabs'
import { collapseTransition } from '../constants'
import { ExpandMenu } from '../base/Icons'

const panelWidth = '26em'

// && beats ambient "last child" flex rules some host layouts apply.
const Wrapper = styled.div<{ $isOpen: boolean }>`
  && {
    background-color: ${th('colorBackground')};
    border-left: 1px solid ${th('colorBorder')};

    display: flex;
    overflow: hidden;

    height: 100%;
    max-width: ${panelWidth};
    min-width: 0;

    flex: ${(props): string => (props.$isOpen ? `0 0 ${panelWidth}` : '0 0 0')};
    border-left-width: ${(props): string => (props.$isOpen ? '1px' : '0')};
    transition:
      flex ${collapseTransition},
      border-left-width ${collapseTransition};
    will-change: flex-basis;
  }
`

// Fixed width so it isn't reflowed on every frame of Wrapper's transition.
const PanelContent = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  height: 100%;
  width: ${panelWidth};
`

// Reaches into AntD's internals so the active tabpane fills the height.
const FillHeightTabs = styled(Tabs)`
  &&& {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
  }

  && .ant-tabs-nav {
    flex-shrink: 0;
  }

  && .ant-tabs-content-holder,
  && .ant-tabs-content {
    display: flex;
    flex: 1;
    min-height: 0;
  }

  && .ant-tabs-tabpane-active {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }
`

const CollapseButton = styled.button`
  background: none;
  border: none;
  color: ${th('colorText')};
  cursor: pointer;
  margin-left: ${grid(4)};

  > span[role='img'] {
    font-size: 1.4rem;
    transform: rotate(90deg);
  }
`

export type ChatPanelTab = {
  key: string
  label: ReactNode
  children: ReactNode
}

type ChatPanelProps = {
  /** Whether the panel is currently expanded. */
  isOpen: boolean
  /** Called when the user clicks the collapse control. */
  onToggle: () => void
  /** One tab per discussion/channel. */
  items: ChatPanelTab[]
  /** Which tab is selected by default. */
  defaultActiveKey?: string
}

/**
 * Animated, collapsible, tabbed side panel for chat / discussion UIs.
 * Open / closed state and tab content are owned by the consumer.
 * The expand control lives outside this: see `ChatPanelExpandButton`.
 */
const ChatPanel = ({
  isOpen,
  onToggle,
  items,
  defaultActiveKey,
}: ChatPanelProps): ReactNode => {
  const { t } = useTranslation()

  return (
    <Wrapper $isOpen={isOpen} data-testid="chat-panel">
      {isOpen && (
        <PanelContent>
          <FillHeightTabs
            defaultActiveKey={defaultActiveKey}
            items={items}
            tabBarExtraContent={
              <CollapseButton
                aria-label={t('chat.Hide Chat')}
                onClick={onToggle}
                title={t('chat.Hide Chat')}
              >
                <ExpandMenu aria-hidden />
              </CollapseButton>
            }
          />
        </PanelContent>
      )}
    </Wrapper>
  )
}

export default ChatPanel
