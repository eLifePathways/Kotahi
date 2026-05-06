/* eslint-disable react-hooks/rules-of-hooks, react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */

/* stylelint-disable shorthand-property-no-redundant-values */
/* stylelint-disable custom-property-pattern, string-quotes */

import React, { useState, useContext } from 'react'
import { th, override } from '@coko/client'
import { WaxContext } from 'wax-prosemirror-core'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'
import Icon from './Icon'
import { color } from '../../../../../theme'

// n.b. Henrik's current design is at https://www.figma.com/file/uDxsjgDWxjiof0qSNFLelr/Kotahi-storybook?node-id=6256%3A11486

const useCircles = true // turn this on if you want colors next to annotations
const showHideCitations = false // turn this on if you want show/hide functionality for citations

const showWaxButton = false // true // This allows Wax debugging

const TabWrapper = styled.div`
  border-right: 1px solid white;
  display: flex;
  flex-direction: column;
  height: 100%;
  margin-right: -1px;
`

const Tabs = styled.div`
  background: #fff;
  display: flex;
  flex-direction: row;
  padding-top: 3px;

  & > div {
    border-radius: 100%;
    height: 40px;
    opacity: 0.5;
  }

  & > div:first-child {
    margin-top: 0;
  }
`

const activeTab = css`
  background: ${color.gray90};
  /* box-shadow: 0 0 1px ${color.gray40}; */
  margin-bottom: -1px;
  /* stylelint-disable-next-line declaration-no-important */
  opacity: 1 !important;
`

const disabledTab = css`
  cursor: not-allowed;
  display: none;
  margin-bottom: -1px;
`

const Tab = styled.div`
  cursor: pointer;
  margin: 0 4px 4px;

  ${props => props.active && activeTab}
  ${props => props.disabled && disabledTab}

  padding: 8px;

  &:first-child {
    margin-top: 4px;
  }

  &:hover {
    background: ${color.gray90};

    & svg {
      fill: ${color.gray30};
    }
  }
`

const Content = styled.div`
  border-right: 1px solid ${color.gray90};
  border-top: 1px solid ${color.gray90};
  border-top-right-radius: 4px;
  height: 100%;
  width: 100%;
`

export const VerticalTabs = ({ tabList }) => {
  if (!tabList || tabList.length === 0) return null

  const [tabDisplay, setTabDisplay] = useState(tabList[0].id)

  return (
    <TabWrapper>
      <Tabs>
        {tabList.map(tab => (
          <Tab
            active={tabDisplay === tab.id}
            disabled={tab.disabled}
            key={tab.id}
            onClick={() => {
              if (!tab.disabled) setTabDisplay(tab.id)
            }}
            title={tab.title}
          >
            <Icon
              className={tabDisplay === tab.id ? 'active' : ''}
              name={tab.icon}
            />
          </Tab>
        ))}
      </Tabs>

      <Content>{tabList.find(tab => tabDisplay === tab.id).component}</Content>
    </TabWrapper>
  )
}

const BlockLevelToolsWrapper = styled.div`
  height: 100%;
  overflow-y: auto;
  padding: 8px 8px 16px;

  > div:not(:last-child) {
    margin-bottom: 10px;
  }
`

const ElementGroup = styled.details`
  & summary {
    color: ${color.gray40};
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    margin: 0;
    user-select: none;

    &::marker {
      color: ${th('colorBackgroundTabs' /* TODO Does this color exist? */)};
    }
  }

  & + details {
    margin-top: 16px;
  }
`

