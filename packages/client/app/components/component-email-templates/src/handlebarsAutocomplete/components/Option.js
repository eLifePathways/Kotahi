import PropTypes from 'prop-types'
import styled from 'styled-components'
import { grid, th } from '@coko/client/dist/toolkit'
import { keys } from 'lodash'
import { color } from '../../../../../theme'
import { FlexRow } from '../../../../component-cms-manager/src/style'
import { BRACKETS_TYPES } from '../constants'
import { getBrackets, splitAndCapitalize } from '../helpers'

// #region styleds ------------------------------------------------------
// Just a idea to have different colors for each form badge (wich colors may need discussion)
const getFormBadgeBg = ({ $form }) => {
  const colorVariations = {
    common: color.gray50,
    decision: '#d89400',
    review: '#803c01',
    submission: color.brand1.base(),
    editors: '#c46b28',
  }

  const safeKey = keys(colorVariations).includes($form) ? $form : 'common'
  return colorVariations[safeKey]
}

const OptionButton = styled.button`
  background-color: white;
  border: none;
  border-right: 1px solid ${color.brand1.tint70};
  cursor: pointer;
  padding: ${grid(1.5)} ${grid(2)};
  scroll-snap-align: start;
  text-align: left;
  width: 100%;

  &:hover {
    background-color: ${color.brand1.tint90};
  }

  &[aria-selected='true'] {
    background-color: ${color.brand1.tint90};
  }
`

const OptionContent = styled(FlexRow)`
  align-items: center;
  display: flex;
  gap: ${grid(5)};
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
    color: ${color.gray20};
  }
`

const FormBadge = styled.span`
  background-color: ${getFormBadgeBg};
  border-radius: ${th('borderRadius')};
  color: ${th('colorBackground')};
  font-size: ${th('fontSizeBaseSmaller')};
  line-height: 1;
  min-width: 80px;
  padding: ${grid(0.6)} ${grid(0.8)};
  text-align: center;
  text-rendering: optimizeLegibility;
`
// #endregion styleds ---------------------------------------------------

const Option = ({ option, selected, select }) => {
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
        <FormBadge $form={form}>{form}</FormBadge>
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

Option.defaultProps = {
  selected: false,
}

export default Option
