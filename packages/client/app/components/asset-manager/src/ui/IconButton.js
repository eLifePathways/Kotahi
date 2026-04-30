/* eslint-disable react/prop-types */

import styled from 'styled-components'
import { color } from '../../../../theme'

const Button = styled.button`
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  flex-basis: fit-content;
  height: 24px;
  justify-content: center;
  padding: 0;
  width: 24px;

  &:focus {
    outline: 0;
  }

  svg {
    height: 24px;
    width: 24px;
  }

  &:disabled {
    svg {
      fill: ${color.gray90};
    }
  }

  &:not(:disabled):hover {
    svg {
      fill: ${color.brand1.base};
    }
  }
`

const IconButton = ({ onClick, icon, disabled, className, type }) => (
  <Button
    className={className}
    disabled={disabled}
    onClick={onClick}
    type={type}
  >
    <span>{icon}</span>
  </Button>
)

export default IconButton
