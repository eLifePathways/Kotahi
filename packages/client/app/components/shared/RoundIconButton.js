/* eslint-disable react/prop-types */

import styled, { useTheme } from 'styled-components'
import * as icons from 'react-feather'
import ActionButton from './ActionButton'
import { color } from '../../theme'

const RoundButton = styled(ActionButton)`
  align-items: center;
  border-radius: 50%;
  height: 40px;
  line-height: 0;
  padding: 0;
  width: 40px;

  span {
    padding: 0;
  }
`

const UnreadMessagesCount = styled.div`
  background-color: ${color.brand1.base};
  border-radius: 50%;
  color: ${color.white};
  font-size: 12px;
  height: 19px;
  line-height: 20px;
  position: absolute;
  right: 3px;
  top: 0;
  width: 19px;
`

const RoundIconButton = ({
  className,
  disabled,
  iconName,
  onClick,
  primary,
  title,
  unreadMessagesCount,
}) => {
  const theme = useTheme()
  const Icon = icons[iconName]
  return (
    <RoundButton
      className={className}
      disabled={disabled}
      isCompact
      onClick={onClick}
      primary={primary}
      title={title}
    >
      {Icon && (
        <Icon
          color={primary ? theme.colorTextReverse : theme.colorText}
          size={18}
          strokeWidth={3}
        />
      )}
      {unreadMessagesCount > 0 && (
        <UnreadMessagesCount>{unreadMessagesCount}</UnreadMessagesCount>
      )}
    </RoundButton>
  )
}

export default RoundIconButton
