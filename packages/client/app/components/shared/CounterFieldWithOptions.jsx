/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
/* eslint-disable react/prop-types */

/* stylelint-disable alpha-value-notation, color-function-notation */

import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { ChevronUp, ChevronDown } from 'react-feather'
import { color } from '../../theme'

const Container = styled.div`
  display: flex;
  height: 26px;
`

const LabelContainer = styled.div`
  align-items: center;
  background: ${color.backgroundA};
  border: 1.5px solid ${color.gray70};
  border-radius: 10px;
  box-shadow: 0 1px 1px rgb(0 0 0 / 25%);
  display: flex;
  justify-content: center;
  width: 60px;
`

const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 4px;
`

const CounterActionContainer = styled.div`
  button {
    background: transparent;
    border: none;
    cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};

    svg {
      color: ${props => (props.disabled ? color.gray60 : color.gray40)};
    }

    &:hover {
      svg {
        stroke: ${props => (props.disabled ? color.gray60 : color.brand1.base)};
      }
    }
  }
`

const CounterValueUp = styled(CounterActionContainer)`
  margin-top: -3px;
`

const CounterValueDown = styled(CounterActionContainer)`
  margin-top: -10px;
`

const CounterFieldWithOptions = ({
  value,
  options,
  onChange = () => {},
  disabled = false,
}) => {
  const [selectedOption, setSelectedOption] = useState(null)

  const [selectedIndex, setSelectedIndex] = useState(
    options.findIndex(opt => opt.value === value),
  )

  useEffect(() => {
    onChange(selectedOption)
  }, [selectedOption])

  useEffect(() => {
    setSelectedOption(options[selectedIndex])
  }, [selectedIndex])

  const increaseCounter = () => {
    if (disabled) return
    let index = selectedIndex || 0
    index += 1
    if (index >= options.length) index = 0
    setSelectedIndex(index)
  }

  const decreaseCounter = () => {
    if (disabled) return
    let index = selectedIndex || 0
    index -= 1
    if (index < 0) index = options.length - 1
    setSelectedIndex(index)
  }

  return (
    <Container>
      <LabelContainer>{selectedOption?.label}</LabelContainer>
      <ControlsContainer>
        <CounterValueUp disabled={disabled}>
          <button onClick={() => increaseCounter()} type="button">
            <ChevronUp size={16} />
          </button>
        </CounterValueUp>
        <CounterValueDown disabled={disabled}>
          <button onClick={() => decreaseCounter()} type="button">
            <ChevronDown size={16} />
          </button>
        </CounterValueDown>
      </ControlsContainer>
    </Container>
  )
}

export default CounterFieldWithOptions
