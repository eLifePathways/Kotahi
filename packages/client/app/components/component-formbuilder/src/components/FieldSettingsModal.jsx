/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/prop-types */
/* eslint-disable import/namespace */

import { useState } from 'react'
import PropTypes from 'prop-types'
import { isEmpty } from 'lodash'
import { ErrorMessage, Formik } from 'formik'
import { v4 as uuid } from 'uuid'
import { useTranslation } from 'react-i18next'
import ValidatedField from '../../../component-submit/src/components/ValidatedField'
import {
  fieldOptionsByCategory,
  determineFieldAndComponent,
  combineExistingPropValuesWithDefaults,
} from './config/Elements'
import * as elements from './builderComponents'
import {
  Section,
  Subsection,
  Legend,
  ErrorMessageWrapper,
  DetailText,
} from './style'
import Modal from '../../../component-modal/src/Modal'
import { ActionButton, MediumRow, Select } from '../../../shared'

const ValidationSubFields = ({ values, setFieldValue }) => {
  const { t } = useTranslation()

  const subFields = (values.validate || []).filter(x =>
    ['minChars', 'maxChars', 'minSize'].includes(x.value),
  )

  if (!subFields.length) return null

  return (
    <Subsection>
      {subFields.map(vOption => (
        <div key={vOption.value}>
          <MediumRow>
            <Legend space>{vOption.label}</Legend>
            <ErrorMessageWrapper>
              <ErrorMessage name={`validateValue.${vOption.value}`} />
            </ErrorMessageWrapper>
          </MediumRow>
          <ValidatedField
            component={elements.TextField}
            name={`validateValue.${vOption.value}`}
            onChange={val => {
              if (isEmpty(val)) {
                setFieldValue(`validateValue.${vOption.value}`, null)
                return
              }

              setFieldValue(
                `validateValue.${vOption.value}`,
                val.target ? val.target.value : val,
              )
            }}
            required
            shouldAllowFieldSpecChanges
            validate={val => {
              const n = Math.floor(Number(val))
              if (n === Infinity || String(n) !== val || n <= 0)
                return t('formBuilder.mustBePositiveInteger')
              return null
            }}
          />
        </div>
      ))}
    </Subsection>
  )
}

const getValuesPaddedWithDefaults = (
  fieldValues,
  fieldType,
  componentOption,
) => {
  return combineExistingPropValuesWithDefaults(
    {
      ...fieldValues,
      fieldType,
      component: componentOption?.component || null,
    },
    componentOption,
  )
}

/** Remove any field properties that may have been disabled by configuration,
 * such as the Hypothesis tag and AI prompt.
 */

// Utility function to filter properties based on a key and condition
const filterProps = (props, key, shouldAllow) => {
  return Object.fromEntries(
    Object.entries(props).filter(([propKey]) => propKey !== key || shouldAllow),
  )
}

const filterOutPropsDisabledByConfig = (
  fieldOpts,
  shouldAllowHypothesisTagging,
  shouldAllowAiPrompt,
) =>
  fieldOpts.map(opt => ({
    ...opt,
    componentOptions: opt.componentOptions.map(x => {
      // Filter properties based on the conditions sequentially
      const propsAfterHypothesisTagging = filterProps(
        x.props,
        'publishingTag',
        shouldAllowHypothesisTagging,
      )

      const finalProps = filterProps(
        propsAfterHypothesisTagging,
        'aiPrompt',
        shouldAllowAiPrompt,
      )

      return { ...x, props: finalProps }
    }),
  }))

const usesReservedName = (fieldOpt, reservedFieldNames) => {
  const forcedName = fieldOpt.componentOptions[0].props.name?.forcedValue
  if (forcedName && reservedFieldNames.includes(forcedName)) return true
  return false
}

