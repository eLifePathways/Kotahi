import PropTypes from 'prop-types'
import { Heading, Page } from './General'

const AccessErrorPage = ({ message }) => {
  return (
    <Page>
      <Heading>{message}</Heading>
    </Page>
  )
}

AccessErrorPage.propTypes = {
  message: PropTypes.string.isRequired,
}

export default AccessErrorPage
