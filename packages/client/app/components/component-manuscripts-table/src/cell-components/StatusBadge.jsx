/* eslint-disable react/prop-types */

import styled from 'styled-components'
import { th } from '@coko/client'

const Status = styled.span`
  border-radius: 8px;
  font-size: ${th('fontSizeBaseSmall')};
  font-variant: all-small-caps;
`

const StatusBadgeComponent = ({ manuscript }) =>
  manuscript.submission?.adaState ? (
    <Status>{manuscript.submission?.adaState}</Status>
  ) : null

export default StatusBadgeComponent
