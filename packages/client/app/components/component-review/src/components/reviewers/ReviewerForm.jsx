/* eslint-disable react/prop-types */

import { grid } from '@coko/client'
import { Field } from 'formik'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'

import { required } from '../../../../xpub-validators/src'
import { Button, Checkbox, TextField } from '../../../../pubsweet'
import { ActionButton, Select } from '../../../../shared'
import { EmailErrorMessageWrapper } from '../emailNotifications'

const OptionRenderer = option => (
  <div>
    <div>{option.username}</div>
    <div>{option.email}</div>
  </div>
)

const RowGridStyled = styled.div`
  display: grid;
  gap: ${grid(2)};
  grid-template-columns: repeat(4, minmax(0, 1fr));
`

const InputField = styled(TextField)`
  height: 40px;
  margin-bottom: 0;
`

const ReviewerInput = ({ field, form: { setFieldValue }, reviewerUsers }) => {
  const { t } = useTranslation()
  return (
    <Select
      {...field}
      aria-label="Invite reviewers"
      getOptionLabel={option => option?.username}
      getOptionValue={option => option.id}
      onChange={user => {
        setFieldValue('user', user)
      }}
      optionRenderer={OptionRenderer}
      options={reviewerUsers}
      placeholder={t('decisionPage.selectUser')}
      promptTextCreator={label => `Add ${label}?`}
      valueKey="id"
    />
  )
}

ReviewerInput.propTypes = {
  field: PropTypes.shape({}).isRequired,
  form: PropTypes.shape({
    setFieldValue: PropTypes.func.isRequired,
  }).isRequired,
  reviewerUsers: PropTypes.arrayOf(PropTypes.shape({}).isRequired).isRequired,
}

const ReviewerForm = ({
  isValid,
  handleSubmit,
  values,
  reviewerUsers,
  isNewUser,
  setIsNewUser,
  notificationStatus,
  optedOut,
  setExternalEmail,
}) => {
  const { t } = useTranslation()
  return (
    <form onSubmit={handleSubmit}>
      <RowGridStyled>
        <Checkbox
          checked={isNewUser}
          defaultChecked={false}
          label={t('decisionPage.New User')}
          onChange={() => setIsNewUser(!isNewUser)}
          width={grid(0.75)}
        />
        {isNewUser ? (
          <>
            <Field
              as={InputField}
              id="email"
              name="email"
              onKeyUp={e => {
                setExternalEmail(e.target.value)
              }}
              placeholder={t('decisionPage.inviteUser.Email')}
            />
            <Field
              as={InputField}
              id="name"
              name="name"
              placeholder={t('decisionPage.inviteUser.Name')}
            />
            <Field
              as={Checkbox}
              checked={values.collaborate}
              id="collaborate"
              label={t('decisionPage.inviteUser.Collaborate')}
              name="collaborate"
            />
            <ActionButton
              disabled={!isValid}
              primary
              status={notificationStatus}
              type="submit"
            >
              {t('decisionPage.Invite and Notify')}
            </ActionButton>
            <EmailErrorMessageWrapper isVisible={optedOut}>
              {t('decisionPage.User email address opted out')}
            </EmailErrorMessageWrapper>
          </>
        ) : (
          <>
            <Field
              component={ReviewerInput}
              name="user"
              reviewerUsers={reviewerUsers}
              validate={required}
            />
            <Button
              data-testid="invite-reviewer"
              disabled={!isValid}
              primary
              type="submit"
            >
              {t('decisionPage.Invite reviewer')}
            </Button>
          </>
        )}
      </RowGridStyled>
    </form>
  )
}

ReviewerForm.propTypes = {
  isValid: PropTypes.bool.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  reviewerUsers: PropTypes.arrayOf(PropTypes.shape({}).isRequired).isRequired,
}

export default ReviewerForm
