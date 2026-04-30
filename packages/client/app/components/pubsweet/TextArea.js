/* eslint-disable react/prop-types */

import styled from 'styled-components'
import PropTypes from 'prop-types'
import { th, override, validationColor } from '@coko/client'
import { useUID } from 'react-uid'

const Root = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  max-width: 100%;
  ${override('ui.TextArea')};
`

const Label = styled.label`
  display: block;
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};
  ${override('ui.Label')};
  ${override('ui.TextArea.Label')};
`

const Area = styled.textarea`
  border: ${th('borderWidth')} ${th('borderStyle')} ${validationColor};
  border-radius: ${th('borderRadius')};
  box-sizing: border-box;
  font-family: ${th('fontWriting')};
  font-size: ${th('fontSizeBase')};
  line-height: ${th('lineHeightBase')};
  max-width: 100%;
  padding: calc(${th('gridUnit')} * 1.5) ${th('gridUnit')};

  &::placeholder {
    color: ${th('colorTextPlaceholder')};
  }

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${override('ui.TextArea.Area')};
`

const TextArea = props => {
  const uid = useUID()
  const { label, value = '', readonly, rows = 5, ...rest } = props

  return (
    <Root>
      {label && <Label htmlFor={uid}>{label}</Label>}
      <Area id={uid} readOnly={readonly} rows={rows} value={value} {...rest} />
    </Root>
  )
}

TextArea.propTypes = {
  label: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  readOnly: PropTypes.bool,
  rows: PropTypes.number,
}

export default TextArea
