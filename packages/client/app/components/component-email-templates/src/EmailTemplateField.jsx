/* eslint-disable react/prop-types */

import { required } from 'xpub-validators'
import { camelCase } from 'lodash'
import { useTranslation } from 'react-i18next'
import { ValidatedFieldFormik } from '../../pubsweet'
import { handlebars } from './handlebarsAutocomplete/constants'

const makePropsFromFieldType = ({ item, onDataChanged, setFieldValue }) => {
  const { autocompleteConfig } = handlebars.stored

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
      autocompleteConfig, // for config
      useHandlebarsAutocomplete: true, // for layout
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
}) => {
  const { t } = useTranslation()

  const fieldProps = makePropsFromFieldType({
    item,
    onDataChanged,
    setFieldValue,
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
