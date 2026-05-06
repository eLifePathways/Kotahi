/* eslint-disable react/prop-types */

/* eslint-disable no-nested-ternary */

import { useState } from 'react'

import styled from 'styled-components'
import { omit } from 'lodash'
import Form from '@rjsf/core'
import { useTranslation } from 'react-i18next'
import ListManuscripts from './ui/ListManuscripts'
import { ConfirmationModal } from '../../../component-modal/src/ConfirmationModal'

import cmsSchema from './ui/cmsSchema' // Import the function that generates the schema and uiSchema

import { ActionButton, LooseColumn } from '../../../shared'

const DeleteButton = styled(ActionButton)`
  background-color: red;
  float: right;
`

const FieldTemplate = props => {
  const { classNames, description, children } = props

  return (
    <div className={classNames}>
      <b>{description}</b>
      {children}
    </div>
  )
}

const CollectionForm = ({
  collection,
  deleteCollection,
  submitCollection,
  onChange,
  manuscriptLoadOptions,
}) => {
  const { t } = useTranslation()
  const [saving, setSaving] = useState(false)
  const [active, setActive] = useState(collection.active)
  const [isDeletingCollection, setIsDeletingCollection] = useState(false)

  const [image, setImage] = useState({
    previewImage: collection.formData.image,
  })

  const { schema: cmsSch, uiSchema: uiCmsSch } = cmsSchema(
    t,
    image,
    setImage,
    setActive,
    manuscriptLoadOptions,
  )

  const onSubmit = async values => {
    const submitData = {
      ...omit(values.formData, ['image']),
      active,
      manuscripts: values.formData.manuscripts.map(m => m.value),
    }

    if (image.newImage || image.newImage === null) {
      submitData.image = image.newImage
    }

    setSaving(true)
    await submitCollection(submitData, collection.id)
    setTimeout(() => {
      setSaving(false)
    }, 1000)
  }

  return (
    <Form
      fields={{ AsyncSelectWidget: ListManuscripts }}
      FieldTemplate={FieldTemplate}
      formData={{
        ...collection.formData,
        image: image.previewImage,
        active,
        manuscripts: collection.manuscripts,
      }}
      onChange={onChange}
      onSubmit={onSubmit}
      schema={cmsSch}
      uiSchema={uiCmsSch}
    >
      <ActionButton primary type="submit">
        {saving
          ? 'Saving...'
          : collection.isNew
            ? t('cmsPage.metadata.create')
            : t('cmsPage.metadata.update')}
      </ActionButton>
      {collection.isNew !== true && (
        <>
          <DeleteButton onClick={() => setIsDeletingCollection(true)} primary>
            {t('cmsPage.metadata.delete')}
          </DeleteButton>
          <ConfirmationModal
            closeModal={() => setIsDeletingCollection(false)}
            confirmationAction={() => deleteCollection(collection.id)}
            confirmationButtonText={t('cmsPage.metadata.delete')}
            isOpen={isDeletingCollection}
            message={
              <LooseColumn>{t('modals.metadata.deleteCollection')}</LooseColumn>
            }
          />
        </>
      )}
    </Form>
  )
}

export default CollectionForm
