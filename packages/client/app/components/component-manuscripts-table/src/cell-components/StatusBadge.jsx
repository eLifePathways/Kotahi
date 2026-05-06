/* eslint-disable react/prop-types */

import styled, { css } from 'styled-components'
import { grid, th } from '@coko/client'
import { color } from '../../../../theme'

const Status = styled.span`
  border-radius: 8px;
  font-size: ${th('fontSizeBaseSmall')};
  font-variant: all-small-caps;

  ${props =>
    !props.minimal &&
    css`
      padding: ${grid(0.5)} ${grid(1)};
    `}

  ${props =>
    props.clickable &&
    css`
      cursor: pointer;
    `}

  ${props =>
    props.color &&
    css`
      background-color: ${props.color};
    `}
`

const NormalStatus = styled(Status)`
  ${props =>
    props.minimal
      ? css`
          color: ${color.brand1.base};
        `
      : css`
          background-color: ${th('colorWarning')};
        `}
`

const StatusBadgeComponent = ({ manuscript, styles }) =>
  manuscript.submission?.adaState ? (
    <NormalStatus style={styles}>
      {manuscript.submission?.adaState}
    </NormalStatus>
  ) : null

export default StatusBadgeComponent
