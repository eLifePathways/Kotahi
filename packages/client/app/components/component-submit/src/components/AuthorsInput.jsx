/* eslint-disable react-hooks/exhaustive-deps */

import Creatable from 'react-select/async-creatable'

import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { th, grid } from '@coko/client'
import PropTypes from 'prop-types'
import { v4 as uuid } from 'uuid'
import { useTranslation } from 'react-i18next'
import { PlusCircle } from 'react-feather'
import { isEmpty } from 'lodash'
import { Button } from '../../../pubsweet'
import { DeleteControl, TextInput } from '../../../shared'
import {
  getAuthorFields,
  validateAuthor,
  validateAuthors,
} from '../../../../shared/authorsFieldDefinitions'

import theme, { color } from '../../../../theme'
import { FlexRow } from '../../../../globals'
import useAuthorsFieldQueries from './hooks/useAuthorsInputQueries'

// #region styled
const StyledButton = styled(Button)`
  cursor: pointer;
  display: flex;
  gap: ${grid(1)};
  margin-bottom: ${grid(2)};

  &[disabled] {
    cursor: not-allowed;
  }
`

const Wrapper = styled.div`
  > div:not(:last-child) {
    margin-bottom: ${grid(2)};
  }
`

const AuthorContainer = styled.div`
  border: 1px solid ${color.gray80};
  border-radius: ${theme.borderRadius};
  display: flex;
  ${({ fullWidth }) => (fullWidth ? 'width: 100%' : 'max-width: 1000px')};
  padding: ${grid(2)};
`

const Author = styled.div`
  display: grid;
  grid-gap: ${grid(2)} ${grid(4)};
  grid-template-columns: repeat(2, 1fr);
  padding: ${grid(1)};
  width: 100%;
`

const StyledSelect = styled(Creatable)`
  border: 1px solid #dedede;
  border-radius: ${th('borderRadius')};
  font-size: ${th('fontSizeBaseSmall')};
  line-height: 31px; /* hack, need to fix across components */

  .react-select__control {
    background-color: ${th('color.gray99')};
    border-radius: ${th('borderRadius')};
  }

  .react-select__control--is-focused {
    border-color: ${th('colorPrimary')};
    box-shadow: 0 0 0 0 ${th('colorPrimary')};
  }
`

const StyledDeleteControl = styled(DeleteControl)`
  background-color: ${th('colorBackground')};
  height: ${grid(3)};
  margin: 0;
  padding-left: ${grid(1)};
  width: ${grid(3)};

  &:hover {
    background-color: ${th('colorBackground')};
  }
`

const FieldLabel = styled(FlexRow)`
  color: ${props =>
    props.$valid ? props.theme.colorText : props.theme.colorError};
  display: flex;
  font-size: ${th('fontSizeBaseSmall')};
  justify-content: space-between;
  padding-inline: ${grid(0.25)};
`
// #endregion styled

const localizeFields = (fields, t) =>
  fields.map(field => ({
    ...field,
    label: t(`authorsInput.${field.name}.label`),
    placeholder: t(`authorsInput.${field.name}.placeholder`),
  }))

/**
 * This component returns a customised author's input field, based on props.
 * To customise the `AuthorsInput` component, provide the necessary field in the `getAuthorsField` method, and pass the required prop to `AuthorsInput`.
 * @param {object} props contains flags and values used to customise the field. See props for more details.
 * @returns `AuthorsInput` component
 */
