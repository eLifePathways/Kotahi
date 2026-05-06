/* eslint-disable react/prop-types */

import styled from 'styled-components'
import { Link as UnstyledLink } from 'react-router-dom'
import { th, override } from '@coko/client'

// const NativeLink = styled.a``

const SmartUnstyledLink = props => {
  if (props.to && /^https?:\/\//.test(props.to)) {
    return (
      <a href={props.to} {...props}>
        {props.children}
      </a>
    )
  }

  return <UnstyledLink {...props} />
}

const Link = styled(SmartUnstyledLink)`
  color: ${th('colorPrimary')};
  cursor: pointer;

  ${override('ui.Link')};
`

export default Link
