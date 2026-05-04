/* eslint-disable react/prop-types */

import styled from 'styled-components'
import { Checkbox } from '../../../pubsweet'

const StyledCheckboxTable = styled(Checkbox)`
  height: 16px;
  margin-right: 15px;
  width: 18px;
`

const RowItemCheckbox = ({
  manuscript,
  selectedNewManuscripts,
  toggleNewManuscriptCheck,
}) => {
  return (
    <StyledCheckboxTable
      checked={selectedNewManuscripts.includes(manuscript.id)}
      onChange={() => toggleNewManuscriptCheck(manuscript.id)}
    />
  )
}

export default RowItemCheckbox
