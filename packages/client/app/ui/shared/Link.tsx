import styled from 'styled-components'
import { th, Link as UILink } from '@coko/client'

const Link = styled(UILink)`
  /* stylelint-disable declaration-no-important */
  color: ${th('colorPrimary')} !important;
  border-bottom: 2px solid transparent;
  transition: border 0.2s ease-in-out;

  &:hover {
    border-bottom: 2px solid ${th('colorPrimary')};
  }
`

export default Link
