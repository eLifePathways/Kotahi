/* eslint-disable react/prop-types */

import styled from 'styled-components'
import { th, override, validationColor } from '@coko/client'
import { useUID } from 'react-uid'

const Root = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${props =>
    props.inline ? '0' : `calc(${props.theme.gridUnit} * 3)`};
  ${override('ui.TextField')};
`

const Label = styled.label`
  display: block;
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};
  ${override('ui.Label')};
  ${override('ui.TextField.Label')};
`

const Input = styled.input`
  border: ${th('borderWidth')} ${th('borderStyle')} ${validationColor};
  border-radius: ${th('borderRadius')};
  font-family: inherit;
  font-size: inherit;
  height: calc(${th('gridUnit')} * 6);
  padding: 0 ${th('gridUnit')};

  &::placeholder {
    color: ${th('colorTextPlaceholder')};
  }

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${override('ui.TextField.Input')};
`

const TextField = props => {
  const uid = useUID()

  const {
    innerRefProp,
    className,
    label,
    type = 'text',
    value = '',
    readonly,
    inline,
    ...rest
  } = props

  return (
    <Root className={className} inline={inline}>
      {label && <Label htmlFor={uid}>{label}</Label>}
      <Input
        id={uid}
        readOnly={readonly}
        ref={innerRefProp}
        type={type}
        value={value}
        {...rest}
      />
    </Root>
  )
}

export default TextField
