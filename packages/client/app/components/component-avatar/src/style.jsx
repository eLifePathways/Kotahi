/* eslint-disable no-shadow */

// @flow
// import theme from 'shared/theme'
import styled, { css } from 'styled-components'
import { Img as ReactImage } from 'react-image'
import { Link } from 'react-router-dom'
import { th } from '@coko/client'
import { color } from '../../../theme'

// import { ProfileHeaderAction } from '../profile/style'
import { MEDIA_BREAK } from '../../layout'
// import { zIndex } from '../../globals'

export const Container = styled.div`
  background-color: ${color.backgroundA};
  border: none;
  border-radius: ${props =>
    props.type === 'community' ? `${props.size / 8}px` : '100%'};
  display: block;
  height: ${props => (props.size ? `${props.size}px` : '32px')};
  position: relative;
  transition: all var(--transition-time);
  width: ${props => (props.size ? `${props.size}px` : '32px')};

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${props =>
    props.mobilesize &&
    css`
      @media (max-width: ${MEDIA_BREAK}px) {
        width: ${props => `${props.mobilesize}px`};
        height: ${props => `${props.mobilesize}px`};
      }
    `};
`

export const AvatarLink = styled(Link)`
  align-items: center;
  border-radius: ${props =>
    props.type === 'community' ? `${props.size / 8}px` : '100%'};
  display: flex;
  flex: none;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  pointer-events: auto;
  width: 100%;
`

// export const CoverAction = styled(ProfileHeaderAction)`
//   position: absolute;
//   top: 12px;
//   right: 12px;
//   z-index: ${zIndex.tooltip + 1};
// `

export const Img = styled(ReactImage)`
  background-color: ${color.backgroundA};
  border-radius: ${props =>
    props.type === 'community' ? `${props.size / 8}px` : '100%'};
  display: inline-block;
  height: ${props => (props.size ? `${props.size}px` : '32px')};
  object-fit: cover;
  transition: all var(--transition-time);
  width: ${props => (props.size ? `${props.size}px` : '32px')};

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${props =>
    props.mobilesize &&
    css`
      @media (max-width: ${MEDIA_BREAK}px) {
        width: ${props => `${props.mobilesize}px`};
        height: ${props => `${props.mobilesize}px`};
      }
    `};
`

export const FallbackImg = styled.img`
  background-color: ${color.brand2.base};
  border-radius: ${props =>
    props.type === 'community' ? `${props.size / 8}px` : '100%'};
  display: inline-block;
  height: ${props => (props.size ? `${props.size}px` : '32px')};
  object-fit: cover;
  width: ${props => (props.size ? `${props.size}px` : '32px')};

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${props =>
    props.mobilesize &&
    css`
      @media (max-width: ${MEDIA_BREAK}px) {
        width: ${props => `${props.mobilesize}px`};
        height: ${props => `${props.mobilesize}px`};
      }
    `};
`

export const LoadingImg = styled.div`
  background: ${color.brand2.base};
  border-radius: ${props =>
    props.type === 'community' ? `${props.size / 8}px` : '100%'};
  display: inline-block;
  height: ${props => (props.size ? `${props.size}px` : '32px')};
  width: ${props => (props.size ? `${props.size}px` : '32px')};

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${props =>
    props.mobilesize &&
    css`
      @media (max-width: ${MEDIA_BREAK}px) {
        width: ${props => `${props.mobilesize}px`};
        height: ${props => `${props.mobilesize}px`};
      }
    `};
`

export const OnlineIndicator = styled.span`
  background: ${th('colorSuccess')};
  border: 2px solid
    ${props =>
      props.onlineBorderColor
        ? props.onlineBorderColor(props.theme)
        : color.textReverse};
  border-radius: 5px;
  bottom: 0;
  height: 10px;
  position: absolute;
  right: 0;
  width: 10px;
  z-index: 0;
`
