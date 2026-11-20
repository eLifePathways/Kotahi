/* eslint-disable react/prop-types */

import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

const Root = styled.span`
  display: inline-flex;
  opacity: ${({ $disabled }) => ($disabled ? 0.4 : 1)};
  position: relative;
`

const Control = styled.div`
  background-color: white;
  border-radius: 2px;
  border: none;
  box-sizing: border-box;
  color: #333;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  outline: none;
  overflow: hidden;
  padding: 8px 52px 8px 10px;
  pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'default')};
  position: relative;
  transition: all 200ms ease;
`

const Arrow = styled.span`
  border-color: ${({ $isOpen }) =>
    $isOpen ? 'transparent transparent #999' : '#999 transparent transparent'};
  border-style: solid;
  border-width: ${({ $isOpen }) => ($isOpen ? '0 5px 5px' : '5px 5px 0')};
  display: block;
  height: 0;
  position: absolute;
  right: 25px;
  top: 14px;
  width: 0;
`

const Menu = styled.div`
  align-items: flex-start;
  background-color: white;
  border: 1px solid #ccc;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  margin-top: -1px;
  max-height: 200px;
  overflow-y: auto;
  position: absolute;
  top: 100%;
  width: 120%;
  z-index: 1000;
`

const Option = styled.div`
  background-color: ${({ $isSelected }) =>
    $isSelected ? '#f2f9fc' : 'transparent'};
  box-sizing: border-box;
  color: ${({ $isSelected }) =>
    $isSelected ? '#333' : 'rgba(51, 51, 51, 0.8)'};
  cursor: pointer;
  display: block;
  padding: 8px 10px;
  width: 100%;

  &:hover {
    background-color: #f2f9fc;
    color: #333;
  }

  &:last-child {
    border-bottom-left-radius: 2px;
    border-bottom-right-radius: 2px;
  }
`

const Dropdown = ({ disabled = false, onChange, options = [], value }) => {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = e => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <Root $disabled={disabled} ref={rootRef}>
      <Control $disabled={disabled} onClick={() => setIsOpen(o => !o)}>
        {value?.label}
        <Arrow $isOpen={isOpen} />
      </Control>

      {isOpen && (
        <Menu>
          {options.map(option => (
            <Option
              $isSelected={option.value === value?.value}
              key={option.value}
              onMouseDown={e => {
                e.preventDefault()
                onChange(option)
                setIsOpen(false)
              }}
            >
              {option.label}
            </Option>
          ))}
        </Menu>
      )}
    </Root>
  )
}

export default Dropdown