const FieldSettingsModal = ({
  category,
  field,
  onSubmit,
  shouldAllowAiPrompt,
  shouldAllowHypothesisTagging,
  isOpen,
  onClose,
  reservedFieldNames,
}) => {
  if (!isOpen) return null // To ensure Formik gets new initialValues whenever this is reopened
  if (!field) return null

  const { t } = useTranslation()

  const fieldOpts = filterOutPropsDisabledByConfig(
    fieldOptionsByCategory[category],
    shouldAllowHypothesisTagging,
    shouldAllowAiPrompt,
  )
    .filter(fieldOpt => !usesReservedName(fieldOpt, reservedFieldNames))
    .map(fieldOpt => ({
      ...fieldOpt,
      label: t(`formBuilder.fieldOpts.${fieldOpt.value}`),
      componentOptions: fieldOpt.componentOptions.map(o => ({
        ...o,
        label: t(`formBuilder.typeOptions.${o.value}`),
      })),
    }))

  const {
    fieldOption: initialFieldOption,
    componentOption: initialComponentOption,
  } = determineFieldAndComponent(field.name, field.component, category)

  const [fieldType, setFieldType] = useState(initialFieldOption?.fieldType)

  const [componentType, setComponentType] = useState(
    initialComponentOption?.component,
  )

  const fieldOption = fieldOpts.find(x => x.value === fieldType)

  const componentOption = fieldOption?.componentOptions.find(
    x => x.value === componentType,
  )

  const initialValues = getValuesPaddedWithDefaults(
    field,
    fieldType,
    componentOption,
  )

  const editableProperties = Object.entries(
    componentOption?.props || {},
    /* eslint-disable-next-line no-unused-vars */
  ).filter(([key, value]) => value.component !== 'Hidden')

  // New helper to avoid no-nested-ternary
  const buildValidate = (key, value) => {
    if (key === 'name') {
      return val => {
        if (reservedFieldNames.includes(val)) return t('formBuilder.nameInUse')
        if (value.props?.validate) return value.props.validate(val)
        return null
      }
    }

    if (key === 'options') {
      return opts => {
        const list = Array.isArray(opts) ? opts : []
        const hasHalf = list.some(o => !!o?.label !== !!o?.value)
        return hasHalf ? t('formBuilder.errorIncompleteOption') : undefined
      }
    }

    return value.props?.validate
  }

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={(values, actions) => {
        onSubmit(
          prepareForSubmit(
            values,
            componentOption.props,
            fieldOption.isReadOnly || values.isReadOnly,
            fieldOption.isS3Component,
          ),
        )
        actions.resetForm()
        onClose()
      }}
      validateOnBlur
    >
      {({ errors, handleSubmit, setFieldValue, values }) => {
        const populateDefaultValues = (newFieldType, newComponentType) => {
          const newFieldOption = fieldOpts.find(
            opt => opt.fieldType === newFieldType,
          )

          const newComponentOption =
            newFieldOption.componentOptions.find(
              x => x.component === newComponentType,
            ) || newFieldOption.componentOptions[0]

          const newValues = getValuesPaddedWithDefaults(
            values,
            newFieldOption.fieldType,
            newComponentOption,
          )

          newValues.fieldType = newFieldOption.fieldType
          newValues.component = newComponentOption.component

          Object.entries(newValues).forEach(([key, value]) =>
            setFieldValue(key, value),
          )
        }

        const formIsValid = !Object.keys(errors).length

        return (
          <form onSubmit={handleSubmit}>
            <Modal
              contentStyles={{ minWidth: '800px' }}
              isOpen={isOpen}
              leftActions={
                !formIsValid && (
                  <ErrorMessageWrapper>
                    {t('formBuilder.correctBeforeSaving')}
                  </ErrorMessageWrapper>
                )
              }
              onClose={onClose}
              rightActions={
                <>
                  <ActionButton onClick={handleSubmit} primary type="submit">
                    {t('common.Save')}
                  </ActionButton>
                  <ActionButton onClick={onClose}>
                    {t('common.Cancel')}
                  </ActionButton>
                </>
              }
              shouldCloseOnOverlayClick={false}
              title={t('formBuilder.Field Properties')}
            >
              <Section>
                <Legend space>{t('formBuilder.Field type')}</Legend>
                <ValidatedField
                  component={Select}
                  data-testid="fieldType"
                  hasGroupedOptions
                  name="fieldType"
                  onChange={option => {
                    const { component } = fieldOpts.find(
                      opt => opt.value === option.value,
                    ).componentOptions[0]

                    setFieldType(option.value)
                    setFieldValue('fieldType', option.value)
                    setComponentType(component)
                    setFieldValue('component', component)
                    populateDefaultValues(option.value, componentType)
                  }}
                  options={[
                    {
                      label: t('formBuilder.genericFields'),
                      options: fieldOpts.filter(x => x.isCustom),
                    },
                    {
                      label: t('formBuilder.specialFields'),
                      options: fieldOpts.filter(x => !x.isCustom),
                    },
                  ]}
                  required
                />
              </Section>
              {fieldOption && fieldOption.componentOptions.length > 1 && (
                <Section>
                  <Legend space>{t('formBuilder.dataType')}</Legend>
                  <ValidatedField
                    component={Select}
                    data-testid="dataType"
                    name="component"
                    onChange={option => {
                      setComponentType(option.value)
                      setFieldValue('component', option.value)
                      populateDefaultValues(fieldType, option.value)
                    }}
                    options={fieldOption.componentOptions}
                    required
                  />
                </Section>
              )}
              {editableProperties
                /* eslint-disable-next-line no-unused-vars */
                .filter(([compKey, compValue]) => {
                  return compValue?.props?.toggleShow
                    ? compValue.props.toggleShow(values)
                    : true
                })
                .map(([key, value]) => {
                  return (
                    <>
                      <Section key={key}>
                        {(value.showFieldTitle === false ||
                          value.showFieldTitle === undefined ||
                          value.title) && (
                          <MediumRow>
                            <Legend space>
                              {value.showFieldTitle && value.title
                                ? value.title
                                : t(
                                    `formBuilder.Field ${key}`,
                                    t('formBuilder.fallbackFieldLabel', {
                                      name: key,
                                    }),
                                  )}
                            </Legend>
                            <ErrorMessageWrapper>
                              <ErrorMessage name={key} />
                            </ErrorMessageWrapper>
                          </MediumRow>
                        )}

                        <ValidatedField
                          component={elements[value.component]}
                          data-testid={key}
                          name={key}
                          onChange={val => {
                            if (isEmpty(val)) {
                              setFieldValue(key, null)
                              return
                            }

                            setFieldValue(
                              key,
                              val.target ? val.target.value : val,
                            )
                          }}
                          {...{
                            ...value.props,
                            label: undefined,
                            description: undefined,
                          }}
                          options={value.props?.options?.map(o => ({
                            ...o,
                            label: t(`fields.${key}.${o.value}`),
                          }))}
                          shouldAllowFieldSpecChanges
                          validate={buildValidate(key, value)} // Use helper
                        />
                        {value.props?.description && (
                          <DetailText>{value.props.description}</DetailText>
                        )}
                      </Section>
                      {key === 'validate' && (
                        <ValidationSubFields
                          setFieldValue={setFieldValue}
                          values={values}
                        />
                      )}
                    </>
                  )
                })}
              {!editableProperties.some(([key]) => key === 'name') &&
                values.name && (
                  <Section key="name">
                    <Legend>{t('formBuilder.Field name')}</Legend> {values.name}
                  </Section>
                )}
            </Modal>
          </form>
        )
      }}
    </Formik>
  )
}

