import { type ReactNode } from 'react'
import styled from 'styled-components'

import { grid, th } from '@coko/client'

import fallback from '../assets/avatar_fallback.svg'

const Wrapper = styled.div<{ $size: number }>`
  height: ${(props): string => grid(props.$size)(props)};
  width: ${(props): string => grid(props.$size)(props)};
  position: relative;
`

const Img = styled.img`
  border-radius: ${th('borderRadius')};
  height: 100%;
  object-fit: cover;
  width: 100%;
`

const OnlineIndicator = styled.div<{ $online: boolean }>`
  border: 3px solid ${th('colorBackground')};
  border-radius: 50%;
  height: ${grid(2)};
  width: ${grid(2)};
  background-color: ${(props): string =>
    props.$online ? props.theme.colorPrimary : props.theme.colorDisabled};

  position: absolute;
  bottom: -6px;
  right: -6px;
`

type AvatarProps = {
  /** User's profile image. */
  src?: string
  /** How many multiples of grid unit from the theme. */
  size?: number
  isUserOnline?: boolean
  showOnlineIndicator?: boolean
}

const Avatar = ({
  src,
  size = 6,
  isUserOnline,
  showOnlineIndicator = false,
}: AvatarProps): ReactNode => {
  return (
    <Wrapper $size={size}>
      <Img alt="user avatar" src={src ?? fallback} />
      {showOnlineIndicator && <OnlineIndicator $online={isUserOnline} />}
    </Wrapper>
  )
}

export default Avatar
