/* eslint-disable react/prop-types */
/* eslint-disable promise/always-return */
/* eslint-disable jsx-a11y/no-autofocus */

import { useState } from 'react'
import PropTypes from 'prop-types'
import { th } from '@coko/client'
import styled from 'styled-components'
import { TextField, Button } from '../../pubsweet'

const ModalContainer = styled.div`
  background: ${th('colorBackground')};
  padding: 20px 24px;
  width: 300px;

  input {
    width: 100%;
  }
`

const InlineTextField = styled(TextField)`
  border-color: ${props => (props.error ? '#ff2d1a' : '#AAA')};
  display: inline;
`

const UpdateEmailError = styled.p`
  color: #ff2d1a;
  font-size: 14px;
`

const ButtonContainer = styled.div`
  margin-top: 0.6em;

  button {
    width: 100%;
  }
`

const EnterEmailLabel = styled.label`
  display: block;
`

const EnterEmail = ({ updateUserEmail, user }) => {
  const [email, setEmail] = useState('')
  const [updateEmailError, setUpdateEmailError] = useState('')

  // eslint-disable-next-line no-shadow
  const updateEmail = async (id, email) => {
    await updateUserEmail({ variables: { id, email } }).then(response => {
      if (!response.data.updateEmail.success) {
        setUpdateEmailError(response.data.updateEmail.error)
      } else {
        setUpdateEmailError('')
      }
    })
  }

  return (
    <ModalContainer>
      <form
        onSubmit={e => {
          updateEmail(user.id, email)
          e.preventDefault()
        }}
      >
        <EnterEmailLabel htmlFor="enter-email">Enter Email</EnterEmailLabel>
        <InlineTextField
          autoFocus
          error={updateEmailError}
          id="enter-email"
          onChange={e => setEmail(e.target.value)}
          placeholder="Enter your email"
          value={email}
        />
        <br />
        <UpdateEmailError>{updateEmailError}</UpdateEmailError>
        <ButtonContainer>
          <Button onClick={() => updateEmail(user.id, email)} primary>
            Next
          </Button>
        </ButtonContainer>
      </form>
    </ModalContainer>
  )
}

EnterEmail.propTypes = {
  updateUserEmail: PropTypes.func.isRequired,
}
export default EnterEmail
