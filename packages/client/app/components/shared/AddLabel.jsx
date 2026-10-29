/* eslint-disable react/prop-types */

import styled from 'styled-components'
import { grid } from '@coko/client'
import { Plus } from 'react-feather'

const Label = styled.span`
  align-items: center;
  display: inline-flex;
  gap: ${grid(2)};
  vertical-align: middle;
`

/** Button label for "Add ..." actions, prefixed with a plus icon. Use inside any button. */
const AddLabel = ({ children }) => (
  <Label>
    <Plus aria-hidden="true" size={16} />
    {children}
  </Label>
)

export default AddLabel
