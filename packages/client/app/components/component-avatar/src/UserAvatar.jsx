/* eslint-disable react/prop-types */

import { useContext } from 'react'
import styled from 'styled-components'

import { serverUrl } from '@coko/client'

import AvatarImage from './image'
import { Container, AvatarLink, OnlineIndicator } from './style'
import ConditionalWrap from '../../ConditionalWrap'
import { ConfigContext } from '../../config/src'

const UserHoverProfile = styled.div``

const Avatar = props => {
  const config = useContext(ConfigContext)
  const { urlFrag } = config

  const {
    user,
    dataCy,
    size = 32,
    mobilesize,
    style,
    showOnlineStatus = true,
    isClickable = true,
    onlineBorderColor = null,
  } = props

  const src = user?.profilePicture

  const userFallback = `${serverUrl}/profiles/default_avatar.svg`

  const source = [src, userFallback]

  return (
    <Container
      data-cy={dataCy}
      mobileSize={mobilesize}
      size={size}
      style={style}
      type="user"
    >
      {showOnlineStatus && user?.isOnline && (
        <OnlineIndicator onlineBorderColor={onlineBorderColor} />
      )}
      <ConditionalWrap
        condition={!!user?.username && isClickable}
        wrap={() => (
          <AvatarLink to={`${urlFrag}/profile/${user?.id}`}>
            <AvatarImage
              mobilesize={mobilesize}
              size={size}
              src={source}
              type="user"
            />
          </AvatarLink>
        )}
      >
        <AvatarImage
          mobilesize={mobilesize}
          size={size}
          src={source}
          type="user"
        />
      </ConditionalWrap>
    </Container>
  )
}

const AvatarHandler = props => {
  const { showHoverProfile = true, user, size = 32 } = props

  if (user) {
    return (
      <ConditionalWrap
        condition={showHoverProfile}
        wrap={() => (
          <UserHoverProfile username={user.username}>
            <Avatar size={size} {...props} />
          </UserHoverProfile>
        )}
      >
        <Avatar size={size} {...props} />
      </ConditionalWrap>
    )
  }

  return <Avatar {...props} />
}

export default AvatarHandler
