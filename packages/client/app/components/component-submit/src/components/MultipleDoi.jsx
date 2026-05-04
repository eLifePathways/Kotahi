/* eslint-disable react/prop-types */

import styled from 'styled-components'
import PropTypes from 'prop-types'
import { th } from '@coko/client'
import { v4 as uuid } from 'uuid'
import { useTranslation } from 'react-i18next'

import { DeleteControl, TextInput } from '../../../shared'
import { Button } from '../../../pubsweet'
import { fields, validateDoiField } from '../../../../shared/doiFieldDefinition'

import theme from '../../../../theme'

const Doi = styled.div`
  align-items: top;
  display: grid;
  grid-gap: 36px;
  grid-template-columns: 1fr 1fr;
  margin-bottom: ${theme.spacing.f};
  margin-top: ${theme.spacing.e};
  position: relative;
  width: 600px;

  @media only screen and (max-width: 700px) {
    width: 400px;
  }

  & + & {
    margin-top: 10px;
  }
`

const DoiContainer = styled.div`
  display: flex;
`

const InvalidLabel = styled.div`
  color: ${th('colorError')};
  font-size: 80%;
`

const StyledDeleteControl = styled(DeleteControl)`
  margin: 16px 10px 0 1em;
`

const localizeFields = (origFields, t) => {
  let clonedFieds = JSON.parse(JSON.stringify(origFields))

  clonedFieds = clonedFieds.map(field => {
    const newField = { ...field }
    newField.label = t(`doisInput.${field.name}.label`)
    newField.placeholder = t(`doisInput.${field.name}.placeholder`)
    return newField
  })

  return clonedFieds
}

const DoisInput = ({ onChange, value, overrideButtonLabel = undefined }) => {
  const { t } = useTranslation()
  const cleanedVal = Array.isArray(value) ? value : []
  const localizedFields = localizeFields(fields, t)

  if (value && !Array.isArray(value))
    console.error('Illegal DoisInput value:', value)
  return (
    <div>
      {cleanedVal.map((doi, index) => (
        <DoiContainer key={doi.id}>
          <Doi>
            {localizedFields.map((f, i) => {
              const invalidity =
                fields[i].validate && fields[i].validate(doi[f.name])

              return (
                <div key={f.name}>
                  <TextInput
                    label={f.label}
                    onChange={v => {
                      const newVal = [...cleanedVal]
                      newVal[index][f.name] = v.target.value
                      onChange(newVal)
                    }}
                    placeholder={f.placeholder}
                    value={doi[f.name]}
                  />
                  {invalidity && (
                    <InvalidLabel>{t('decisionPage.invalidDoi')}</InvalidLabel>
                  )}
                </div>
              )
            })}
          </Doi>
          <StyledDeleteControl
            onClick={() => {
              onChange(cleanedVal.filter((_, i) => i !== index))
            }}
            tooltip={t('decisionPage.Delete this doi')}
          />
        </DoiContainer>
      ))}
      <Button
        disabled={validateDoiField(cleanedVal)}
        onClick={() => {
          const newVal = [
            ...cleanedVal,
            {
              doi: '',
              id: uuid(),
            },
          ]

          onChange(newVal)
        }}
        plain
        type="button"
      >
        {!overrideButtonLabel
          ? t('decisionPage.Add another doi')
          : overrideButtonLabel}
      </Button>
    </div>
  )
}

DoisInput.propTypes = {
  onChange: PropTypes.func.isRequired,
  /** value should be an array of objects or null, but we also currently permit empty string */
  value: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.shape({
        doi: PropTypes.string.isRequired,
      }).isRequired,
    ),
    PropTypes.oneOf(['']),
  ]),
}

DoisInput.defaultProps = {
  value: null,
}

export default DoisInput
