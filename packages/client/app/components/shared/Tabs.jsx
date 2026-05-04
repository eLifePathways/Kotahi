/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react/prop-types */

import { useContext, useState, useEffect } from 'react'
import { v4 as uuid } from 'uuid'
import styled, { css } from 'styled-components'
import { th, override } from '@coko/client'
import { ConfigContext } from '../config/src'
import { color } from '../../theme'

const Tab = styled.div`
  --bg-active: ${color.backgroundA};
  --bg-inactive: linear-gradient(
    180deg,
    #ececec 0%,
    #ececec 40.1%,
    #d6d6d6 100%
  );

  background: ${({ active }) =>
    active ? `var(--bg-active)` : `var(--bg-inactive)`};
  border-radius: ${th('borderRadius')} ${th('borderRadius')} 0 0;
  box-shadow: ${({ active }) =>
    active
      ? '-4px 0 7px -4px rgba(0, 0, 0, 0.1), 4px 0 7px -4px rgba(0, 0, 0, 0.1), 0 -4px 7px -4px rgba(0, 0, 0, 0.1)'
      : 'none'};
  color: ${color.text};
  cursor: pointer;
  font-size: ${th('fontSizeBaseSmall')};
  font-weight: 500;
  margin-right: ${props => props.theme.spacing.e};
  padding: calc(${th('gridUnit')} - 1px) 1em;
  padding-bottom: 2px;

  & > div {
    border-bottom: 3px solid
      ${({ active }) => (active ? color.brand1.base : 'none')};
    margin-bottom: -2px;
    padding-bottom: 4px;
  }

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${override('ui.Tab')}
`

export const TabsContainer = styled.div`
  display: flex;
  justify-content: space-between;

  ${props =>
    props.config &&
    css`
      margin-top: ${() =>
        ['preprint2'].includes(props.config.instanceName) ? '16px' : '0'};
    `}

  ${props =>
    props.background &&
    css`
      background-color: ${th(props.background)};
    `}

  ${props =>
    props.gridArea &&
    css`
      grid-area: ${props.gridArea};
    `};

  ${props => props.sticky && `background-color: ${color.backgroundC};`}
  ${props => props.sticky && 'position: sticky;'}
  ${props => props.sticky && 'top: -16px;'}
  ${props => props.sticky && 'z-index: 999;'}

  & ~ div .waxmenu {
    ${props => props.sticky && 'top: 23px;'};
  }
`

const TabContainer = styled.div.attrs(props => ({
  'data-test-id': props['data-test-id'] || 'tab-container',
}))`
  align-items: stretch;
  display: flex;
`

const HideChatButton = styled.button`
  align-items: center;
  /* TODO: add a global style for this */
  background-color: ${color.gray90};
  border-radius: ${th('borderRadius')};
  color: ${color.text};
  display: flex;
  float: right;
  font-size: 16px;
  padding: 6px 12px;

  &:hover {
    background-color: ${color.gray95};
  }
`

const Tabs = ({
  sections,
  onChange,
  defaultActiveKey = null,
  tabsContainerGridArea,
  background,
  hideChat,
}) => {
  const config = useContext(ConfigContext)
  const [activeKey, setActiveKey] = useState(defaultActiveKey)

  useEffect(() => {
    setActiveKey(defaultActiveKey)
  }, [defaultActiveKey])

  const setActiveKeyAndCallOnChange = incomingActiveKey => {
    setActiveKey(incomingActiveKey)

    if (typeof onChange === 'function') {
      onChange(incomingActiveKey)
    }
  }

  const currentContent = (
    sections.find(section => section.key === activeKey) || {}
  ).content

  localStorage.setItem('activeTabKey', `editor-${uuid()}`)

  return (
    <>
      <TabsContainer
        background={background}
        config={config}
        gridArea={tabsContainerGridArea}
      >
        <div style={{ display: 'flex' }}>
          {sections.map(({ key, label }) => (
            <TabContainer
              key={key}
              onClick={() => setActiveKeyAndCallOnChange(key)}
            >
              <Tab active={activeKey === key}>
                <div>{label || key}</div>
              </Tab>
            </TabContainer>
          ))}
        </div>

        {hideChat && (
          <HideChatButton onClick={hideChat}>Hide Chat</HideChatButton>
        )}
      </TabsContainer>

      {activeKey && currentContent}
    </>
  )
}

export { Tabs }
