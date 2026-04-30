/* eslint-disable react/prop-types */

/* eslint-disable new-cap */

/* stylelint-disable color-function-notation, alpha-value-notation */

import { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { ChevronUp, ChevronDown, X } from 'react-feather'
import Color from 'color'
import { LabelBadge } from '../../../shared'
import { color } from '../../../../theme'

const BaseDropdown = styled.div`
  display: inline-flex;
  position: relative;
`

const DropdownElement = styled.div`
  align-items: center;
  background-color: lightgrey;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: center;
`

const DropdownMenu = styled.div`
  background-color: ${color.backgroundA};
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.25);
  left: 0;
  margin-top: 2px;
  max-height: 250px;
  overflow-y: auto;
  position: absolute;
  top: 100%;
  width: 152px;
  z-index: 1;
`

const StatusLabel = styled.span`
  margin-right: 5px;
`

const ActionsContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`

const StyledButton = styled.button`
  align-items: center;
  background-color: transparent;
  background-repeat: no-repeat;
  border: none;
  cursor: pointer;
  display: flex;
  outline: none;
  overflow: hidden;
`

const DropdownMenuItem = styled.div`
  background-color: ${({ isSelected }) =>
    isSelected ? `${color.gray95}` : 'white'};
  cursor: pointer;
  padding: 8px;

  &:hover {
    background-color: ${color.gray95};
  }
`

const LabelDropdown = ({
  values,
  options,
  manuscript,
  doUpdateManuscript,
  unsetCustomStatus,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const [selectedOption, setSelectedOption] = useState(
    values.length > 0 ? values[0]?.value : undefined,
  )

  const dropdownRef = useRef(null)

  const updateManuscript = (versionId, manuscriptDelta) =>
    doUpdateManuscript({
      variables: {
        id: versionId,
        input: JSON.stringify(manuscriptDelta),
      },
    })

  const handleDropdownItemClick = newStatus => {
    setIsDropdownOpen(false)
    setSelectedOption(newStatus)

    const manuscriptDelta = {
      submission: {
        $customStatus: newStatus,
      },
    }

    updateManuscript(manuscript.id, manuscriptDelta)
  }

  const handleClickOutside = event => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const setDropDownOpenFn = e => {
    e.stopPropagation()
    setIsDropdownOpen(!isDropdownOpen)
  }

  return (
    <BaseDropdown ref={dropdownRef}>
      <DropdownElement
        aria-pressed="false"
        onClick={setDropDownOpenFn}
        role="button"
        tabindex="0"
      >
        <LabelBadge color={values[0]?.color}>
          <StatusLabel>{values[0]?.displayValue}</StatusLabel>
          {isDropdownOpen ? (
            <ActionsContainer>
              <StyledButton onClick={() => unsetCustomStatus(manuscript.id)}>
                <X
                  color={
                    values[0]?.color && Color(values[0]?.color).isDark()
                      ? `${color.textReverse}`
                      : `${color.text}`
                  }
                  size={18}
                />
              </StyledButton>
              <StyledButton onClick={setDropDownOpenFn}>
                <ChevronUp
                  color={
                    values[0]?.color && Color(values[0]?.color).isDark()
                      ? `${color.textReverse}`
                      : `${color.text}`
                  }
                  size={18}
                />
              </StyledButton>
            </ActionsContainer>
          ) : (
            <ActionsContainer>
              <StyledButton onClick={() => unsetCustomStatus(manuscript.id)}>
                <X
                  color={
                    values[0]?.color && Color(values[0]?.color).isDark()
                      ? `${color.textReverse}`
                      : `${color.text}`
                  }
                  size={18}
                />
              </StyledButton>
              <StyledButton onClick={setDropDownOpenFn}>
                <ChevronDown
                  color={
                    values[0]?.color && Color(values[0]?.color).isDark()
                      ? `${color.textReverse}`
                      : `${color.text}`
                  }
                  size={18}
                />
              </StyledButton>
            </ActionsContainer>
          )}
        </LabelBadge>
      </DropdownElement>

      {isDropdownOpen && (
        <DropdownMenu>
          {options?.map(option => (
            <DropdownMenuItem
              isSelected={selectedOption && selectedOption === option.value}
              key={option.value}
              onClick={e => {
                e.stopPropagation()
                handleDropdownItemClick(option.value)
              }}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenu>
      )}
    </BaseDropdown>
  )
}

export default LabelDropdown
