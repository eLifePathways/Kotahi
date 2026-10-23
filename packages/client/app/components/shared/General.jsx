import styled from 'styled-components'
import { grid, th } from '@coko/client'
import { TabsContainer } from './Tabs'

export const Section = styled.section.attrs({
  'data-testid': 'section',
})`
  padding: ${grid(4)} ${grid(6)};
`

export const Content = styled.div`
  background-color: ${th('color.backgroundA')};
  border-radius: ${th('borderRadius')};
  box-shadow: ${th('boxShadow200')};
  clear: both;
`

export const ScrollableContent = styled(Content)`
  @media (width <= 1400px) {
    margin-top: ${grid(4)};
    overflow-x: scroll;
  }
`

export const SectionContent = styled(Section)`
  background-color: ${th('color.backgroundA')};
  border-radius: ${th('borderRadius')};
  box-shadow: ${({ theme }) => theme.boxShadow200};
  padding: 0;

  /* stylelint-disable-next-line */
  ${TabsContainer} + & {
    border-top-left-radius: 0;
    margin-bottom: ${grid(6)};
    margin-top: 0;
  }

  /* stylelint-disable-next-line */
  ${TabsContainer} ~ div > & {
    border-top-left-radius: 0;
    margin-bottom: ${grid(6)};
    margin-top: 0;
  }

  /* stylelint-disable-next-line */
  ${TabsContainer} ~ div > div > & {
    border-top-left-radius: 0;
    margin: 0;
  }
`

export const PaddedContent = styled(Content)`
  margin-bottom: ${grid(6)};
  margin-top: ${grid(6)};
  padding: ${grid(4)} ${grid(6)};
`

export const Container = styled.div`
  background: ${th('color.backgroundC')};
  overflow-y: auto;
  padding: ${grid(4)};
  width: 100%;
`

export const Title = styled.h2.attrs({
  'data-testid': 'section-title',
})`
  font-size: ${th('fontSizeHeading5')};
  font-weight: 500;
`

export const SectionHeader = styled.div`
  border-bottom: 1px solid ${th('color.gray90')};
  padding: ${grid(4)} ${grid(6)};
`

export const SectionRow = styled.div`
  border-bottom: 1px solid ${th('color.gray90')};
  padding: ${grid(4)} ${grid(6)};
`

export const ClickableSectionRow = styled(SectionRow)`
  color: ${th('colorText')};

  :last-of-type {
    border-radius: 0 0 ${th('borderRadius')} ${th('borderRadius')};
  }

  &:hover {
    background-color: ${th('color.backgroundC')};
    cursor: pointer;

    svg {
      stroke: ${th('color.brand1.base')};
    }
  }
`
export const SectionRowGrid = styled(SectionRow)`
  display: grid;
  gap: ${grid(4)};
  grid-template-columns: ${props =>
    props.$expandedWidthDetails ? '1fr 3fr' : 'repeat(4, minmax(0, 1fr))'};
`

export const SectionAction = styled.div`
  grid-column: 3;
  justify-self: end;
`

export const SectionActionInfo = styled.div`
  grid-column: 1 / span 2;
  line-height: ${grid(10)};
`

const Page = styled.div`
  padding: ${grid(4)};
`

const Heading = styled.div.attrs({
  'data-testid': 'general-heading',
})`
  color: ${props =>
    props.$warning
      ? props.theme.color.warning.base
      : props.theme.color.brand1.base};
  font-family: ${th('fontReading')};
  font-size: ${th('fontSizeHeading3')};
  line-height: ${th('lineHeightHeading3')};
`

const FlexRow = styled.div`
  display: flex;
  gap: ${grid(2)};
  justify-content: space-between;
`

export { FlexRow, Page, Heading }

export const HeadingWithAction = styled.div`
  align-items: center;
  display: grid;
  gap: ${grid(4)};
  grid-template-columns: 1fr auto;
`

export const Columns = styled.div`
  display: flex;
  flex: 1 1 100%;
  flex-direction: row;
  height: 100vh;
  place-content: stretch center;
  overflow: hidden;

  & > * {
    flex: 5 1 60em;
  }

  & > *:last-child {
    flex: 1 1.5 28em;
  }
`

export const Manuscript = styled.div`
  background: ${th('color.gray97')};
  grid-area: manuscript;
  height: 100vh;
  overflow: auto;
  padding: ${grid(4)};
`

export const Chat = styled.div`
  border-left: 1px solid ${th('color.gray90')};
  display: flex;
  grid-area: chat;
  height: 100vh;
`

export const VersionLabelWrapper = styled.div`
  display: flex;
  width: 100%;
`

export const VersionTitle = styled.p`
  flex-shrink: 1;
  margin: 0 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const VersionIndicator = styled.p`
  flex-basis: fit-content;
  flex-shrink: 0;
  margin: 0 5px;
`
