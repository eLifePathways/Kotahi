import PropTypes from 'prop-types'
import styled from 'styled-components'
import { grid, th } from '@coko/client'

import { FlexRow } from '../../../../component-cms-manager/src/style'
import { BRACKETS_TYPES } from '../constants'
import { getBrackets, splitAndCapitalize } from '../helpers'
import Badge from '../../../../../ui/shared/Badge'

// #region styled
const OptionButton = styled.button`
  background-color: white;
  border: none;
  border-right: 1px solid ${th('color.brand1.tint70')};
  cursor: pointer;
  padding: ${grid(3)} ${grid(4)};
  scroll-snap-align: start;
  text-align: left;
  width: 100%;

  &:hover {
    background-color: ${th('color.brand1.tint90')};
  }

  &[aria-selected='true'] {
    background-color: ${th('color.brand1.tint90')};
  }
`

const OptionContent = styled(FlexRow)`
  align-items: center;
  display: flex;
  gap: ${grid(10)};
  justify-content: space-between;
  pointer-events: none;
  width: 100%;
`

const OptionLabel = styled(FlexRow)`
  flex-direction: column;

  > * {
    line-height: 0.7;
    white-space: nowrap;
  }

  > small {
    color: ${th('color.gray20')};
  }
`

// #endregion styled

const Option = ({ option, selected = false, select }) => {
  const { label, value, form, type } = option
  const [open, close] = getBrackets(BRACKETS_TYPES[type])
  const safeLabel = label.trim() || splitAndCapitalize(value)
  const displayValue = `${open} ${value} ${close}`

  return (
    <OptionButton
      aria-label={`${safeLabel} (${form})`}
      aria-selected={!!selected}
      data-value={value}
      onMouseDown={select}
      role="option"
    >
      <OptionContent>
        <OptionLabel>
          <span>{safeLabel}</span>
          <small>{displayValue}</small>
        </OptionLabel>
        <Badge small>{form}</Badge>
      </OptionContent>
    </OptionButton>
  )
}

Option.propTypes = {
  option: PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.string.isRequired,
    form: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  }).isRequired,
  selected: PropTypes.bool,
  select: PropTypes.func.isRequired,
}

export default Option
