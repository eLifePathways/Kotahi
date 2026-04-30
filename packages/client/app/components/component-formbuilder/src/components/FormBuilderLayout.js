/* eslint-disable react/prop-types */

import { useContext, useState } from 'react'
import PropTypes from 'prop-types'
import { forEach } from 'lodash'
import styled, { withTheme } from 'styled-components'
import { v4 as uuid } from 'uuid'
import { useTranslation } from 'react-i18next'
import { Action, Icon } from '../../../pubsweet'
import FormSettingsModal from './FormSettingsModal'
import FieldSettingsModal from './FieldSettingsModal'
import FormBuilder from './FormBuilder'
import {
  Container,
  Heading,
  HiddenTabs,
  SectionContent,
  SectionRow,
  TightRow,
  ActionButton,
  RoundIconButton,
} from '../../../shared'
import { ConfirmationModal } from '../../../component-modal/src/ConfirmationModal'
import FormSummary from './FormSummary'
import { color } from '../../../../theme'
import { ConfigContext } from '../../../config/src'

const AddFieldButton = styled(RoundIconButton)`
  flex: 0 0 40px;
  margin: 8px 0 0 28px;
`

const IconAction = styled(Action)`
  line-height: 1.15;
  vertical-align: text-top;
`

const UnpaddedIcon = styled(Icon)`
  line-height: 1.15;
  padding: 0;
  vertical-align: text-top;
`

const ControlIcon = withTheme(({ children }) => (
  <UnpaddedIcon color={color.brand1.base()}>{children}</UnpaddedIcon>
))

const AddFormButton = styled(ActionButton)`
  position: absolute;
  right: 0;
`

const WidthLimiter = styled.div`
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  max-width: 1200px;
  min-height: 0;
`

const formIsActive = form => {
  if (!form.category) return false

  if (form.category === 'submission') {
    if (form.purpose === 'submit') return true
  } else if (form.purpose === form.category) return true

  return false
}

const getFormsOrderedActiveFirstThenAlphabetical = forms => {
  if (!forms) return []

  return [...forms].sort((a, b) => {
    if (formIsActive(a)) return -1
    if (formIsActive(b)) return 1
    const nameA = a?.structure?.name?.toUpperCase()
    const nameB = b?.structure?.name?.toUpperCase()
    // eslint-disable-next-line no-nested-ternary
    return nameA < nameB ? -1 : nameA > nameB ? 1 : 0
  })
}

