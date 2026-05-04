/* eslint-disable react/prop-types */

import { useState } from 'react'
import styled from 'styled-components'
import { th } from '@coko/client'
import Flexbox from '../../../../pubsweet/Flexbox'
import Radio from '../../../../pubsweet/Radio'
import { TextField } from '../../../../pubsweet'
import { ActionButton } from '../../../../shared'

export const Legend = styled.div`
  font-size: ${th('fontSizeBase')};
  font-weight: 600;
  margin-bottom: ${({ space, theme }) => space && theme.gridUnit};
`

const CredentialsFlexbox = styled(Flexbox)`
  margin-top: 10px;
`

const CredentialFields = ({ s3Values, onChange }) => {
  const [credentials, setCredentials] = useState({
    accessId: null,
    accessToken: null,
    status: 'hide',
  })

  const onTextChange = field => event => {
    const { value } = event.target
    const v = credentials
    v[field] = value

    setCredentials({ ...v })
  }

  const updatePassword = () => {
    setCredentials({ ...credentials, status: 'hide' })

    const data = {
      ...s3Values,
      s3AccessId: credentials.accessId,
      s3AccessToken: credentials.accessToken,
    }

    onChange(data)
  }

  return credentials.status === 'hide' ? (
    <ActionButton
      onClick={() => setCredentials({ ...credentials, status: 'update' })}
    >
      Set S3 credentials
    </ActionButton>
  ) : (
    <>
      <Legend>S3 access id</Legend>
      <TextField
        name="s3AccessId"
        onChange={onTextChange('accessId')}
        value={credentials.accessId}
      />
      <Legend>S3 access token</Legend>
      <TextField
        name="s3AccessToken"
        onChange={onTextChange('accessToken')}
        value={credentials.accessToken}
      />
      <ActionButton onClick={updatePassword}>Update password</ActionButton>
    </>
  )
}

const RadioboxS3ServiceBuilder = ({
  inline,
  value,
  className,
  disabled,
  name,
  radioOptions,
  required,
  onChange,
}) => {
  const [s3Values, setS3Values] = useState(value)

  const handleChange = event => {
    // eslint-disable-next-line no-shadow
    const { value } = event.target
    const data = { ...s3Values, type: value }
    setS3Values(data)
    onChange(data)
  }

  const onTextChange = field => event => {
    // eslint-disable-next-line no-shadow
    const { value } = event.target
    const v = s3Values
    v[field] = value

    setS3Values({ ...v })
    onChange(v)
  }

  return (
    <>
      <Flexbox column={!inline}>
        {radioOptions.map(option => (
          <Radio
            checked={option.value === s3Values.type}
            className={className}
            color={option.color}
            disabled={disabled || option.disabled}
            inline={inline}
            key={option.value}
            label={option.label}
            name={name}
            onChange={handleChange}
            required={required}
            value={option.value}
          />
        ))}
      </Flexbox>
      <CredentialsFlexbox column={inline}>
        {s3Values.type === 'external' && (
          <>
            <Legend>S3 Service Url</Legend>
            <TextField
              name="s3Url"
              onChange={onTextChange('s3Url')}
              value={s3Values.s3Url}
            />
            <Legend>S3 Service Bucket</Legend>
            <TextField
              name="s3Bucket"
              onChange={onTextChange('s3Bucket')}
              value={s3Values.s3Bucket}
            />
            <CredentialFields onChange={onChange} s3Values={s3Values} />
          </>
        )}
      </CredentialsFlexbox>
    </>
  )
}

export default RadioboxS3ServiceBuilder
