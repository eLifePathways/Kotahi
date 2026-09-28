import { type ReactNode } from 'react'
import styled from 'styled-components'
import { grid, th, Link as UILink } from '@coko/client'

import { ArrowLeft } from '../base/Icons'

const StyledBackLink = styled(UILink)`
  /* stylelint-disable declaration-no-important */

  display: inline-flex;
  align-items: center;
  gap: ${grid(2)};
  margin-bottom: ${grid(3)};
  font-size: ${th('fontSizeHeading6')};

  && {
    color: ${th('colorPrimary')} !important;

    &:hover,
    &:focus {
      color: ${th('colorPrimary')} !important;
    }
  }
`

type BackLinkProps = {
  /** Where the link navigates to. */
  href: string
  label: string
}

const BackLink = ({ href, label }: BackLinkProps): ReactNode => (
  <StyledBackLink to={href}>
    <ArrowLeft aria-hidden />
    {label}
  </StyledBackLink>
)

export default BackLink
