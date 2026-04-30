/* eslint-disable react/prop-types */

import { useRef, useEffect } from 'react'
import styled from 'styled-components'
import { FieldArray } from 'formik'
import { cloneDeep, set, get } from 'lodash'
import { TextField, Button, ValidatedFieldFormik } from '../../../pubsweet'
// import { minSize } from 'xpub-validators'

// const minSize1 = minSize(1)

const Inline = styled.div`
  display: inline-block;
  margin-right: 30px;
`

const UnbulletedList = styled.div`
  list-style-type: none;
`

const Spacing = styled.div`
  padding: 15px 0;
`

const Link = styled.div`
  padding-bottom: 10px;
`

const URLInput = input => (
  <TextField label="URL" placeholder="Enter a URL" {...input} />
)

const LinksInput = ({ form, remove, push, value, name, onChange }) => {
  const valuesRef = useRef(form.values)

  useEffect(() => {
    valuesRef.current = form.values
  }, [form.values])

  const onChangeFn = event => {
    form.setFieldValue(event.target?.name, event.target?.value, true)

    const data = cloneDeep(valuesRef.current)
    set(data, event.target?.name, event.target?.value)
    onChange(get(data, name))
  }

  return (
    <ul>
      <UnbulletedList>
        <li>
          <Button
            onClick={() =>
              push({
                url: '',
              })
            }
            primary
            type="button"
          >
            {value && value.length ? 'Add another link' : 'Add a link'}
          </Button>
        </li>
        {(value || []).map((link, index) => (
          // TODO: Use a different key.

          <li key={`link-${index}`}>
            <Spacing>
              {}
              <Link>
                Link:&nbsp;
                {value.length > 1 && (
                  <Button
                    onClick={() => {
                      remove(index)
                    }}
                    type="button"
                  >
                    Remove
                  </Button>
                )}
              </Link>
              <div>
                <Inline>
                  <ValidatedFieldFormik
                    component={URLInput}
                    name={`${name}.${index}.url`}
                    onChange={onChangeFn}
                    // TODO: validate={minSize1}
                  />
                </Inline>
              </div>
            </Spacing>
          </li>
        ))}
      </UnbulletedList>
    </ul>
  )
}

const LinksInputFieldArray = ({ onChange, name, value }) => (
  <FieldArray name={name}>
    {({ form, remove, push }) => (
      <LinksInput
        form={form}
        name={name}
        onChange={onChange}
        push={push}
        remove={remove}
        value={value}
      />
    )}
  </FieldArray>
)

export default LinksInputFieldArray
