import styled from 'styled-components'
import { th } from '@coko/client'
import { color } from '../../../../theme'

// import theme from 'shared/theme';

import { Truncate } from '../../../../globals'

export const MentionsInputStyle = {
  overflow: 'visible',
}

export const StyledMentionSuggestion = styled.div`
  align-items: center;
  background: ${props =>
    props.focused ? th('colorBackgroundHue') : th('colorBackground')};
  border-bottom: 1px solid ${th('colorBorder')};
  display: flex;
  line-height: 1.3;
  min-width: 156px;
  padding: 8px 12px;
`

export const MentionContent = styled.div`
  display: flex;
  flex-direction: column;
`

export const MentionName = styled.span`
  color: ${props => (props.focused ? color.brand1.base : color.text)};
  font-size: 14px;
  font-weight: 500;
  margin-left: 12px;
  width: calc(184px - 62px);

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${Truncate}
`

export const MentionUsername = styled.span`
  color: ${props => (props.focused ? color.brand1.base : th('colorWarning'))};
  font-size: 13px;
  font-weight: 400;
  margin-left: 12px;
  width: calc(184px - 62px);

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${Truncate}
`
