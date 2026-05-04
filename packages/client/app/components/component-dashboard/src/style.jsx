import styled from 'styled-components'
import { th, grid } from '@coko/client'
import { color } from '../../../theme'

export { Container, Section, Content } from '../../shared'
const Actions = styled.div``

const ActionContainer = styled.div`
  display: inline-block;
`

export { Actions, ActionContainer }

const Item = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  margin-bottom: calc(${th('gridUnit') * 4});
`

const Header = styled.div`
  align-items: baseline;
  display: flex;
  justify-content: space-between;
  text-transform: uppercase;
`

const Body = styled.div`
  align-items: space-between;
  display: flex;
  justify-content: space-between;
  margin-bottom: calc(${th('gridUnit')} * 4);
  padding-left: 1.5em;

  & > div:last-child {
    flex-shrink: 0;
  }
`

const Divider = styled.span.attrs(props => ({
  children: ` ${props.separator} `,
}))`
  color: ${color.gray90};
  white-space: pre;
`

export { Item, Header, Body, Divider }

const Links = styled.div`
  align-items: flex-end;
  display: flex;
  justify-content: bottom;
`

const LinkContainer = styled.div`
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};
`

export { Links, LinkContainer }

const Page = styled.div`
  padding: ${grid(2)};
`

const Heading = styled.div`
  color: ${color.brand1.base};
  font-family: ${th('fontReading')};
  font-size: ${th('fontSizeHeading3')};
  line-height: ${th('lineHeightHeading3')};
`

export { Page, Heading }

export const HeadingWithAction = styled.div`
  align-items: center;
  display: grid;
  grid-template-columns: 1fr auto;
`

export const Placeholder = styled.div`
  color: ${color.textPlaceholder};
  display: grid;
  height: 100%;
  padding: 4em;
  place-items: center;
`
export const Centered = styled.div`
  text-align: center;
`

export const InvitationContent = styled.div`
  background: ${color.backgroundA};
  border-radius: ${th('borderRadius')};
  box-shadow: ${th('boxShadow')};
  margin-bottom: 1rem;
  max-height: calc(100vh - 32px);
  max-width: 50em;
  overflow-y: auto;
  padding: ${grid(4)};
  text-align: center;
  width: 800px;

  h1 {
    margin-bottom: ${grid(2)};
  }

  img {
    height: auto;
    max-height: 307px;
    max-width: 475px;
    width: auto;
  }
`

export const FeedbackForm = styled.div`
  padding: 20px 40px;
`

export const DeclinedInfoString = styled.p`
  color: ${color.text};
  font-family: ${th('fontWriting')};
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 6px;
  text-align: left;
`

export const ErrorMessage = styled.p`
  color: ${color.text};
  font-family: ${th('fontWriting')};
  font-size: ${th('fontSizeBase')};
  margin-bottom: 6px;
  text-align: left;
`

export const InvitationContainer = styled.div`
  background: linear-gradient(
    134deg,
    ${color.brand1.base},
    ${color.brand1.tint25}
  );
  display: grid;
  height: 100vh;
  place-items: center;
`

export const ButtonWrapper = styled.div`
  button {
    font-family: ${th('fontWriting')};
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 15px;
    padding: 10px 20px;
    text-align: left;
  }
`

export const SubmitFeedbackNote = styled.p`
  color: ${color.gray40};
  font-family: ${th('fontWriting')};
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 15px;
  text-align: left;
`

export const ThankYouString = styled.p`
  color: ${color.gray40};
  font-family: ${th('fontWriting')};
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 15px;
  text-align: center;
`

export const FormInput = styled.div`
  margin-bottom: 20px;

  textarea {
    background: ${color.backgroundC};
    margin-bottom: 15px;
    padding: 20px;
  }
`
