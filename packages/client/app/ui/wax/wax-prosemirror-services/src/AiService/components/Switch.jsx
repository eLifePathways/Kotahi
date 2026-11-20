/* eslint-disable react/prop-types */

import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'
import Switch from 'rc-switch'
import { grid, th } from '../../helpers'

const Wrapper = styled.span`
  button {
    width: 65px;
  }

  .rc-switch-inner {
    left: 22px;
  }

  .rc-switch-checked {
    background-color: ${th('colorPrimary')};
    border: 1px solid ${th('colorPrimary')};

    .rc-switch-inner {
      left: 6px;
    }

    &::after {
      left: 42px;
    }
  }
`

const Label = styled.label`
  cursor: pointer;
  ${props =>
    props.$labelPosition === 'left' &&
    css`
      margin-top: 4px;
      font-size: 14px;
      margin-right: ${grid(2)};
    `}

  ${props =>
    props.$labelPosition === 'right' &&
    css`
      margin-top: 4px;
      font-size: 14px;
      margin-left: ${grid(2)};
    `}
`

const SwitchComponent = props => {
  const {
    className,
    label,
    labelPosition = 'right',
    onChange = () => true,
    text = '',
    ...rest
  } = props

  return (
    <Wrapper className={className}>
      {label && labelPosition === 'left' && (
        <Label $labelPosition={labelPosition} onClick={onChange}>
          {label}
        </Label>
      )}

      <Switch onChange={onChange} text={text} {...rest} />

      {label && labelPosition === 'right' && (
        <Label $labelPosition={labelPosition} onClick={onChange}>
          {label}
        </Label>
      )}
    </Wrapper>
  )
}

SwitchComponent.propTypes = {
  label: PropTypes.string,
  labelPosition: PropTypes.string,
  onChange: PropTypes.func,
  text: PropTypes.string,
}

export default SwitchComponent
