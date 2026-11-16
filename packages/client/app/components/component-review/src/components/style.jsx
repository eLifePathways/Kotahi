import styled from 'styled-components'
import { th, grid } from '@coko/client'
import { Action } from '../../../pubsweet'

export const AdminSection = styled.div`
  margin-bottom: ${grid(6)};
`

export const Info = styled.span`
  align-items: center;
  display: flex;
  height: 500px;
  justify-content: center;
  list-style: none;
  margin: 0;
  padding: 0;
`

export const Heading = styled.span`
  font-weight: inherit;
  overflow-wrap: break-word;
  padding: 0 1em 0 0;
`

export const Cell = styled.span`
  grid-column: span 1 / span 1;
  overflow-wrap: break-word;
  padding: 0;
`

export const Affiliation = styled.span`
  color: ${th('color.gray40')};
  margin-left: 0.5em;
`

export const Email = styled.span`
  color: ${th('color.brand1.base')};
  margin-left: 1em;
`

export const BadgeContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  gap: 4px 18px;
`
export const AssignedAuthorForProofingLogsContainer = styled.div`
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`

export const AssignedAuthorForProofingLogsToggle = styled.button`
  background-color: transparent;
  border: none;
  color: ${th('color.brand1.base')};
  font-size: ${th('fontSizeBaseSmall')};
  padding: 10px;
  text-decoration: underline;
`

export const AssignedAuthorForProofingLogs = styled.div`
  color: ${th('color.text')};
  font-size: ${th('fontSizeBaseSmall')};
  margin: 10px;
  text-align: right;
`

export const AssignedAuthorForProofingInfo = styled.div`
  color: ${th('color.text')};
  font-size: ${th('fontSizeBaseSmall')};
  margin: 8px 0;
`

export const UserAction = styled(Action)`
  cursor: pointer;
  display: block;
  font-size: inherit;
  opacity: ${({ isDisabled }) => (isDisabled ? '0.5' : '1')};
  width: fit-content;
`

export {
  Title,
  SectionHeader,
  SectionRow,
  SectionRowGrid,
  SectionAction,
  SectionActionInfo,
} from '../../../shared'
