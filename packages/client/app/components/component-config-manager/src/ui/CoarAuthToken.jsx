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
  gap: ${grid(4)};
  width: 100%;
`

const CoarAuthFieldWrapper = styled.div`
  display: flex;
  gap: ${grid(4)};
  width: 100%;
`

const StyledTextField = styled(TextField)`
  flex-grow: 1;
`

const StyledActionButton = styled(ActionButton)`
  padding: 0 ${grid(4)};
`

const CoarAuthToken = ({ hasToken, onRefreshCoarAuthToken }) => {
  const { t } = useTranslation()
  const [token, setToken] = useState('')
  const [status, setStatus] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [copied, setCopied] = useState(false)

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

  let displayToken = '****************'

  if (token) {
    displayToken = token
  } else if (!hasToken) {
    displayToken = ''
  }
  const handleCopy = async () => {
    await navigator.clipboard.writeText(token)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
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
        <StyledTextField inline readonly value={displayToken} />
        {status === 'success' && (
          <StyledActionButton onClick={handleCopy}>
            {copied ? t('configPage.coar.copied') : t('configPage.coar.copy')}
          </StyledActionButton>
        )}
        <StyledActionButton onClick={handleRefresh} primary status={status}>
          {t('configPage.coar.refreshAuthToken')}
        </StyledActionButton>
      </CoarAuthFieldWrapper>
    </Wrapper>
  )
}

CoarAuthToken.propTypes = {
  hasToken: PropTypes.bool.isRequired,
  onRefreshCoarAuthToken: PropTypes.func.isRequired,
}

export default CoarAuthToken
