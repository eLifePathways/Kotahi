/* eslint-disable react/prop-types */
/* eslint-disable promise/always-return */
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { th } from '@coko/client'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { TextField, Button } from '../../pubsweet'

const InlineTextField = styled(TextField)`
  border-color: ${props => (props.error ? '#ff2d1a' : '#AAA')};
  display: inline;
  width: calc(${th('gridUnit')} * 24);
`

const UpdateEmailError = styled.p`
  color: #ff2d1a;
  font-size: 14px;
`

const ChangeEmail = ({ user, updateUserEmail }) => {
  const [email, setEmail] = useState('')

  const [updateEmailError, setUpdateEmailError] = useState(
    user.email ? '' : 'Required',
  )

  const { t } = useTranslation()
  React.useEffect(() => {
    setEmail(user.email || '')
    setUpdateEmailError('')
  }, [user.email])

  // eslint-disable-next-line no-shadow
  const updateEmail = async (id, email) => {
    await updateUserEmail({ variables: { id, email } }).then(response => {
      if (!response.data.updateEmail.success) {
        setUpdateEmailError(
          t(`common.emailUpdate.${response.data.updateEmail.error}`),
        )
      } else {
        setUpdateEmailError('')
      }
    })
  }

  return (
    <>
      <InlineTextField
        error={updateEmailError}
        onChange={e => setEmail(e.target.value)}
        value={email}
      />
      <Button onClick={() => updateEmail(user.id, email)}>
        {t('profilePage.Change')}
      </Button>
      {updateEmailError && (
        <UpdateEmailError>{updateEmailError}</UpdateEmailError>
      )}
    </>
  )
}

ChangeEmail.propTypes = {
  user: PropTypes.shape({ username: PropTypes.string.isRequired }).isRequired,
}
export default ChangeEmail
