import styled from 'styled-components'
import { th, grid } from '@coko/client'

export const Placeholder = styled.div.attrs({
  'data-testid': 'placeholder',
})`
  color: ${th('color.textPlaceholder')};
  display: grid;
  height: 100%;
  padding: 4em;
  place-items: center;
`

export const Centered = styled.div`
  text-align: center;
`

export const InvitationContent = styled.div`
  background: ${th('color.backgroundA')};
  border-radius: ${th('borderRadius')};
  box-shadow: ${th('boxShadow200')};
  margin-bottom: 1rem;
  max-height: calc(100vh - 32px);
  max-width: 50em;
  overflow-y: auto;
  padding: ${grid(8)};
  text-align: center;
  width: 800px;

  h1 {
    margin-bottom: ${grid(4)};
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
  color: ${th('color.text')};
  font-family: ${th('fontWriting')};
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 6px;
  text-align: left;
`

export const ErrorMessage = styled.p`
  color: ${th('color.text')};
  font-family: ${th('fontWriting')};
  font-size: ${th('fontSizeBase')};
  margin-bottom: 6px;
  text-align: left;
`

export const InvitationContainer = styled.div`
  background: linear-gradient(
    134deg,
    ${th('color.brand1.base')},
    ${th('color.brand1.tint25')}
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
  color: ${th('color.gray40')};
  font-family: ${th('fontWriting')};
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 15px;
  text-align: left;
`

export const ThankYouString = styled.p`
  color: ${th('color.gray40')};
  font-family: ${th('fontWriting')};
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 15px;
  text-align: center;
`

export const FormInput = styled.div`
  margin-bottom: 20px;

  textarea {
    background: ${th('color.backgroundC')};
    margin-bottom: 15px;
    padding: 20px;
  }
`
