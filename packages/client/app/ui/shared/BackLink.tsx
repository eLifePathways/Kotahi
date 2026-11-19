import { type ReactNode } from 'react'
import styled from 'styled-components'
import { grid, th } from '@coko/client'

import { ArrowLeft } from '../base/Icons'
import UILink from './Link'

const StyledBackLink = styled(UILink)`
  display: inline-flex;
  align-items: center;
  gap: ${grid(2)};
  margin-bottom: ${grid(3)};
  font-size: ${th('fontSizeHeading6')};
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
