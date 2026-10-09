import styled from 'styled-components'
import { th } from '@coko/client'

export const ControlLabel = styled.div`
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};
`

export const CompactDetailLabel = styled.div`
  color: ${props => th(props.isWarning ? 'colorError' : 'color.gray50')};
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('fontSizeBaseSmall')};
`

export const InvalidLabel = styled.div`
  color: ${th('colorError')};
  font-size: ${th('fontSizeBaseSmaller')};
  text-align: left;
`
