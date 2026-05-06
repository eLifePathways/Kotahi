/* eslint-disable react/prop-types */

import { useTranslation } from 'react-i18next'

import { required } from '../../../xpub-validators/src'
import { ValidatedFieldFormik } from '../../../pubsweet'
import { CompactSection, LayoutMainHeading } from '../style'

import { inputComponents } from '../FormSettings'

import { FilesUpload } from '../../../shared'

const FileInputComponent = ({ entityId, ...restProps }) => {
  return (
    <FilesUpload
      acceptMultiple={false}
      fieldName="logo"
      fileType="cms"
      manuscriptId={entityId}
      mimeTypesToAccept="image/*"
      {...restProps}
    />
  )
}

const brandLogoInput = {
  component: FileInputComponent,
  label: 'Brand logo',
  name: 'logoId',
  type: 'file',
}

const brandColorInput = [
  {
    component: inputComponents.ColorInput,
    label: 'Primary Color',
    name: 'primaryColor',
    type: 'color',
    value: '#e66465',
  },

  {
    component: inputComponents.ColorInput,
    label: 'Secondary Color',
    name: 'secondaryColor',
    type: 'color',
    value: '#e66465',
  },
]

const Branding = ({
  formikProps,
  cmsLayout,
  createFile,
  deleteFile,
  triggerAutoSave,
}) => {
  const onDataChanged = (name, value) => {
    formikProps.setFieldValue(name, value)
    const data = {}
    data[name] = value === undefined ? null : value
    triggerAutoSave(data)
  }

  const { t } = useTranslation()

  const localizeFields = fields => {
    return fields.map(field => {
      if (field.label.length) {
        const newField = field
        newField.label = t(`cmsPage.layout.fields.${newField.name}`)
        return newField
      }

      return field
    })
  }

  return (
    <>
      <CompactSection key={brandLogoInput.name}>
        <LayoutMainHeading>{t('cmsPage.layout.Brand logo')}</LayoutMainHeading>
        <ValidatedFieldFormik
          component={brandLogoInput.component}
          confirmBeforeDelete
          createFile={createFile}
          deleteFile={deleteFile}
          entityId={cmsLayout.id}
          name={brandLogoInput.name}
          onChange={value => onDataChanged(brandLogoInput.name, value[0])}
          setFieldValue={formikProps.setFieldValue}
          setTouched={formikProps.setTouched}
          type={brandLogoInput.type}
          validate={brandLogoInput.isRequired ? required : null}
          {...brandLogoInput.otherProps}
        />
      </CompactSection>

      <LayoutMainHeading>{t('cmsPage.layout.Brand Color')}</LayoutMainHeading>
      {localizeFields(brandColorInput).map(item => {
        return (
          <CompactSection key={item.name}>
            <p style={{ fontSize: '14px' }}>{item.label}</p>
            <ValidatedFieldFormik
              component={item.component}
              name={item.name}
              onChange={value =>
                onDataChanged(item.name, value.target?.value ?? value)
              }
              setFieldValue={formikProps.setFieldValue}
              setTouched={formikProps.setTouched}
              type={item.type}
              validate={item.isRequired ? required : null}
              {...item.otherProps}
            />
          </CompactSection>
        )
      })}
    </>
  )
}

export default Branding
