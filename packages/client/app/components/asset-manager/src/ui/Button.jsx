/* eslint-disable react/prop-types */

import styled from 'styled-components'
import { grid, th } from '@coko/client'

const Button = styled.button`
  /* stylelint-disable declaration-no-important */
  align-items: center;
  background: none;
  border: none;
  color: ${th('color.gray50')};
  display: flex;
  font-family: 'Fira Sans Condensed', sans-serif !important;
  padding: 0;

  svg {
    svg {
      path {
        fill: ${th('color.gray50')};
      }
    }
    height: 28px;
    width: 28px;
  }

  &:disabled {
    color: ${th('color.gray90')};

    svg {
      path {
        fill: ${th('color.gray90')};
      }
    }

    cursor: not-allowed !important;
    font-size: ${th('fontSizeBase')} !important;
    font-style: normal !important;
    font-weight: 200 !important;
    line-height: ${th('lineHeightBase')} !important;
  }

  &:not(:disabled):hover {
    color: ${th('color.brand1.base')};

    svg {
      path {
        fill: ${th('color.brand1.base')};
      }
    }
  }

  &:not(:disabled):active {
    border: none;
    color: ${th('color.brand1.base')};
    outline: none;

    svg {
      path {
        fill: ${th('color.brand1.base')};
      }
    }
  }
`
/* stylelint-enable declaration-no-important */

const Icon = styled.span`
  height: ${grid(7)};
  padding: 0;
  width: ${grid(7)};
`

const OnlyIcon = styled.span`
  height: ${grid(7)};
  padding: 0;
  width: ${grid(7)};
`

const Label = styled.div`
  font-size: ${th('fontSizeBase')};
  line-height: ${th('lineHeightBase')};
`

const ButtonWithIcon = ({
  onClick,
  icon,
  label,
  disabled,
  title,
  className,
}) => {
  return (
    <Button
      className={className}
      disabled={disabled}
      onClick={onClick}
      title={title}
    >
      <Icon>{icon}</Icon>
      <Label>{label.toUpperCase()}</Label>
    </Button>
  )
}

const DefaultButton = ({ onClick, label, disabled, className, title }) => {
  return (
    <Button
      className={className}
      disabled={disabled}
      onClick={onClick}
      title={title}
    >
      <Label>{label.toUpperCase()}</Label>
    </Button>
  )
}

const ButtonWithoutLabel = ({ onClick, icon, disabled, className, title }) => {
  return (
    <Button
      className={className}
      disabled={disabled}
      onClick={onClick}
      title={title}
    >
      <OnlyIcon>{icon}</OnlyIcon>
    </Button>
  )
}

export { ButtonWithIcon, DefaultButton, ButtonWithoutLabel }
