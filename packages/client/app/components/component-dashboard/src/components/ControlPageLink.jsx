/* eslint-disable react/prop-types */

import PropTypes from 'prop-types'

import { Link } from '../../../pubsweet'

/* eslint-disable-next-line no-unused-vars */
const ControlPageLink = ({ className, children, version, page, id }) => (
  <Link className={className} to={`versions/${id}/decision`}>
    {children}
  </Link>
)

ControlPageLink.propTypes = {
  version: PropTypes.shape({
    id: PropTypes.string,
  }),
  page: PropTypes.string,
  id: PropTypes.string,
}

export default ControlPageLink
