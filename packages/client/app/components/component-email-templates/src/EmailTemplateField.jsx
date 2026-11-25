/* eslint-disable react/prop-types */

import { camelCase } from 'lodash'
import { useTranslation } from 'react-i18next'
import { required } from '../../xpub-validators/src'
import { ValidatedFieldFormik } from '../../pubsweet'

const makePropsFromFieldType = ({
  item,
  onDataChanged,
  setFieldValue,
  variables,
}) => {
  const propsByFieldType = {
    'text-input': {
      onChange: input => {
        const value = input?.target?.value ?? input?.value ?? input
        setFieldValue(item.name, value, false)
      },
    },
    checkbox: {
      handleChange: value => {
        const { checked } = value.target
        setFieldValue(item.name, checked)
      },
    },
    SimpleWaxEditor: {
      onChange: value => {
        setFieldValue(item.name, value)
        onDataChanged(item.name, value)
      },
      handlebarsVariables: variables,
    },
  }

  return propsByFieldType[item.type] || {}
}

const EmailTemplateField = ({
  item,
  currentValues,
  setTouched,
  setFieldValue,
  onDataChanged,
  templateVariables,
}) => {
  const { t } = useTranslation()

  const fieldProps = makePropsFromFieldType({
    item,
    onDataChanged,
    setFieldValue,
    variables: templateVariables,
  })

  const labelFontSize =
    item.label === 'ccEditorsCheckboxDescription' ? '14px' : '10px'

  return (
    <>
      <label htmlFor={item.name} style={{ fontSize: labelFontSize }}>
        {t(`emailTemplate.${camelCase(item.label)}`)}
      </label>
      <ValidatedFieldFormik
        checked={currentValues?.ccEditors}
        component={item.component}
        id={item.name}
        name={item.name}
        setTouched={setTouched}
        style={{ ...(item?.itemStyle || { width: '100%' }) }}
        validate={item.isRequired ? required : null}
        {...item.otherProps}
        {...fieldProps}
      />
    </>
  )
}

export default EmailTemplateField
