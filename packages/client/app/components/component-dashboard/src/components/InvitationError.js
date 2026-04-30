import { useContext } from 'react'
import PropTypes from 'prop-types'
import { ConfigContext } from '../../../config/src'

import {
  Centered,
  InvitationContent,
  DeclinedInfoString,
  FeedbackForm,
  InvitationContainer,
  ErrorMessage,
} from '../style'

const InvitationError = ({ errorHeading, errorMessage, link }) => {
  const config = useContext(ConfigContext)
  return (
    <InvitationContainer>
      <Centered>
        <InvitationContent>
          <img
            alt={config?.groupIdentity?.brandName}
            src={
              config?.logo?.storedObjects[0].url ||
              config?.groupIdentity?.logoPath
            }
          />
          <FeedbackForm>
            <DeclinedInfoString>{errorHeading}</DeclinedInfoString>
            {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
            {link}
          </FeedbackForm>
        </InvitationContent>
      </Centered>
    </InvitationContainer>
  )
}

InvitationError.propTypes = {
  errorHeading: PropTypes.string.isRequired,
  errorMessage: PropTypes.string,
  link: PropTypes.element,
}

InvitationError.defaultProps = {
  errorMessage: null,
  link: null,
}

export default InvitationError
