/* eslint-disable react/prop-types */

import styled from 'styled-components'
import { th } from '@coko/client'
import { useTranslation } from 'react-i18next'

import { Icon } from '../../../pubsweet'

const Button = styled.a`
  align-items: center;
  background-color: ${props =>
    props.$isTopBarOpen
      ? props.theme.color.brand1.base
      : props.theme.color.textReverse};
  border: 1px solid ${th('color.gray50')};
  border-radius: ${th('borderRadius')};
  display: flex;
  /* Matches InputWrapper's min-height (SuperChatInput/style.jsx) so the
     toolbar toggle lines up with the input box beside it. */
  height: 40px;
  justify-content: center;
  margin-right: 10px;
  padding: 21px 0 20px;

  &:hover {
    background-color: ${props =>
      props.$isTopBarOpen
        ? props.theme.color.brand1.tint25
        : props.theme.color.gray80};
  }

  svg {
    stroke: ${props =>
      props.$isTopBarOpen
        ? props.theme.color.textReverse
        : props.theme.color.text};
    width: 0.8em;
  }
`

const ToolbarButton = ({ onClick, isTopBarOpen }) => {
  const { t } = useTranslation()

  return (
    <Button
      $isTopBarOpen={isTopBarOpen}
      onClick={onClick}
      title={isTopBarOpen ? t('chat.Hide formatting') : t('chat.Formatting')}
    >
      {isTopBarOpen ? <Icon>chevron-down</Icon> : <Icon>chevron-up</Icon>}
    </Button>
  )
}

export default ToolbarButton
