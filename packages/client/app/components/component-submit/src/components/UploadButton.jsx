/* eslint-disable react-hooks/immutability */
/* eslint-disable react/prop-types */
/* eslint-disable no-return-assign */

import styled from 'styled-components'
import { th } from '@coko/client'

const Button = styled.button.attrs(() => ({
  type: 'button',
}))`
  background: transparent;
  border: ${th('borderWidth')} dashed ${th('colorBorder')};
  cursor: pointer;
  height: calc(${th('gridUnit')} * 3);
  margin-bottom: calc(${th('gridUnit')} * 3);
  padding: ${th('gridUnit')};
`

const UploadButton = ({ name, buttonText, onChange }) => {
  let fileInput
  return (
    <>
      <Button onClick={() => fileInput.click()}>{buttonText}</Button>
      <input
        multiple
        name={name}
        onChange={onChange}
        ref={input => (fileInput = input)}
        style={{ display: 'none' }}
        type="file"
      />
    </>
  )
}

export default UploadButton
