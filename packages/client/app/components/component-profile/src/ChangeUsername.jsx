/* eslint-disable react/prop-types */

import { useState } from 'react'
import PropTypes from 'prop-types'
import { grid, th } from '@coko/client'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { TextField } from '../../pubsweet'
import { ActionButton } from '../../shared'

const InlineTextField = styled(TextField)`
  display: inline;
  width: ${grid(48)};
`

const Row = styled.div`
  align-items: center;
  display: flex;
  gap: ${grid(2)};
`

const WarningBox = styled.div`
  color: ${th('colorError')};
  font-size: ${th('fontSizeBaseSmall')};
  margin-top: ${grid(1)};
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
    <>
      <Row>
        <InlineTextField
          inline
          onChange={e => setUsername(e.target.value)}
          value={username}
        />
        <ActionButton
          disabled={!isValid}
          onClick={() => update(user.id, username)}
          primary
        >
          {t('profilePage.Change')}
        </ActionButton>
      </Row>
      {!isValid && <WarningBox>{t('profilePage.usernameWarn')}</WarningBox>}
    </>
  )
}

ChangeUsername.propTypes = {
  user: PropTypes.shape({ username: PropTypes.string.isRequired }).isRequired,
}
export default ChangeUsername
