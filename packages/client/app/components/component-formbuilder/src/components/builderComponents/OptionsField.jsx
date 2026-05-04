/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */

import { useState, useCallback } from 'react'
import styled from 'styled-components'
import { FieldArray } from 'formik'
import { th, grid } from '@coko/client'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'
import { useDropzone } from 'react-dropzone'
import { TextField, ValidatedFieldFormik, Button } from '../../../../pubsweet'
import { DeleteControl } from '../../../../shared'
import { color } from '../../../../../theme'

const Inline = styled.div`
  display: inline-block;
  margin-right: 10px;
  position: relative;
  vertical-align: top;
`

const InlineDefaultValue = styled.div`
  display: inline-flex;
  flex-direction: column;
  margin-right: 10px;
  position: relative;
  vertical-align: top;

  span {
    display: block;
    font-size: 14px;
    line-height: 16px;
    margin-bottom: calc(8px);
  }

  input {
    margin-top: calc(12px);
  }
`

const UnbulletedList = styled.ul`
  list-style-type: none;
  margin-bottom: 10px;
  padding-left: 0;
`

const LiControlOptions = styled.li`
  button,
  div {
    display: inline-block;
    margin-left: 10px;
  }
`

const ErrorMessageWrapper = styled.span`
  color: ${color.error.base};
  display: block;
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};
  margin-left: 10px;
`

const InlineColorPicker = styled(Inline)`
  & > div {
    font-size: ${th('fontSizeBaseSmall')};
    line-height: ${th('lineHeightBaseSmall')};
    margin-bottom: ${grid(1)};
  }

  & input {
    height: ${grid(6)};
    width: ${grid(9)};
  }
`

const OptionsRow = styled.div`
  display: flex;
`

const StyledDeleteControl = styled(DeleteControl)`
  top: 0;
`

const defaultLabelColor = '#000000'

const LabelInput = props => (
  <TextField
    label={i18next.t('formBuilder.Label to display')}
    placeholder={i18next.t('formBuilder.Enter label')}
    {...props}
  />
)

const ValueInput = props => (
  <TextField
    label={i18next.t('formBuilder.Internal name')}
    placeholder={i18next.t('formBuilder.Enter name')}
    {...props}
  />
)

const ColorPicker = ({ name, value, onChange }) => {
  return (
    <input
      name={name}
      onChange={onChange}
      type="color"
      value={value || defaultLabelColor}
    />
  )
}

const FileReaderComponent = ({ push, setFieldValue }) => {
  const [error, setError] = useState(null)
  const { t } = useTranslation()

  const onDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0]

    if (file) {
      if (file.type !== 'application/json') {
        setError('Please select a valid JSON file.')
        return
      }

      const reader = new FileReader()

      reader.onload = event => {
        const content = event.target.result

        try {
          const options = JSON.parse(content)
          setFieldValue('options', [])
          options.forEach(option => {
            const value = Object.keys(option)[0]
            const label = option[value]
            push({ value, label })
          })

          setError(null)
          /* eslint-disable-next-line */
        } catch (e) {
          setError('Please select a valid JSON file.')
        }
      }

      reader.readAsText(file)
    }
  }, [])

  const { getRootProps, getInputProps, open } = useDropzone({
    accept: ['application/json'], // Browser filtering
    onDrop,
    noClick: true,
    noKeyboard: true,
    multiple: false,
  })

  return (
    <div>
      <div className="container">
        <div {...getRootProps({ className: 'dropzone' })}>
          <input {...getInputProps()} />
          <Button onClick={open} plain type="button">
            {t('formBuilder.Add options from a JSON file')}
          </Button>
        </div>
      </div>
      {error && <ErrorMessageWrapper>{error}</ErrorMessageWrapper>}
    </div>
  )
}

const RenderOptions = ({ form: { values, setFieldValue }, push, remove }) => {
  const hasNewOption = values.options?.some(
    opt => opt === undefined || !opt.label || !opt.value,
  )

  const { t } = useTranslation()

  return (
    <UnbulletedList>
      {(values.options || []).map((option, index) => (
        // a newly-added option doesn't have an id yet, so we fall back on index
        <li key={option?.id ?? index}>
          <OptionsRow>
            <InlineDefaultValue>
              <span>{t('formBuilder.Default Value')}</span>
              <input
                checked={option?.defaultValue || false}
                name={`defaultValue-${index}`}
                onChange={() => {
                  values.options.forEach((el, i) => {
                    if (el?.defaultValue === 1)
                      setFieldValue(`options.${i}.defaultValue`, 0)
                  })

                  if (option?.defaultValue === 0) {
                    setFieldValue(`options.${index}.defaultValue`, 1)
                  } else {
                    setFieldValue(`options.${index}.defaultValue`, 0)
                  }
                }}
                type="checkbox"
              />
            </InlineDefaultValue>
            <Inline>
              <ValidatedFieldFormik
                component={LabelInput}
                name={`options.${index}.label`}
                required
              />
            </Inline>
            <Inline>
              <ValidatedFieldFormik
                component={ValueInput}
                name={`options.${index}.value`}
                required
                validate={
                  null /* TODO Get the following validation working:
                  value =>
                  !/^[\w :./,()-<>=_]+$/.test(value) &&
                  'Internal name must not include special characters such as apostrophe or quotes'
                */
                }
              />
            </Inline>
            {values.fieldType !== 'select' && (
              <>
                <Inline>
                  <input
                    checked={
                      option?.labelColor &&
                      option?.labelColor !== defaultLabelColor
                    }
                    disabled={
                      !option?.labelColor ||
                      option?.labelColor === defaultLabelColor
                    }
                    onChange={e => {
                      setFieldValue(
                        `options.${index}.labelColor`,
                        e.target.checked
                          ? option?.labelColor
                          : defaultLabelColor,
                      )
                    }}
                    type="checkbox"
                  />
                </Inline>
                <InlineColorPicker>
                  <div>{t('formBuilder.Color label')}</div>
                  <ValidatedFieldFormik
                    component={ColorPicker}
                    name={`options.${index}.labelColor`}
                  />
                </InlineColorPicker>
              </>
            )}
            <StyledDeleteControl
              onClick={() => remove(index)}
              tooltip={t('formBuilder.Delete this option')}
            />
          </OptionsRow>
        </li>
      ))}
      <LiControlOptions>
        <Button
          disabled={hasNewOption}
          onClick={() => push()}
          plain
          type="button"
        >
          {t('formBuilder.Add another option')}
        </Button>
        <FileReaderComponent push={push} setFieldValue={setFieldValue} />
      </LiControlOptions>
    </UnbulletedList>
  )
}

const OptionsField = () => (
  <FieldArray component={RenderOptions} name="options" />
)

export default OptionsField