const FormBuilderLayout = ({
  category,
  createForm,
  deleteField,
  deleteForm,
  dragField,
  forms,
  moveFieldDown,
  moveFieldUp,
  selectedFieldId,
  selectedFormId,
  setSelectedFieldId,
  setSelectedFormId,
  shouldAllowAiPrompt,
  shouldAllowHypothesisTagging,
  updateField,
  updateForm,
}) => {
  const [openModal, setOpenModal] = useState(false)
  const [formId, setFormId] = useState()
  const [isEditingFormSettings, setIsEditingFormSettings] = useState(false)
  const [isEditingFieldSettings, setIsEditingFieldSettings] = useState(false)
  const config = useContext(ConfigContext)
  const { t } = useTranslation()

  const openModalHandler = id => {
    setOpenModal(true)
    setFormId(id)
  }

  const closeModalHandler = () => {
    setOpenModal(false)
  }

  const makeFormActive = async form => {
    let purpose = form.category
    if (purpose === 'submission') purpose = 'submit'

    await updateForm({ variables: { form: { ...form, purpose } } })
    // The server will enforce that other forms of the same category are not simultaneously active
  }

  const orderedForms = getFormsOrderedActiveFirstThenAlphabetical(forms)

  const sections = []
  forEach(orderedForms, form => {
    const isActive = formIsActive(form)

    sections.push({
      content: (
        <SectionContent
          style={{ display: 'flex', flexDirection: 'column', minHeight: '0' }}
        >
          <SectionRow
            style={{
              display: 'flex',
              flex: '1 1 0%',
              flexDirection: 'row',
              gap: '16px',
              minHeight: '0',
              width: '100%',
            }}
          >
            <div
              style={{
                flex: '1 1 100%',
                minHeight: '0',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <FormSummary
                form={form}
                isActive={isActive}
                openFormSettingsDialog={() => setIsEditingFormSettings(true)}
              />
              <FormBuilder
                addField={updateField}
                category={category}
                deleteField={deleteField}
                dragField={dragField}
                form={form}
                moveFieldDown={fieldId => moveFieldDown(form, fieldId)}
                moveFieldUp={fieldId => moveFieldUp(form, fieldId)}
                selectedFieldId={selectedFieldId}
                setSelectedFieldId={id => {
                  setSelectedFieldId(id)
                  if (id) setIsEditingFieldSettings(true)
                }}
              />
              <AddFieldButton
                iconName="Plus"
                onClick={() => {
                  setSelectedFieldId(uuid())
                  setIsEditingFieldSettings(true)
                }}
                primary
                title={t('formBuilder.Add a field')}
              />
            </div>
          </SectionRow>
        </SectionContent>
      ),
      key: `${form.id}`,
      label: (
        <TightRow>
          {form.structure.name || t('formBuilder.unnamedForm')}
          {!isActive && (
            <IconAction
              key="delete-form"
              onClick={e => {
                e.preventDefault()
                e.stopPropagation()
                openModalHandler({
                  variables: { formId: form.id },
                })
                setSelectedFormId(forms.find(f => f.id !== form.id)?.id ?? null)
              }}
            >
              <ControlIcon size={2.5}>x</ControlIcon>
            </IconAction>
          )}
        </TightRow>
      ),
    })
  })

  const selectedForm = forms?.find(f => f.id === selectedFormId) ?? {
    purpose: '',
    category,
    structure: {
      children: [],
      name: '',
      description: '',
      haspopup: 'false',
    },
  }

  const selectedField = selectedForm.structure.children.find(
    elem => elem.id === selectedFieldId,
  ) || { id: selectedFieldId, component: null }

  const reservedFieldNames = selectedForm.structure.children
    .filter(field => field.id !== selectedFieldId)
    .map(field => field.name)

  return (
    <>
      <Container
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          overflowY: 'hidden',
        }}
      >
        <WidthLimiter>
          <Heading>{t(`formBuilder.${category}.title`)}</Heading>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '0',
              overflow: 'hidden',
              flex: '1',
            }}
          >
            <AddFormButton
              isCompact
              onClick={() => {
                setSelectedFormId(null)
                setIsEditingFormSettings(true)
              }}
            >
              {t('formBuilder.Add new form')}
            </AddFormButton>
            <HiddenTabs
              defaultActiveKey={selectedFormId ?? null}
              onChange={tab => {
                setSelectedFormId(tab)
                setSelectedFieldId(null)
              }}
              sections={sections}
              shouldFillFlex
            />
          </div>
        </WidthLimiter>
      </Container>

      <FormSettingsModal
        form={selectedForm}
        isActive={formIsActive(selectedForm)}
        isOpen={isEditingFormSettings}
        makeFormActive={() => makeFormActive(selectedForm)}
        onClose={() => setIsEditingFormSettings(false)}
        onSubmit={async updatedForm => {
          const payload = {
            variables: { form: { ...updatedForm, groupId: config.groupId } },
          }

          if (selectedForm.id) await updateForm(payload)
          else await createForm(payload)
        }}
      />

      <FieldSettingsModal
        category={selectedForm.category}
        field={selectedField}
        isOpen={isEditingFieldSettings}
        onClose={() => setIsEditingFieldSettings(false)}
        onSubmit={element => {
          updateField({
            variables: {
              formId: selectedForm.id,
              element,
            },
          })
        }}
        reservedFieldNames={reservedFieldNames}
        shouldAllowAiPrompt={shouldAllowAiPrompt}
        shouldAllowHypothesisTagging={shouldAllowHypothesisTagging}
      />

      <ConfirmationModal
        closeModal={closeModalHandler}
        confirmationAction={() => deleteForm(formId)}
        confirmationButtonText={t('common.Delete')}
        isOpen={openModal}
        message={t('modals.deleteForm.Permanently delete this form')}
      />
    </>
  )
}

FormBuilderLayout.propTypes = {
  forms: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      purpose: PropTypes.string,
      structure: PropTypes.shape({
        children: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.string.isRequired,
            component: PropTypes.string,
          }).isRequired,
        ).isRequired,
      }).isRequired,
    }).isRequired,
  ),
  selectedFormId: PropTypes.string,
  selectedFieldId: PropTypes.string,
  deleteForm: PropTypes.func.isRequired,
  deleteField: PropTypes.func.isRequired,
  moveFieldDown: PropTypes.func.isRequired,
  moveFieldUp: PropTypes.func.isRequired,
  updateForm: PropTypes.func.isRequired,
  createForm: PropTypes.func.isRequired,
  updateField: PropTypes.func.isRequired,
  setSelectedFieldId: PropTypes.func.isRequired,
  setSelectedFormId: PropTypes.func.isRequired,
}

FormBuilderLayout.defaultProps = {
  forms: [],
  selectedFormId: null,
  selectedFieldId: null,
}

export default FormBuilderLayout
