/* eslint-disable react/prop-types */

import { serverUrl } from '@coko/client'

import { Img, FallbackImg, LoadingImg } from './style'

const Image = props => {
  const { type, size, mobilesize, src } = props

  const fallbackSrc =
    type === 'user'
      ? `${serverUrl}/profiles/default_avatar.svg`
      : `${serverUrl}/profiles/default_community.svg`

  return (
    <Img
      {...props}
      decode={false}
      key={
        src // Otherwise, upon updating src it shows only the loading image, not the new image.
        // TODO This workaround might not be needed with react-image's more modern useImage hook.
        // What we're using is the legacy standalone component.
      }
      loader={
        <LoadingImg
          alt=""
          mobilesize={mobilesize}
          size={size}
          src={fallbackSrc}
          type={type}
        />
      }
      unloader={
        <FallbackImg
          alt=""
          mobilesize={mobilesize}
          size={size}
          src={fallbackSrc}
          type={type}
        />
      }
    />
  )
}

export default Image
