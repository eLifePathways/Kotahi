/* eslint-disable react/prop-types */

import Modal from '../../../component-modal/src/Modal'
import ManuscriptMetadata from '../article/ManuscriptMetadata'

const ModalMetadataReadOnly = ({
  formWithSubmissionFieldsOnly,
  displayShortIdAsIdentifier,
  open,
  onClose,
}) => {
  return (
    <Modal isOpen={!!open} onClose={onClose} title="Metadata">
      <ManuscriptMetadata
        displayShortIdAsIdentifier={displayShortIdAsIdentifier}
        formWithSubmissionFieldsOnly={formWithSubmissionFieldsOnly}
      />
    </Modal>
  )
}

export default ModalMetadataReadOnly
