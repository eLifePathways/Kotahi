/* stylelint-disable alpha-value-notation, color-function-notation, string-quotes */

import { useContext } from 'react'
import PropTypes from 'prop-types'
import styled, { ThemeContext } from 'styled-components'
import { Check, AlertCircle } from 'react-feather'
import { th, grid } from '@coko/client'

import Spinner from '../../ui/shared/Spinner'

const BaseButton = styled.button`
  border: 2px solid ${th('color.brand1.base')};
  border-radius: ${th('borderRadius')};
  font-family: ${th('fontInterface')};
  font-size: ${th('fontSizeBase')};
  font-weight: 500;
  line-height: ${th('lineHeightBase')};
  min-height: ${grid(6)};
  min-width: ${grid(10)};
  ${props =>
    props.isCompact
      ? ''
      : `
          min-height: 40px;
          min-width: 128px;
        `}
`

const DisabledButton = styled(BaseButton)`
  background-color: ${th('color.gray90')};
  border: 2px solid ${th('color.gray90')};
  color: ${th('color.gray60')};
`

const Button = styled(BaseButton)`
  background-color: white;
  box-shadow: 0 3px 5px 1px rgb(0 0 0 / 20%);
  color: ${th('color.brand1.base')};

  &:hover,
  &:active,
  &:focus {
    background-color: rgb(58 174 42 / 3%);
    box-shadow: 0 3px 5px 1px rgb(0 0 0 / 30%);
  }
`

const LabelOnlySpan = styled.span.attrs({
  'data-testid': 'secondary-action-button-label-only-span',
})`
  padding: 0 ${grid(2)};
`

const StatusSpinner = styled(Spinner)`
  margin-left: ${grid(2)};
  vertical-align: -2px;
`

const IconContainer = styled.div`
  display: inline-block;
  height: ${grid(4)};
  margin-left: ${grid(2)};
  vertical-align: -2px;
  width: ${grid(4)};
`

const SecondaryActionButton = ({
  disabled = false,
  onClick = () => null,
  children,
  title,
  type = 'button',
  status,
  // secondaryButton,
  // color: col,
}) => {
  const themeContext = useContext(ThemeContext)

  const fgColor =
    status === 'pending' || status === 'success'
      ? themeContext.color.brand1.base
      : themeContext.colorError

  let statusIndicator = null

  if (status === 'pending') {
    statusIndicator = <StatusSpinner size={4} />
  }

  if (status === 'success') {
    statusIndicator = (
      <IconContainer>
        <Check
          color={fgColor}
          data-testid="check-svg"
          size={16}
          strokeWidth={3}
        />
      </IconContainer>
    )
  }

  if (status === 'failure') {
    statusIndicator = (
      <IconContainer>
        <AlertCircle color={fgColor} size={16} strokeWidth={3} />
      </IconContainer>
    )
  }

  if (disabled)
    return (
      <DisabledButton disabled>
        <LabelOnlySpan>{children}</LabelOnlySpan>
      </DisabledButton>
    )

  return (
    <Button
      onClick={status !== 'pending' ? onClick : null}
      title={title}
      type={type || 'button'}
    >
      {statusIndicator ? (
        <>
          <LabelOnlySpan>{children}</LabelOnlySpan>
          {statusIndicator}
        </>
      ) : (
        <LabelOnlySpan>{children}</LabelOnlySpan>
      )}
    </Button>
  )
}

SecondaryActionButton.propTypes = {
  /** Primary buttons are styled with th('color.brand1.base'), unless another color is specified */
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  /** 'pending' will show a spinner; 'success' will show a tick; 'failure' will show a warning icon and change the color to colorWarning */
  status: PropTypes.string,
  title: PropTypes.string,
  type: PropTypes.string,
  children: PropTypes.node.isRequired,
}

export default SecondaryActionButton
