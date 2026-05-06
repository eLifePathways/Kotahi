/* eslint-disable react/prop-types */

/* eslint-disable jsx-a11y/no-autofocus */

import { useState } from 'react'
import PropTypes from 'prop-types'
import { omitBy } from 'lodash'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { th, grid } from '@coko/client'
import { Formik } from 'formik'
import { TextField } from '../../../pubsweet'
import { AbstractField, RadioBox } from './builderComponents'
import { ActionButton } from '../../../shared'
import ValidatedField from '../../../component-submit/src/components/ValidatedField'
import Modal from '../../../component-modal/src/Modal'
import { ConfirmationModal } from '../../../component-modal/src/ConfirmationModal'

const InvalidWarning = styled.div`
  color: ${th('colorError')};
`

export const Legend = styled.div`
  font-size: ${th('fontSizeBase')};
  font-weight: 600;
  margin-bottom: ${({ space, theme }) => space && theme.gridUnit};
`

export const Section = styled.div`
  margin: ${grid(4)} 0;

  &:first-child {
    margin-top: 0;
  }
`

const MakeActiveButton = styled(ActionButton)`
  float: right;
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};
`

const prepareForSubmit = (form, values) => {
  const cleanedValues = omitBy(values, value => value === '')

  /* eslint-disable-next-line no-unused-vars */
  const { created, updated, ...rest } = cleanedValues

  const updatedForm = {
    id: form.id,
    purpose: form.purpose,
    category: form.category,
    structure: rest,
  }

  return updatedForm
}

const FormSettingsModal = ({
  form,
  isActive,
  isOpen = false,
  makeFormActive,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation()
  const [isConfirmingMakeActive, setIsConfirmingMakeActive] = useState(false)
  if (!isOpen) return null // To ensure Formik gets new initialValues whenever this is reopened

  return (
    <Formik
      initialValues={{
        description: '',
        popupdescription: '',
        ...form.structure,
      }}
      key={form.id}
      onSubmit={(values, actions) => {
        onSubmit(prepareForSubmit(form, values))
        actions.resetForm()
        onClose()
      }}
      validate={values => {
        if (!values.name) return t('formBuilder.Please give the form a name.')
        return null
      }}
    >
      {({ handleSubmit, setFieldValue, values, errors }) => (
        <form onSubmit={handleSubmit}>
          <Modal
            contentStyles={{ minWidth: '800px' }}
            isOpen={isOpen}
            leftActions={
              !!Object.keys(errors).length && (
                <InvalidWarning>
                  {t('formBuilder.Give the form a title')}
                </InvalidWarning>
              )
            }
            onClose={onClose}
            rightActions={
              <>
                <ActionButton onClick={handleSubmit} primary type="submit">
                  {t(
                    form.id
                      ? 'formBuilder.Update Form'
                      : 'formBuilder.Create Form',
                  )}
                </ActionButton>
                <ActionButton onClick={onClose}>
                  {t('common.Cancel')}
                </ActionButton>
              </>
            }
            shouldCloseOnOverlayClick={false}
            title={
              form.id
                ? `${t('formBuilder.Update Form')}: ${form.structure.name}`
                : t('formBuilder.Create Form')
            }
          >
            {!isActive && form.id && (
              <MakeActiveButton
                isCompact
                onClick={() => setIsConfirmingMakeActive(true)}
              >
                {t('formBuilder.Make this the active form')}
              </MakeActiveButton>
            )}

            <Section id="form.name" key="form.name">
              <Legend>{t('formBuilder.Form title')}</Legend>
              <ValidatedField
                autoFocus={!form.id}
                component={TextField}
                name="name"
                required
              />
            </Section>
            <Section id="form.description" key="form.description">
              <Legend>{t('formBuilder.Description')}</Legend>
              <ValidatedField
                component={AbstractField}
                name="description"
                onChange={val => {
                  setFieldValue('description', val)
                }}
              />
            </Section>
            <Section id="form.submitpopup" key="form.submitpopup">
              <Legend>{t('formBuilder.submitConfirmPage')}</Legend>
              <ValidatedField
                component={RadioBox}
                inline
                name="haspopup"
                onChange={input => {
                  setFieldValue('haspopup', input)
                }}
                options={[
                  {
                    label: t('common.Yes'),
                    value: 'true',
                  },
                  {
                    label: t('common.No'),
                    value: 'false',
                  },
                ]}
              />
            </Section>
            {values.haspopup === 'true' && [
              <Section id="popup.title" key="popup.title">
                <Legend>{t('formBuilder.Popup Title')}</Legend>
                <ValidatedField component={TextField} name="popuptitle" />
              </Section>,
              <Section id="popup.description" key="popup.description">
                <Legend>{t('formBuilder.Description')}</Legend>
                <ValidatedField
                  component={AbstractField}
                  name="popupdescription"
                  onChange={val => {
                    setFieldValue('popupdescription', val)
                  }}
                />
              </Section>,
            ]}
            <ConfirmationModal
              closeModal={() => setIsConfirmingMakeActive(false)}
              confirmationAction={makeFormActive}
              confirmationButtonText={t('common.Confirm')}
              isOpen={isConfirmingMakeActive}
              message={t('formBuilder.confirmMakeActiveForm', {
                name: form.category,
              })}
            />
          </Modal>
        </form>
      )}
    </Formik>
  )
}

FormSettingsModal.propTypes = {
  form: PropTypes.shape({
    purpose: PropTypes.string.isRequired,
    id: PropTypes.string,
    structure: PropTypes.shape({
      name: PropTypes.string,
      description: PropTypes.string,
      haspopup: PropTypes.string.isRequired,
      popuptitle: PropTypes.string,
    }),
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
}

export default FormSettingsModal
