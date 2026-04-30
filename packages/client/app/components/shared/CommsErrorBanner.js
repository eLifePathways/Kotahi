import styled from 'styled-components'
import PropTypes from 'prop-types'
import { th, grid } from '@coko/client'

const ErrorBox = styled.div`
  background-color: ${th('colorFurniture')};
  border-radius: ${th('borderRadius')};
  color: #e33;
  font-size: ${th('fontSizeHeading5')};
  margin: ${grid(3)};
  padding: ${grid(2)} ${grid(3)};
`

const CommsErrorBanner = ({ error }) => {
  if (error) console.error('Comms error: ', error)
  return (
    <ErrorBox>Communications error! Please try refreshing the page.</ErrorBox>
  )
}

CommsErrorBanner.propTypes = {
  /** An error for logging to the console */

  error: PropTypes.any,
}

CommsErrorBanner.defaultProps = { error: null }

export default CommsErrorBanner
