/* eslint-disable react-hooks/exhaustive-deps, react-hooks/immutability, react-hooks/set-state-in-effect */
/* eslint-disable react/prop-types */

/* eslint-disable jsx-a11y/no-autofocus */

import { useContext, useState, useRef, useEffect } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { ChevronUp, ChevronDown } from 'react-feather'
import { th, grid } from '@coko/client'
import { SolidColumn, TightRow } from './Containers'
import { color } from '../../theme'

/** Used for both up button and down button */
const UpDownButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  color: ${color.gray60};
  height: ${grid(2)};
  justify-content: center;
  padding: 0 ${grid(0.5)};
  width: ${grid(3)};

  &:hover {
    color: ${color.brand1.base};
  }

  & svg {
    stroke: ${color.gray60};
  }

  &:hover svg {
    stroke: ${color.brand1.base};
  }
`

const Input = styled.input`
  background: none;
  border: none;
  border-radius: ${th('borderRadius')};
  flex: 1 1 4em;
  font-family: ${th('fontInterface')};
  font-size: ${th('fontSizeBase')};
  line-height: ${th('lineHeightBase')};
  padding: 0 2px;
  text-align: right;
  width: 2em;

  &:hover,
  &:focus {
    outline: 1px solid ${color.brand1.base};
  }
`

const ReadOnly = styled.div`
  font-family: ${th('fontInterface')};
  font-size: ${th('fontSizeBase')};
  line-height: ${th('lineHeightBase')};
  padding: 0 2px;
`

/** Positive integers only, currently. */
const MinimalNumericUpDown = ({ autoFocus, isReadOnly, value, onChange }) => {
  const themeContext = useContext(ThemeContext)
  const timeout = useRef()
  const interval = useRef()
  const [activeButton, setActiveButton] = useState(null)

  const [currentVal, setCurrentVal] = useState(
    typeof value === 'number' ? Math.floor(value) : 0,
  )

  useEffect(() => {
    setCurrentVal(value)
  }, [typeof value === 'number' ? Math.floor(value) : 0])

  useEffect(() => {
    if (timeout.current) {
      clearTimeout(timeout.current)
    }

    if (interval.current) {
      clearInterval(interval.current)
      onChange(currentVal)
    }

    if (activeButton === 'up') {
      // immediate increment, then pause, then rapid increments until mouse is released
      increment()
      timeout.current = setTimeout(() => {
        interval.current = setInterval(autoIncrement, 200)
      }, 300)
    } else if (activeButton === 'down') {
      // immediate decrement, then pause, then rapid decrements until mouse is released
      decrement()
      timeout.current = setTimeout(() => {
        interval.current = setInterval(autoDecrement, 200)
      }, 300)
    }
  }, [activeButton])

  if (isReadOnly) return <ReadOnly>{value}</ReadOnly>

  const parseAndClipValue = rawVal => {
    const val = Math.max(
      0,
      typeof rawVal === 'number' ? rawVal : parseInt(rawVal, 10),
    )

    return Number.isNaN(val) ? 0 : val
  }

  const increment = () => {
    const newVal = parseAndClipValue(currentVal + 1)
    setCurrentVal(newVal)
    onChange(newVal)
  }

  const decrement = () => {
    const newVal = parseAndClipValue(currentVal - 1)
    setCurrentVal(newVal)
    onChange(newVal)
  }

  /** Doesn't trigger onChange */
  const autoIncrement = () => {
    setCurrentVal(prev => parseAndClipValue(prev + 1))
  }

  /** Doesn't trigger onChange */
  const autoDecrement = () => {
    setCurrentVal(prev => parseAndClipValue(prev - 1))
  }

  const updateValue = rawVal => {
    const newVal = parseAndClipValue(rawVal)
    setCurrentVal(newVal)
    onChange(newVal)
  }

  const onKeyDown = e => {
    if (e.key === 'ArrowUp') {
      increment()
      e.preventDefault()
    } else if (e.key === 'ArrowDown') {
      decrement()
      e.preventDefault()
    } else if (
      ![
        '0',
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '0',
        'Delete',
        'ArrowLeft',
        'ArrowRight',
        'End',
        'Home',
        'Backspace',
        'Tab',
      ].includes(e.key)
    )
      e.preventDefault()
  }

  return (
    <TightRow>
      <Input
        autoFocus={autoFocus}
        onChange={e => updateValue(e.target.value)}
        onKeyDown={onKeyDown}
        type="text"
        value={currentVal}
      />
      <SolidColumn>
        <UpDownButton
          onMouseDown={() => setActiveButton('up')}
          onMouseUp={() => setActiveButton(null)}
        >
          <ChevronUp
            color={themeContext.colorTextPlaceholder}
            size={16}
            strokeWidth={3.5}
          />
        </UpDownButton>
        <UpDownButton
          onMouseDown={() => setActiveButton('down')}
          onMouseUp={() => setActiveButton(null)}
        >
          <ChevronDown
            color={themeContext.colorTextPlaceholder}
            size={16}
            strokeWidth={3.5}
          />
        </UpDownButton>
      </SolidColumn>
    </TightRow>
  )
}

export default MinimalNumericUpDown
