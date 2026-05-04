/* eslint-disable react/prop-types */

import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Icon } from '../pubsweet'
import { color } from '../../theme'

const DeleteButton = styled.button`
  align-items: center;
  background: ${color.brand1.base};
  border: none;
  border-radius: 500px;
  display: inline-flex;
  height: 30px;
  justify-content: center;
  position: relative;
  vertical-align: top;
  width: 30px;

  &:hover {
    background-color: ${color.brand1.tint10};
    cursor: pointer;
  }
`

const DeleteControl = ({ onClick, tooltip, iconProps, ...rest }) => (
  <DeleteButton onClick={onClick} title={tooltip} type="button" {...rest}>
    <Icon color={color.textReverse} {...iconProps}>
      x
    </Icon>
  </DeleteButton>
)

DeleteControl.propTypes = {
  onClick: PropTypes.func.isRequired,
  tooltip: PropTypes.string,
}

DeleteControl.defaultProps = {
  tooltip: undefined,
}

export default DeleteControl
