/* eslint-disable react/prop-types */

import { useState } from 'react'
import PropTypes from 'prop-types'
import { th } from '@coko/client'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { TextField, Button } from '../../pubsweet'

const InlineTextField = styled(TextField)`
  display: inline;
  width: calc(${th('gridUnit')} * 24);
`

const Container = styled.div`
  position: relative;
`

const WarningBox = styled.div`
  color: ${th('colorError')};
  font-size: ${th('fontSizeBaseSmall')};
  position: absolute;
  transform: translate(0, 44px);
`

const ChangeUsername = ({ user, updateUsername }) => {
  const [username, setUsername] = useState(user.username)
  // Don't permit usernames starting with a numeral or starting or ending with whitespace
  const isValid = /^[^0-9\s](?:.*\S)?$/.test(username)

  const { t } = useTranslation()

  const update = async (id, updatedUsername) => {
    await updateUsername({ variables: { id, username: updatedUsername } })
  }

  return (
    <Container>
      {!isValid && <WarningBox>{t('profilePage.usernameWarn')}</WarningBox>}
      <InlineTextField
        onChange={e => setUsername(e.target.value)}
        value={username}
      />
      <Button disabled={!isValid} onClick={() => update(user.id, username)}>
        {t('profilePage.Change')}
      </Button>
    </Container>
  )
}

ChangeUsername.propTypes = {
  user: PropTypes.shape({ username: PropTypes.string.isRequired }).isRequired,
}
export default ChangeUsername
