import styled from 'styled-components'
import { Link as ReactRouterLink } from 'react-router-dom'
import { th } from '@coko/client'

const Link = styled(ReactRouterLink)`
  && {
    color: ${th('colorPrimary')};
    text-decoration: underline;
    border-bottom: 2px solid transparent;
    transition: border 0.2s ease-in-out;

    &:hover {
      color: ${th('colorPrimary')};
      text-decoration: none;
      border-bottom: 2px solid ${th('colorPrimary')};
    }

    &:focus {
      color: ${th('colorPrimary')};
      text-decoration: none;
    }
  }
`

export default Link
