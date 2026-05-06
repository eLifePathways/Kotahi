/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react/prop-types */

/* eslint-disable jsx-a11y/no-autofocus */

import { useState, useRef, useEffect } from 'react'
import styled, { useTheme } from 'styled-components'
import { X } from 'react-feather'
import { th, grid } from '@coko/client'
import { useTranslation } from 'react-i18next'
import { RoundIconButton } from '../../shared'
import { color } from '../../../theme'

const SearchContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 0 1 ${props => (props.isOpen ? '40em' : '')};
  gap: ${grid(1)};
  justify-content: flex-end;
`

const InlineTextField = styled.input`
  background-color: ${props =>
    // eslint-disable-next-line no-nested-ternary
    props.isFilteringResults
      ? props.isShowingCurrentSearch
        ? color.brand1.tint50 // Stronger color to indicate this is the current search filtering
        : color.brand1.tint70 // Weaker, to indicate there is filtering but the string is no longer representative of it
      : color.backgroundA};
  border: 1px solid ${color.gray60};
  border-radius: ${th('borderRadius')};
  display: inline;
  flex: 0 1 40em;
  height: ${grid(4)};
  padding: 0 8px;
  transition: ${th('transitionDuration')} ${th('transitionTimingFunction')};

  &:focus {
    border-color: ${color.brand1.base};
    box-shadow: ${th('boxShadow')};
  }
`

const SearchControl = ({ currentSearchQuery, applySearchQuery }) => {
  const [searchText, setSearchText] = useState(currentSearchQuery || '')
  const [isOpen, setIsOpen] = useState(!!currentSearchQuery)
  const ref = useRef(null)
  const theme = useTheme()

  const submitSearch = query => {
    if ((query || null) !== currentSearchQuery) applySearchQuery(query)
    setSearchText(query || '')
  }

  const { t } = useTranslation()
  useEffect(() => {
    setIsOpen(!!currentSearchQuery)
    setSearchText(currentSearchQuery || '')
  }, [currentSearchQuery])

  return (
    <SearchContainer isOpen={isOpen}>
      {isOpen && (
        <>
          <InlineTextField
            autoComplete="off"
            autoFocus
            id="enter-search"
            isFilteringResults={!!currentSearchQuery}
            isShowingCurrentSearch={searchText === currentSearchQuery}
            onBlur={() => {
              if (!searchText) setTimeout(() => setIsOpen(false), 400) // Delay so if you click the search button the input doesn't close and then reopen
            }}
            onChange={e => setSearchText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') submitSearch(searchText)
              else if (e.key === 'Escape') {
                setSearchText(currentSearchQuery)
                if (!currentSearchQuery) setIsOpen(false)
              }
            }}
            placeholder={t('common.Enter search terms...')}
            ref={ref}
            title={t('common.surroundMultiword')}
            type="text"
            value={searchText}
          />
          <button type="button">
            <X
              color={searchText ? theme.colorText : theme.colorBorder}
              onClick={() => {
                submitSearch('')
                ref.current.focus()
              }}
              size={16}
              strokeWidth={3.5}
            />
          </button>
        </>
      )}
      <RoundIconButton
        iconName="Search"
        onClick={() => {
          if (isOpen) {
            submitSearch(searchText)
            ref.current.focus()
          } else setIsOpen(true)
        }}
        primary={isOpen}
        title={t('manuscriptsTable.Search')}
      />
    </SearchContainer>
  )
}

export default SearchControl
