/* eslint-disable react/prop-types */

import styled from 'styled-components'

import { TextInput } from '../../../shared'

const FormGroup = styled.div`
  margin-bottom: 16px;
`

const InputGroup = styled.div`
  align-items: center;
  display: flex;
`

const StaticText = styled.span`
  background-color: #dedede;
  border: 1px solid #dedede;
  border-radius: 0.25rem;
  margin-right: -1px;
  padding: 8px;
`

export const FormTextInput = styled(TextInput)`
  border-bottom-left-radius: 0;
  border-left: none;
  border-top-left-radius: 0;
  flex: 1;
  padding: 10px;
`

const StaticTextInput = ({ staticText, ...rest }) => {
  return (
    <FormGroup>
      <InputGroup>
        <StaticText>{staticText}</StaticText>
        <FormTextInput {...rest} />
      </InputGroup>
    </FormGroup>
  )
}

export default StaticTextInput
