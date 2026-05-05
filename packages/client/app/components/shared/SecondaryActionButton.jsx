/* stylelint-disable alpha-value-notation, color-function-notation, string-quotes */

import { useContext } from 'react'
import PropTypes from 'prop-types'
import styled, { ThemeContext } from 'styled-components'
import { Check, AlertCircle } from 'react-feather'
import { th, grid, rotate360 } from '@coko/client'
import { color } from '../../theme'

const BaseButton = styled.button`
  border: 2px solid ${color.brand1.base};
  border-radius: ${th('borderRadius')};
  font-family: ${th('fontInterface')};
  font-size: ${th('fontSizeBase')};
  font-weight: 500;
  line-height: ${th('lineHeightBase')};
  min-height: ${grid(3)};
  min-width: ${grid(5)};
  ${props =>
    props.isCompact
      ? ''
      : `
          min-height: 40px;
          min-width: 128px;
        `}
`

const DisabledButton = styled(BaseButton)`
  background-color: ${color.gray90};
  border: 2px solid ${color.gray90};
  color: ${color.gray60};
`

const Button = styled(BaseButton)`
  background-color: white;
  box-shadow: 0 3px 5px 1px rgb(0 0 0 / 20%);
  color: ${color.brand1.base};

  &:hover,
  &:active,
  &:focus {
    background-color: rgb(58 174 42 / 3%);
    box-shadow: 0 3px 5px 1px rgb(0 0 0 / 30%);
  }
`

const LabelOnlySpan = styled.span`
  padding: 0 ${grid(1)};
`

const Spinner = styled.div`
  display: inline-block;
  padding-left: ${grid(1)};
  vertical-align: -2px;

  &::after {
    animation: ${rotate360} 1s linear infinite;
    border: 2.5px solid ${props => props.fgColor};
    border-color: ${props => props.fgColor} transparent
      ${props => props.fgColor} transparent;
    border-radius: 50%;
    box-sizing: border-box;
    content: '';
    display: block;
    height: ${grid(2)};
    width: ${grid(2)};
  }
`

const IconContainer = styled.div`
  display: inline-block;
  height: ${grid(2)};
  margin-left: ${grid(1)};
  vertical-align: -2px;
  width: ${grid(2)};
`

const SecondaryActionButton = ({
  disabled,
  onClick,
  children,
  title,
  type,
  status,
  // secondaryButton,
  // color: col,
}) => {
  const themeContext = useContext(ThemeContext)

  const fgColor =
    status === 'pending' || status === 'success'
      ? color.brand1.base()
      : themeContext.colorError

  let statusIndicator = null

  if (status === 'pending') {
    statusIndicator = <Spinner fgColor={fgColor} />
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
  /** Primary buttons are styled with color.brand1.base, unless another color is specified */
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  /** 'pending' will show a spinner; 'success' will show a tick; 'failure' will show a warning icon and change the color to colorWarning */
  status: PropTypes.string,
  title: PropTypes.string,
  type: PropTypes.string,
  children: PropTypes.node.isRequired,
}

SecondaryActionButton.defaultProps = {
  disabled: false,
  onClick: () => null,
  status: null,
  title: null,
  type: 'button',
}

export default SecondaryActionButton
