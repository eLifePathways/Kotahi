/* eslint-disable react/prop-types */

import PropTypes from 'prop-types'
import styled, { useTheme } from 'styled-components'
import { th } from '@coko/client'
import { Icon } from '../pubsweet'

const DeleteButton = styled.button`
  align-items: center;
  background: ${th('color.brand1.base')};
  border: none;
  border-radius: 500px;
  display: inline-flex;
  height: 30px;
  justify-content: center;
  position: relative;
  vertical-align: top;
  width: 30px;

  &:hover {
    background-color: ${th('color.brand1.tint10')};
    cursor: pointer;
  }
`

const DeleteControl = ({ onClick, tooltip, iconProps, ...rest }) => {
  const theme = useTheme()
  return (
    <DeleteButton onClick={onClick} title={tooltip} type="button" {...rest}>
      <Icon color={theme.color.textReverse} {...iconProps}>
        x
      </Icon>
    </DeleteButton>
  )
}

DeleteControl.propTypes = {
  onClick: PropTypes.func.isRequired,
  tooltip: PropTypes.string,
}

export default DeleteControl