const BlockElementWrapper = styled.div`
  display: flex;

  & button {
    align-items: center;
    background: none;
    border-radius: 4px;
    display: inline-flex;
    margin-left: 2px;

    /* This cleans up the left menu, but kills off focus mode */
    ${override('MenuButton')}

    padding: 0;
    position: relative;
    transition: 0.25s;

    &::before {
      --circle-width: 5px;
      background-color: ${props => th(props.color) || 'transparent'};
      border: 1px solid ${props => th(props.color) || 'transparent'};
      border-radius: 100%;
      content: '';
      display: ${props => (props.color ? 'inline-block' : 'none')};
      height: var(--circle-width);
      margin-right: ${props => (props.color ? '-4px' : 0)};
      position: relative;
      top: 1px;
      width: ${props => (props.color ? 'var(--circleWidth)' : 0)};
    }

    & span {
      border-bottom: 2px solid
        ${props => (props.isActive ? color.gray40 : 'transparent')};
      border-top: 2px solid transparent;
      color: ${color.gray40};
      font-size: 14px;
      font-weight: ${props => (props.isActive ? 'bold' : 'normal')};
      padding: 1px 0;
    }

    &:hover {
      /* stylelint-disable-next-line declaration-no-important */
      background: none !important;

      & span {
        border-bottom-color: ${color.gray40};
        font-weight: bold;
      }
    }
  }
`

const BlockElement = ({ item, onClick, view, showCitations }) => {
  const { active, select } = item
  const context = useContext(WaxContext)

  const { activeViewId, activeView } = context

  const { state } = view

  const isActive = !!(
    active(activeView.state, activeViewId) &&
    select(state, activeViewId, activeView)
  )

  // console.log(item.name, isActive)
  return (
    <BlockElementWrapper
      color={(useCircles && showCitations && item.color) || null}
      isActive={isActive}
      onClick={onClick}
      onMouseEnter={() => {
        if (item.className) {
          // If we are hovering over a citation title and citations are not shown, highlight them.
          document
            .querySelector('.editorArea')
            .classList.add(`show-${item.className}`)
        }
      }}
      onMouseLeave={() => {
        if (item.className) {
          // If we are hovering over a citation title and citations are not shown, highlight them.
          document
            .querySelector('.editorArea')
            .classList.remove(`show-${item.className}`)
        }
      }}
    >
      {item.renderTool(view)}
    </BlockElementWrapper>
  )
}

const BlockElementGroup = ({ groupName, items, view }) => {
  const [showCitations, setShowCitations] = useState(true) // if you want this false by default, add "hide-citation-spans" to the classList of the editorArea
  // maybe this should be generalized if we're going to use something similar elsewhere?
  React.useEffect(() => {
    if (showHideCitations && groupName === 'Citations') {
      if (showCitations) {
        // NOTE: this is ugly, though necessary to get footnotes–-".panelGroup" is the closest parent that covers both
        document
          .querySelector('.editorArea')
          .classList.remove('hide-citation-spans')
      } else {
        document
          .querySelector('.editorArea')
          .classList.add('hide-citation-spans')
      }
    }
  }, [showCitations])

  return (
    <ElementGroup open>
      <summary>
        {groupName}
        {showHideCitations && groupName === 'Citations' ? (
          <a
            href="/#"
            onClick={e => {
              e.preventDefault()
              setShowCitations(!showCitations)
            }}
            style={{ marginLeft: 20, color: 'gray', fontWeight: 'normal' }}
          >
            {showCitations ? 'Hide' : 'Show'}
          </a>
        ) : (
          ''
        )}
      </summary>
      <div>
        {items &&
          items.map(item => (
            <BlockElement
              item={item}
              key={item.name}
              showCitations={showCitations}
              view={view}
            />
          ))}
      </div>
    </ElementGroup>
  )
}

export const BlockLevelTools = ({ groups, view }) => {
  const context = useContext(WaxContext)

  return (
    <BlockLevelToolsWrapper>
      {groups &&
        groups.map(group => (
          <BlockElementGroup
            groupName={group.groupName}
            items={group.items}
            key={group.groupName}
            view={view}
          />
        ))}
      {showWaxButton && (
        <button
          onClick={() => {
            /* eslint-disable-next-line no-console */
            console.log(context)
          }}
          style={{ marginTop: '2rem' }}
          type="button"
        >
          Show context
        </button>
      )}
    </BlockLevelToolsWrapper>
  )
}

BlockLevelTools.propTypes = {
  groups: PropTypes.arrayOf(
    PropTypes.shape({
      groupName: PropTypes.string,
      items: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string,
        }),
      ),
    }),
  ).isRequired,
}

VerticalTabs.propTypes = {
  tabList: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      displayName: PropTypes.string,
      component: PropTypes.node,
    }),
  ).isRequired,
}