const AuthorsInput = ({
  fullWidth, // should the component be the full width of the parent
  onChange,
  requireEmail, // is the email address required
  value,
  overrideButtonLabel,
  rorMenuPlacement, // ROR affiliation dropdown position
  showMiddleName, // should the middle name field be used
  showOrcidId, // should the ORCID field be used
  isRoRMulti = false, // should be multi-select
}) => {
  const [validatePerField, setValidatePerField] = useState([])
  const { t } = useTranslation()
  const { validationOrcid, searchRor } = useAuthorsFieldQueries()

  const filterOptions = response => {
    return response.data.searchRor.map(ror => ({
      label: ror.name,
      value: ror.id,
    }))
  }

  const cleanedVal = Array.isArray(value) ? value : [] // We're getting momentary mismatches between field and value, so this can momentarily receive e.g. a string from another field, before a rerender corrects it. Not sure why yet.

  /**
   * add more definitions here as needed, and define them in `getAuthorFields`.
   * These are used to customise the `authorFields`. See function below for more details.
   */
  const authorFieldOptions = {
    requireEmail,
    showMiddleName,
    showOrcidId,
    validationOrcid,
  }

  const authorFields = getAuthorFields(authorFieldOptions)
  const localizedFields = localizeFields(authorFields, t)

  if (value && !Array.isArray(value))
    console.error('Illegal AuthorsInput value:', value)

  useEffect(() => {
    const validate = async () => {
      const validationPerField = await Promise.all(
        cleanedVal.map(async author =>
          validateAuthor(author, { validationOrcid, requireEmail }),
        ),
      )

      setValidatePerField([
        ...validationPerField.map(field => {
          const obj = {}
          field.forEach(f => {
            const [key] = Object.keys(f)
            obj[key] = f[key]
          })
          return obj
        }),
      ])
    }

    validate()
  }, [JSON.stringify(cleanedVal)])

  return (
    <>
      <StyledButton
        disabled={validateAuthors(cleanedVal, authorFieldOptions)}
        onClick={() => {
          const newVal = [
            ...cleanedVal,
            {
              firstName: '',
              middleName: '',
              lastName: '',
              email: '',
              id: uuid(),
              ror: [],
              orcid: '',
            },
          ]

          onChange(newVal)
        }}
        plain
        title={
          validateAuthors(cleanedVal, authorFieldOptions)
            ? 'Correct or delete "persons" with invalid fields, then add a new one!'
            : 'Add a new person'
        }
        type="button"
      >
        <PlusCircle />
        {!overrideButtonLabel
          ? t('decisionPage.Add another person')
          : overrideButtonLabel}
      </StyledButton>
      <Wrapper>
        {cleanedVal.map((author, index) => (
          <AuthorContainer fullWidth={fullWidth} key={author.id}>
            <Author>
              {localizedFields.map(f => {
                if (!f.label) return null

                const invalidity = validatePerField[index]
                  ? validatePerField[index][f.name]
                  : false

                const handleChange = v => {
                  const newVal = [...cleanedVal]
                  newVal[index][f.name] = v?.target?.value ?? v
                  onChange(newVal)
                }

                // eslint-disable-next-line no-nested-ternary
                const val = isRoRMulti
                  ? isEmpty(author[f.name])
                    ? []
                    : author[f.name]
                  : author[f.name]

                return (
                  <div key={f.name}>
                    <FieldLabel $valid={!invalidity}>
                      <div>{f.label}</div>
                      <div>{invalidity && <>{invalidity}!</>}</div>
                    </FieldLabel>
                    {f.name === 'ror' ? (
                      <StyledSelect
                        classNamePrefix="react-select"
                        createOptionPosition="first"
                        isClearable
                        isMulti={isRoRMulti}
                        loadOptions={searchRor(filterOptions)}
                        menuPlacement={rorMenuPlacement || 'auto'}
                        menuPortalTarget={document.querySelector('body')}
                        onChange={handleChange}
                        placeholder={f.placeholder}
                        value={val}
                      />
                    ) : (
                      <TextInput
                        label={f.label}
                        onChange={handleChange}
                        placeholder={f.placeholder}
                        style={{
                          outline: invalidity ? '1px solid #f20' : 'none',
                        }}
                        value={author[f.name]}
                      />
                    )}
                  </div>
                )
              })}
            </Author>

            <StyledDeleteControl
              iconProps={{ color: '#555', size: '2.5' }}
              onClick={() => {
                onChange(cleanedVal.filter((_, i) => i !== index))
              }}
              tooltip={t('decisionPage.Delete this author')}
            />
          </AuthorContainer>
        ))}
      </Wrapper>
    </>
  )
}

AuthorsInput.propTypes = {
  fullWidth: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  overrideButtonLabel: PropTypes.string,
  requireEmail: PropTypes.bool,
  rorMenuPlacement: PropTypes.oneOf(['bottom', 'top', 'auto']),
  showMiddleName: PropTypes.bool,
  isRoRMulti: PropTypes.bool,
  showOrcidId: PropTypes.bool,
  value: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.shape({
        firstName: PropTypes.string.isRequired,
        lastName: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        middleName: PropTypes.string,
        ror: PropTypes.shape({}),
        orcid: PropTypes.string,
      }).isRequired,
    ),
  ]),
}

AuthorsInput.defaultProps = {
  fullWidth: false,
  overrideButtonLabel: undefined,
  requireEmail: false,
  rorMenuPlacement: null,
  showMiddleName: false,
  isRoRMulti: false,
  showOrcidId: false,
  value: null,
}

export default AuthorsInput
