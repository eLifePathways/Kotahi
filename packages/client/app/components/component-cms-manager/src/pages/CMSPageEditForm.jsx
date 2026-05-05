/* eslint-disable react-hooks/exhaustive-deps, react-hooks/use-memo */
/* eslint-disable react/prop-types */

import { useCallback, useContext, useEffect, useState } from 'react'
import { debounce, kebabCase } from 'lodash'
import { useTranslation } from 'react-i18next'

import { required } from '../../../xpub-validators/src'
import { ValidatedFieldFormik } from '../../../pubsweet'
import { inputFields } from '../FormSettings'
import { useGetSpecificFiles } from '../../../asset-manager/src/queries'
import ModalContext from '../../../asset-manager/src/ui/Modal/ModalContext'
import { ConfirmationModal } from '../../../component-modal/src/ConfirmationModal'
import PublishStatus from '../components/PublishStatus'

import {
  Section,
  Page,
  EditorForm,
  ActionButtonContainer,
  FormActionButton,
  FormActionDelete,
  ErrorMessage,
} from '../style'

const CMSPageEditForm = ({
  isNewPage,
  onSubmit,
  onDelete,
  setFieldValue,
  setTouched,
  key,
  submitButtonText,
  cmsPage,
  autoSaveData,
  autoSubmit,
  customFormErrors,
  resetCustomErrors,
  // currentValues,
  flaxSiteUrlForGroup,
}) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const autoSave = useCallback(debounce(autoSaveData ?? (() => {}), 1000), [])
  useEffect(() => autoSave.flush, [])

  const { t } = useTranslation()

  const {
    showModal,
    hideModal,
    modals,
    modalKey,
    data: modalData,
  } = useContext(ModalContext)

  const { client, query } = useGetSpecificFiles()

  const onAssetManager = cmsPageId => {
    return new Promise((resolve, reject) => {
      const handleImport = async selectedFileIds => {
        const { data } = await client.query({
          query,
          variables: { ids: selectedFileIds },
        })

        const { getSpecificFiles } = data

        const alteredFiles = getSpecificFiles.map(getSpecificFile => {
          const mediumSizeFile = getSpecificFile.storedObjects.find(
            storedObject => storedObject.type === 'medium',
          )

          return {
            source: mediumSizeFile.url,
            mimetype: mediumSizeFile.mimetype,
            ...getSpecificFile,
          }
        })

        hideModal()
        resolve(alteredFiles)
      }

      if (!cmsPageId || cmsPageId === '') {
        reject(new Error('Invalid object ID!'))
      } else {
        showModal('assetManagerEditor', {
          manuscriptId: cmsPageId,
          withImport: true,
          handleImport,
        })
      }
    })
  }

  const onDataChanged = (itemKey, value) => {
    const data = {}
    data[itemKey] = value
    autoSave(cmsPage.id, data)

    if (Object.keys(customFormErrors).includes(itemKey)) {
      resetCustomErrors()
    }

    if (isNewPage && itemKey === 'title') {
      setUrlBasedOnTitle(value)
    }
  }

  const setUrlBasedOnTitle = title => {
    const fieldKey = 'url'
    const titleSlug = `${kebabCase(title)}/`
    setFieldValue(fieldKey, titleSlug, false)
    onDataChanged(fieldKey, titleSlug)
  }

  const getInputFieldSpecificProps = item => {
    let props = {}

    switch (item.type) {
      case 'text-input':
        props.onChange = value => {
          let val = value

          if (value.target) {
            val = value.target.value
          } else if (value.value) {
            val = value.value
          }

          setFieldValue(item.name, val, false)
          onDataChanged(item.name, val)
        }

        props.staticText = flaxSiteUrlForGroup

        break

      case 'rich-editor':
        props.onChange = value => {
          setFieldValue(item.name, value)
          onDataChanged(item.name, value)
        }

        props.onAssetManager = () => {
          if (cmsPage.id) {
            return onAssetManager(cmsPage.id)
          }

          autoSubmit() // Auto submitting form as asset manager needs ID!
          return onAssetManager()
        }

        break

      default:
        props = {}
    }

    return props
  }

  const renderCustomErrors = item => {
    const error = customFormErrors[item.name]

    if (!error) {
      return null
    }

    return <ErrorMessage>{error}</ErrorMessage>
  }

  const localizeInputFields = fields => {
    return fields.map(field => {
      if (field.label.length) {
        const newField = field
        newField.label = t(`cmsPage.pages.fields.${newField.name}`)
        return newField
      }

      return field
    })
  }

  const ModalComponent = modals?.[modalKey]

  return (
    <>
      {modalKey && ModalComponent && (
        <ModalComponent
          data={modalData}
          hideModal={hideModal}
          isOpen={modalKey !== undefined}
        />
      )}
      <Page>
        <EditorForm key={key} onSubmit={onSubmit}>
          {localizeInputFields(inputFields).map(item => {
            return (
              <Section flexGrow={item.flexGrow || false} key={item.name}>
                <p style={{ fontSize: '10px' }}>{item.label}</p>
                <ValidatedFieldFormik
                  component={item.component}
                  name={item.name}
                  setTouched={setTouched}
                  style={{ width: '100%' }}
                  validate={item.isRequired ? required : null}
                  {...item.otherProps}
                  {...getInputFieldSpecificProps(item)}
                />
                {renderCustomErrors(item)}
              </Section>
            )
          })}
          <ActionButtonContainer>
            <div>
              <FormActionButton onClick={onSubmit} primary type="button">
                {submitButtonText}
              </FormActionButton>
              {!isNewPage && (
                <FormActionDelete
                  onClick={() => setIsConfirmingDelete(true)}
                  style={{ minWidth: '104px' }}
                >
                  {t('cmsPage.pages.Delete')}
                </FormActionDelete>
              )}
            </div>
            {!isNewPage && <PublishStatus cmsComponent={cmsPage} />}
          </ActionButtonContainer>
          <ConfirmationModal
            cancelButtonText={t('modals.cmsPageDelete.Cancel')}
            closeModal={() => setIsConfirmingDelete(false)}
            confirmationAction={() => onDelete(cmsPage)}
            confirmationButtonText={t('modals.cmsPageDelete.Delete')}
            isOpen={isConfirmingDelete}
            message={t('modals.cmsPageDelete.permanentlyDelete', {
              pageName: cmsPage.title,
            })}
          />
        </EditorForm>
      </Page>
    </>
  )
}

export default CMSPageEditForm
