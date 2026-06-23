/* stylelint-disable alpha-value-notation, color-function-notation */

/* eslint-disable react/prop-types */

import styled from 'styled-components'
import { th } from '@coko/client'

export const StyledInput = styled.input.attrs({
  'data-testid': 'text-input',
})`
  background: ${th('color.gray99')};
  border: 1px solid ${th('color.gray80')};
  border-radius: ${th('borderRadius')};
  box-shadow: inset 0 0 4px rgb(0 0 0 / 7%);
  font-size: ${th('fontSizeBaseSmall')};
  padding: 14px 9px;
  width: 100%;

  &:hover {
    border: 1px solid ${th('color.gray70')};
    outline: none;
    transition: ${th('transitionDuration')};
  }

  &:active,
  &:focus-visible {
    border: 1px solid ${th('color.brand1.base')};
    outline: none;
    transition: ${th('transitionDuration')};
  }
`

export const TextInput = props => {
  // console.log(props)
  const { readonly, value } = props

  /* eslint-disable no-unused-vars */
  const {
    setTouched,
    staticText,
    isValid,
    doiValidation,
    doiUniqueSuffixValidation,
    allowFutureDatesOnly,
    options,
    hideFromAuthors,
    permitPublishing,
    isReadOnly,
    isClearable,
    showMiddleName,
    isRoRMulti,
    showOrcidId,
    validate,
    validationOrcid,
    validationStatus,
    __typename,
    ...rest
  } = props
  /* eslint-enable no-unused-vars */

  return readonly ? <div>{value}</div> : <StyledInput type="text" {...rest} />
}
