/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
/* eslint-disable react/prop-types */

/* eslint-disable jsx-a11y/no-autofocus */

import { useContext, useEffect, useState } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { X } from 'react-feather'
import { th } from '@coko/client'
import { TightRow } from './Containers'
import MinimalButton from './MinimalButton'
import ElasticTextInput from './ElasticTextInput'
import { color } from '../../theme'

const InputRow = styled(TightRow)`
  & svg {
    display: none;
  }

  &:focus-within svg {
    display: block;
  }

  &:focus-within button:focus {
    display: none;
  }
`

const Input = styled(ElasticTextInput)`
  background: none;
  border: none;
  border-radius: ${th('borderRadius')};
  flex: 1 1;
  font-family: ${th('fontInterface')};
  font-size: ${th('fontSizeBase')};
  line-height: ${th('lineHeightBase')};
  padding: 0 2px;

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

const MinimalTextInput = ({
  autoFocus,
  className,
  isReadOnly,
  value,
  onCancel,
  onChange,
  placeholder,
  fieldId,
  title,
}) => {
  const themeContext = useContext(ThemeContext)
  const [currentVal, setCurrentVal] = useState(value)

  // ContentEditable's onBlur and onKeyDown callbacks don't have access
  // to current state, so need to use functional setCurrentVal, which
  // defers until a different thread, so it can access current state.
  // We need that state to decide whether to invoke onChange or onCancel,
  // and to send through the right data.
  // But we aren't allowed to update the parent component inside the
  // functional setCurrentVal, so we can't invoke onChange or onCancel
  // directly! It's a real pain.
  // Instead we set the actionNeeded flag, which is then acted upon by
  // useEffect() in the main render thread.
  const [actionNeeded, setActionNeeded] = useState(null)

  useEffect(() => {
    if (actionNeeded === 'onCancel') {
      onCancel()
      setCurrentVal(value)
      setActionNeeded(null)
    } else if (actionNeeded === 'onChange') {
      if (onChange) onChange(currentVal)
      setActionNeeded(null)
    }
  }, [actionNeeded])

  useEffect(() => setCurrentVal(value), [value])

  if (isReadOnly) return <ReadOnly>{value}</ReadOnly>

  const tryCommitValue = () => {
    setCurrentVal(current => {
      if (!current) {
        setActionNeeded('onCancel')
        return '' // This state will only persist a fraction of a second, until the useEffect calls onCancel() and reverts the value
      }

      if (current !== value) setActionNeeded(action => action || 'onChange')
      return current
    })
  }

  const revertValue = () => {
    setActionNeeded('onCancel')
  }

  const cancelButtonId = `${fieldId}_cancel`

  return (
    <InputRow className={className} title={title}>
      <Input
        autoFocus={autoFocus}
        onBlur={e => {
          if (e.relatedTarget?.id === cancelButtonId) return
          tryCommitValue()
        }}
        onChange={val => {
          setCurrentVal(val)
        }}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            tryCommitValue()
            e.preventDefault()
            e.target.blur()
          } else if (e.key === 'Escape') {
            revertValue()
            e.preventDefault()
            e.target.blur()
          } else if (e.key === 'Tab') tryCommitValue()
        }}
        placeholder={placeholder}
        spellCheck={false}
        value={currentVal}
      />
      <MinimalButton id={cancelButtonId} onClick={revertValue}>
        <X
          color={themeContext.colorTextPlaceholder}
          size={16}
          strokeWidth={3.5}
        />
      </MinimalButton>
    </InputRow>
  )
}

export default MinimalTextInput
