import styled from 'styled-components'
import PropTypes from 'prop-types'

const Flexbox = styled.div`
  display: flex;
  flex-direction: ${props => (props.column ? 'column' : 'row')};
  justify-content: ${props => (props.center ? 'center' : 'left')};
`

Flexbox.propTypes = {
  column: PropTypes.bool,
  center: PropTypes.bool,
}

/**
 * @component
 */
export default Flexbox
