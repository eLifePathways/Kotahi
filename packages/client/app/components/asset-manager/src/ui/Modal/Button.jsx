/* eslint-disable react/prop-types */

import styled from 'styled-components'

import RootButton from './RootButton'

const StyledIcon = styled.i`
  display: block;
  height: 24px;
  width: 24px;
`

const Label = styled.span`
  ${props => props.hasIcon && `margin-left: 4px;`}
`

const Button = props => {
  const {
    active,
    className,
    danger,
    disabled,
    title,
    label,
    icon,
    onClick,
    type,
  } = props

  return (
    <RootButton
      active={active}
      className={className}
      danger={danger}
      disabled={disabled}
      label={label}
      onClick={onClick}
      title={title}
      type={type}
    >
      {icon && (
        <StyledIcon active={active} disabled={disabled}>
          {icon}
        </StyledIcon>
      )}
      {label && <Label hasIcon={!!icon}>{label}</Label>}
    </RootButton>
  )
}

export default Button
