/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */

import { useEffect } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { icons } from '../../../../wax-prosemirror-core'
import { isBoolean, keys } from 'lodash'

// #region STYLED COMPONENTS ---------------------------------------------

const SettingsContainer = styled.div`
  align-items: center;
  border-left: 1px solid #aaa;
  display: flex;
  gap: 5px;
  justify-content: space-between;
  margin-left: 10px;
  padding: 0 8px;
  width: fit-content;

  span {
    display: flex;
    gap: 5px;
  }
`

const OptionButton = styled.button.attrs({ type: 'button' })`
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: center;
  padding: 0;

  > svg {
    fill: ${p => (p.$checked ? '#000' : '#aaa')};
    width: 18px;
  }
`
// #endregion STYLED COMPONENTS ---------------------------------------------

const PromptOptions = ({
  aiService = {},
  optionsState = {},
  setOption = () => {},
  options = [],
}) => {
  if (!options) return null
  const onAiService = ({ key }) => keys(aiService).includes(key)
  const existentOptions = options.filter(onAiService)

  useEffect(() => {
    existentOptions.forEach(({ key }) => setOption(key, aiService[key]))
  }, [])

  return existentOptions ? (
    <SettingsContainer>
      {existentOptions.map(({ key, label, stateText, customIcon }) => {
        const value = optionsState[key]
        const Icon = customIcon || icons[key] || null

        return (
          <OptionButton
            $checked={value}
            key={key}
            onClick={() => setOption(key, isBoolean(value) ? !value : value)}
            title={`${label}${stateText(value)}`}
          >
            {Icon ? <Icon /> : ''}
            {Icon ? '' : label}
          </OptionButton>
        )
      })}
    </SettingsContainer>
  ) : null
}

PromptOptions.propTypes = {
  aiService: PropTypes.shape({}),
  optionsState: PropTypes.shape({}),
  setOption: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      label: PropTypes.string,
      stateText: PropTypes.func, // recieves the option state as the only arg, string expected
    }),
  ),
}

export default PromptOptions
