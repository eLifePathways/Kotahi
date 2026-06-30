/* eslint-disable react/prop-types */

import styled from 'styled-components'
import { grid, th } from '@coko/client'
import { useTranslation } from 'react-i18next'

import { Icon } from '../../../pubsweet'

const Button = styled.a`
  align-items: center;
  background-color: ${props =>
    props.$isTopBarOpen
      ? props.theme.color.brand1.base
      : props.theme.color.textReverse};
  border: 1px solid ${th('color.gray50')};
  border-radius: 10px;
  height: fit-content;
  margin: ${grid(1)} ${grid(1)} 0 0;
  padding: 4px 0;

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
