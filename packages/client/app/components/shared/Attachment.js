import PropTypes from 'prop-types'
import { Attachment as PubsweetAttachment } from '../pubsweet'

/** A wrapper for pubsweet's Attachment, to convert to its outdated file structure. */
const Attachment = ({ file, uploaded }) => (
  <PubsweetAttachment
    file={{
      name: file.name,
      url: file.storedObjects[0].url,
    }}
    uploaded={uploaded}
  />
)

Attachment.propTypes = {
  file: PropTypes.shape({
    name: PropTypes.string.isRequired,
    storedObjects: PropTypes.arrayOf(
      PropTypes.shape({ url: PropTypes.string.isRequired }).isRequired,
    ).isRequired,
  }).isRequired,
  uploaded: PropTypes.bool,
}

Attachment.defaultProps = {
  uploaded: false,
}

export default Attachment
