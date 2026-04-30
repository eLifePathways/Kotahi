import { useTranslation } from 'react-i18next'
import { Select, TextField, ValidatedFieldFormik } from '../../../../pubsweet'
import { Legend, Section } from '../style'

const ValidationMenu = input => {
  const { t } = useTranslation()
  return (
    // const validations = useState([])

    <>
      <Select
        {...input}
        noOptionsMessage={() => t('common.noOption')}
        placeholder={t('formBuilder.validateInputPlaceholder')}
        // onChange={select => input.onChange(select.map(s => s.value))}
        // onChange={select => setValidations(select.map(s => s.value))}
      />

      {((Array.isArray(input.value) && input.value) || []).map(validation => {
        if (validation.value !== 'required') {
          return (
            <Section key={validation.value}>
              <Legend space>
                {t(`fields.validate.labels.${validation.value}`)}
              </Legend>
              <ValidatedFieldFormik
                component={TextField}
                name={`validateValue.${validation.value}`}
              />
            </Section>
          )
        }

        return null
      })}
    </>
  )
}

export default ValidationMenu
// export default compose(
//   withState('selectelement', 'changeSelect', undefined),
//   withHandlers({
//     onSelectElement: ({ changeSelect }) => value => changeSelect(() => value),
//   }),
// )(ValidationMenu)
