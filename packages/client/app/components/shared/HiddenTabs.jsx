/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react/prop-types */

/* stylelint-disable custom-property-pattern */

import { useContext, useState, useEffect } from 'react'
import styled from 'styled-components'
import { th, override } from '@coko/client'
import { useTranslation } from 'react-i18next'
import { TabsContainer } from './Tabs'
import { ConfigContext } from '../config/src'
import { color } from '../../theme'
import RoundIconButton from './RoundIconButton'
import { safeCall } from '../../shared/generalUtils'

export const CompactChatButton = styled(RoundIconButton)`
  height: 33px;
  margin-top: 0;
  min-width: 0;
  width: 33px;
`

export const Tab = styled.div`
  --bgActive: ${color.backgroundA};
  --bgInactive: linear-gradient(
    180deg,
    #ececec 0%,
    #ececec 40.1%,
    #d6d6d6 100%
  );

  background: ${({ active }) =>
    active ? `var(--bgActive)` : `var(--bgInactive)`};
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
  padding-bottom: 0;
  position: relative;
  z-index: 1;

  & > div {
    border-bottom: 3px solid
      ${({ active }) => (active ? color.brand1.base : 'none')};
    margin-bottom: -2px;
    padding-bottom: 4px;
  }

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${override('ui.Tab')}
`

export const HiddenTabsContainer = styled(TabsContainer)`
  ${props => props.sticky && `background-color: ${color.backgroundC};`}
  ${props => props.sticky && 'position: sticky;'}
  ${props => props.sticky && 'top: -16px;'}
  ${props => props.sticky && 'z-index: 999;'}

  & ~ div .waxmenu {
    ${props => props.sticky && 'top: 23px;'};
  }
`

export const TabContainer = styled.div.attrs(props => ({
  'data-test-id': props['data-test-id'] || 'tab-container',
}))`
  align-items: stretch;
  display: flex;
`

const HiddenTabs = ({
  sections,
  onChange,
  defaultActiveKey = null,
  tabsContainerGridArea,
  background,
  hideChat,
  shouldFillFlex,
}) => {
  const config = useContext(ConfigContext)
  const [activeKey, setActiveKey] = useState(defaultActiveKey)

  const { t } = useTranslation()

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
        background={background}
        config={config}
        gridArea={tabsContainerGridArea}
        sticky={false}
      >
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          {sections.map(({ key, label }) => (
            <TabContainer
              key={key}
              onClick={() => setActiveKeyAndCallOnChange(key)}
            >
              <Tab active={activeKey === key} key={key}>
                <div>{label || key}</div>
              </Tab>
            </TabContainer>
          ))}
        </div>

        {/* TODO: Hide Chat could be a seperate component */}
        {hideChat && (
          <CompactChatButton
            iconName="ChevronRight"
            onClick={hideChat}
            title={t('chat.Hide Chat')}
          />
        )}
      </HiddenTabsContainer>

      {sections.map(section => (
        <div
          key={section.key}
          style={{
            height: '100%',
            flex: shouldFillFlex ? '1' : undefined,
            flexDirection: 'column',
            minHeight: shouldFillFlex ? '0' : undefined,
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