FieldSettingsModal.propTypes = {
  category: PropTypes.oneOf(['submission', 'review', 'decision']).isRequired,
  onSubmit: PropTypes.func.isRequired,
}

/** Because a user can switch between field/component types in the form, and it
 * doesn't immediately delete unused properties, we need to scrub the data before
 * it is submitted. This removes all but the relevant properties for the chosen
 * field/component, and removes any unsupported options. It also adds a uuid to
 * every item in an array property.
 */
const prepareForSubmit = (values, fieldProps, isReadOnly, isS3Component) => {
  const cleanedValues = Object.fromEntries(
    Object.entries(fieldProps)
      .map(([propName, prop]) => {
        let value = values[propName]

        if (!value) return null

        const props = prop?.props || {} // This is the preset properties for the given form property. E.g. the "Validation options" property has preset options ("required", "minChars" etc) and isMulti=true

        if (props.options) {
          if (props.isMulti) {
            value = value.filter(x =>
              props.options.some(opt => opt.value === x.value),
            )
          } else if (
            typeof value !== 'object' &&
            !props.options.some(opt => opt.value === value)
          ) {
            return null
          } else if (typeof value === 'object') {
            value = value.value
          }
        }

        if (Array.isArray(value))
          value = value.map(x => ({
            id: uuid(),
            ...x,
            ...(x.value && typeof x.value === 'string'
              ? { value: x.value.trim() }
              : {}),
          }))

        return [propName, value]
      })
      .filter(Boolean),
  )

  cleanedValues.component = values.component
  cleanedValues.isReadOnly = isReadOnly
  cleanedValues.isS3Component = isS3Component
  cleanedValues.validateValue = Object.keys(values.validateValue || {}).length
    ? values.validateValue
    : null

  return cleanedValues
}

export default FieldSettingsModal
