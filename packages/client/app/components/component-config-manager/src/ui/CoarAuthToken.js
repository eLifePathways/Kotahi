import { useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { grid } from '@coko/client'
import { ActionButton, Alert } from '../../../shared'
import { TextField } from '../../../pubsweet'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${grid(2)};
  width: 100%;
`

const CoarAuthFieldWrapper = styled.div`
  display: flex;
  gap: ${grid(2)};
  width: 100%;
`

const StyledTextField = styled(TextField)`
  flex-grow: 1;
`

const StyledActionButton = styled(ActionButton)`
  padding: 0 ${grid(2)};
`

const CoarAuthToken = ({ onRefreshCoarAuthToken }) => {
  const { t } = useTranslation()
  const [token, setToken] = useState('*********')
  const [status, setStatus] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  const handleRefresh = async () => {
    setStatus('pending')

    const { error, authToken } = await onRefreshCoarAuthToken()

    if (error) {
      setErrorMessage(error)
      setStatus('failure')
    } else {
      setToken(authToken)
      setStatus('success')
    }
  }

  return (
    <Wrapper>
      {status && !['pending', 'failure'].includes(status) && (
        <Alert
          description={t('configPage.coar.copyDescription')}
          message={t('configPage.coar.copyMessage')}
          showIcon
          type="warning"
        />
      )}
      {status && status === 'failure' && (
        <Alert description={errorMessage} showIcon type="error" />
      )}
      <CoarAuthFieldWrapper>
        <StyledTextField inline readonly value={token} />
        <StyledActionButton onClick={handleRefresh} primary status={status}>
          {t('configPage.coar.refreshAuthToken')}
        </StyledActionButton>
      </CoarAuthFieldWrapper>
    </Wrapper>
  )
}

CoarAuthToken.propTypes = {
  onRefreshCoarAuthToken: PropTypes.func.isRequired,
}

export default CoarAuthToken
