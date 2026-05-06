/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
/* eslint-disable react/prop-types */

/* stylelint-disable alpha-value-notation, color-function-notation */

import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { X as CloseIcon, ChevronUp, ChevronDown } from 'react-feather'
import { useTranslation } from 'react-i18next'
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
  padding-right: ${props => (props.showResetIcon ? '15px' : '0')};
  position: relative;
  width: ${props => (props.compact ? '50px' : '65px')};
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

const CloseIconContainer = styled(CounterActionContainer)`
  align-items: center;
  border-radius: 500px;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  justify-content: center;
  position: absolute;
  right: 3px;
`

const CounterField = ({
  value: propsValue,
  minValue,
  onChange = () => {},
  showNone = false,
  compact = false,
  disabled = false,
}) => {
  const [value, setValue] = useState(propsValue)
  const { t } = useTranslation()

  const [displayValue, setDisplayValue] = useState(
    propsValue === null ? t('taskManager.task.durationDaysNone') : propsValue,
  )

  const [showResetIcon, setShowResetIcon] = useState(false)
  const noneValue = null
  const defaultValue = showNone ? noneValue : minValue || 0

  useEffect(() => {
    setValue(propsValue)
  }, [propsValue])

  useEffect(() => {
    setDisplayValue(
      value === null ? t('taskManager.task.durationDaysNone') : value,
    )
    // this check is required to avoid infinite loop as `value` change leads to `propsValue`
    // change via `onChange` and then `propsChange` change leads to `value` change
    if (value !== propsValue) onChange(value)
    setShowResetIcon(value !== defaultValue)
  }, [value])

  const resetValue = () => {
    if (disabled) return
    setValue(defaultValue)
  }

  const increaseCounter = () => {
    if (disabled) return
    let updatedValue = null
    if (value === null) updatedValue = 0
    else updatedValue = value + 1
    setValue(updatedValue)
  }

  const decreaseCounter = () => {
    if (disabled) {
      return
    }

    let updatedValue = null

    if (value !== null) {
      updatedValue = value - 1

      if (minValue !== null && updatedValue < minValue) {
        updatedValue = showNone ? noneValue : minValue
      }
    }

    setValue(updatedValue)
  }

  return (
    <Container>
      <LabelContainer compact={compact} showResetIcon={showResetIcon}>
        <span>{displayValue}</span>
        {showResetIcon && (
          <CloseIconContainer disabled={disabled} onClick={() => resetValue()}>
            <CloseIcon color={disabled ? color.gray60 : color.text} size={15} />
          </CloseIconContainer>
        )}
      </LabelContainer>
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

export default CounterField
