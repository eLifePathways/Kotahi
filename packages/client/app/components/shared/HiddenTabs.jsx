/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react/prop-types */

/* stylelint-disable custom-property-pattern */

import { useContext, useState, useEffect } from 'react'
import styled, { css } from 'styled-components'
import { grid, th, override } from '@coko/client'

import { TabsContainer } from './Tabs'
import { ConfigContext } from '../config/src'
import { safeCall } from '../../shared/generalUtils'

export const Tab = styled.div.attrs(props => ({
  'data-testid': props['data-testid'] || 'hidden-tabs-tab',
}))`
  /* stylelint-disable custom-property-no-missing-var-function */
  --bg-active: ${th('color.backgroundA')};
  --bg-inactive: linear-gradient(
    180deg,
    #ececec 0%,
    #ececec 40.1%,
    #d6d6d6 100%
  );

  background: ${props =>
    props.$active ? `var(--bg-active)` : `var(--bg-inactive)`};
  border-radius: ${th('borderRadius')} ${th('borderRadius')} 0 0;
  box-shadow: ${props =>
    props.$active
      ? '-4px 0 7px -4px rgb(0 0 0 / 10%), 4px 0 7px -4px rgb(0 0 0 / 10%), 0 -4px 7px -4px rgb(0 0 0 / 10%)'
      : 'none'};
  color: ${th('color.text')};
  cursor: pointer;
  font-size: ${th('fontSizeBaseSmall')};
  font-weight: 500;
  margin-right: ${grid(1.875)};
  padding: calc(${grid(2)} - 1px) 1em;
  padding-bottom: 0;
  position: relative;
  z-index: 6;

  ${props =>
    props.$chat &&
    css`
      padding: ${grid(2.5)};
    `}

  & > div {
    border-bottom: 3px solid
      ${props => (props.$active ? props.theme.color.brand1.base : 'none')};
    margin-bottom: -2px;
    padding-bottom: 4px;
  }

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${override('ui.Tab')}
`

export const HiddenTabsContainer = styled(TabsContainer)`
  ${props =>
    props.$sticky && `background-color: ${props.theme.color.backgroundC};`}
  ${props => props.$sticky && 'position: sticky;'}
  ${props => props.$sticky && 'top: -16px;'}
  ${props => props.$sticky && 'z-index: 999;'}

  & ~ div .waxmenu {
    ${props => props.$sticky && 'top: 23px;'};
  }
`

export const TabContainer = styled.div.attrs({
  'data-testid': 'tab-container',
})`
  align-items: stretch;
  display: flex;
`

const HiddenTabs = ({
  sections,
  onChange,
  defaultActiveKey = null,
  tabsContainerGridArea,
  background,
  shouldFillFlex,
}) => {
  const config = useContext(ConfigContext)
  const [activeKey, setActiveKey] = useState(defaultActiveKey)

  useEffect(() => {
    setActiveKey(defaultActiveKey)
  }, [defaultActiveKey])

  const setActiveKeyAndCallOnChange = incomingActiveKey => {
    setActiveKey(incomingActiveKey)
    safeCall(onChange)(incomingActiveKey)
  }

  const hideMethod = (section, key) =>
    section.hideOnly
      ? {
          visibility: section.key === key ? 'visible' : 'hidden',
          position: section.key === key ? 'relative' : 'absolute',
          pointerEvents: section.key === key ? 'all' : 'none',
          opacity: section.key === key ? '1' : '0',
          display: 'flex',
        }
      : { display: key === section.key ? 'flex' : 'none' }

  localStorage.setItem('activeTabKey', activeKey)

  return (
    <>
      <HiddenTabsContainer
        $background={background}
        $config={config}
        $sticky={false}
        gridArea={tabsContainerGridArea}
      >
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          {sections.map(({ key, label }) => (
            <TabContainer
              key={key}
              onClick={() => setActiveKeyAndCallOnChange(key)}
            >
              <Tab
                $active={activeKey === key}
                // $chat={!!hideChat}
                key={key}
              >
                <div>{label || key}</div>
              </Tab>
            </TabContainer>
          ))}
        </div>
      </HiddenTabsContainer>

      {sections.map(section => (
        <div
          key={section.key}
          style={{
            height: '100%',
            flex: shouldFillFlex ? '1' : undefined,
            flexDirection: 'column',
            minHeight: shouldFillFlex ? '0' : undefined,
            overflowY: shouldFillFlex ? 'auto' : undefined,
            ...(section?.tabStyles ?? {}),
            ...hideMethod(section, activeKey),
          }}
        >
          {section.content}
        </div>
      ))}
    </>
  )
}

export { HiddenTabs }
