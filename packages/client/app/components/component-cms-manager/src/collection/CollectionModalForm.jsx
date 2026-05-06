/* eslint-disable react/prop-types */

import CollectionForm from './CollectionForm'
import Modal from '../../../component-modal/src/Modal'

const CollectionModalForm = ({
  deleteCollection,
  submitCollection,
  onChange,
  onClose,
  manuscriptLoadOptions,
  collection,
}) => {
  return (
    <Modal
      isOpen={!!collection}
      onClose={onClose}
      title={
        collection.isNew
          ? 'Create new Collection'
          : `Update Collection: ${collection.formData.title}`
      }
    >
      <CollectionForm
        collection={collection}
        deleteCollection={deleteCollection}
        manuscriptLoadOptions={manuscriptLoadOptions}
        onChange={onChange}
        submitCollection={submitCollection}
      />
    </Modal>
  )
}

export default CollectionModalForm
