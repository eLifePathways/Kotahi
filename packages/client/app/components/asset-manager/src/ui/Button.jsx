/* eslint-disable react/prop-types */

import styled from 'styled-components'
import { th } from '@coko/client'
import { color } from '../../../../theme'

const Button = styled.button`
  /* stylelint-disable declaration-no-important */
  align-items: center;
  background: none;
  border: none;
  color: ${color.gray50};
  display: flex;
  font-family: 'Fira Sans Condensed', sans-serif !important;
  padding: 0;
  /* padding: calc(${th('gridUnit')} / 2); */
  svg {
    svg {
      path {
        fill: ${color.gray50};
      }
    }
    height: 28px;
    width: 28px;
  }

  &:disabled {
    color: ${color.gray90};

    svg {
      path {
        fill: ${color.gray90};
      }
    }

    cursor: not-allowed !important;
    font-size: ${th('fontSizeBase')} !important;
    font-style: normal !important;
    font-weight: 200 !important;
    line-height: ${th('lineHeightBase')} !important;
  }

  &:focus {
    outline: 0;
  }

  &:not(:disabled):hover {
    /* background-color: ${color.backgroundC}; */
    color: ${color.brand1.base};

    svg {
      path {
        fill: ${color.brand1.base};
      }
    }
  }

  &:not(:disabled):active {
    /* background-color: ${color.gray90}; */
    border: none;
    color: ${color.brand1.base};
    outline: none;

    svg {
      path {
        fill: ${color.brand1.base};
      }
    }
  }
`
/* stylelint-enable declaration-no-important */

const Icon = styled.span`
  height: calc(3.5 * ${th('gridUnit')});
  /* margin: 0 ${th('gridUnit')} 0 0; */
  padding: 0;
  width: calc(3.5 * ${th('gridUnit')});
`

const OnlyIcon = styled.span`
  height: calc(3.5 * ${th('gridUnit')});
  padding: 0;
  width: calc(3.5 * ${th('gridUnit')});
`

const Label = styled.div`
  font-size: ${th('fontSizeBase')};
  line-height: ${th('lineHeightBase')};
  /* padding-right: 4px; */
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
