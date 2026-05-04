/* eslint-disable react/prop-types */

import styled from 'styled-components'
import { useTranslation } from 'react-i18next'

import { Checkbox, TextField } from '../../../../pubsweet'
import { Select } from '../../../../shared'

const InputField = styled(TextField)`
  height: 40px;
  margin-bottom: 0;
`

const SelectReceiver = ({
  onChangeReceiver,
  selectedReceiver,
  options,
  isNewUser,
  setIsNewUser,
  externalEmail,
  externalName,
  setExternalEmail,
  setExternalName,
}) => {
  const { t } = useTranslation()
  return (
    <>
      <Checkbox
        checked={isNewUser}
        label={t('decisionPage.tasksTab.New User')}
        onChange={setIsNewUser}
      />
      {isNewUser ? (
        <>
          <InputField
            data-cy="new-user-email"
            onChange={e => setExternalEmail(e.target.value)}
            placeholder={t('decisionPage.tasksTab.newUser.Email')}
            value={externalEmail}
          />
          <InputField
            data-cy="new-user-name"
            onChange={e => setExternalName(e.target.value)}
            placeholder={t('decisionPage.tasksTab.newUser.Name')}
            value={externalName}
          />
        </>
      ) : (
        <Select
          aria-label="Choose receiver"
          data-testid="choose-receiver"
          label={t('decisionPage.tasksTab.Choose receiver')}
          onChange={selected => {
            onChangeReceiver(selected.value)
          }}
          options={options}
          placeholder={t('decisionPage.tasksTab.Choose receiver')}
          value={selectedReceiver}
          width="100%"
        />
      )}
    </>
  )
}

// SelectReceiver.propTypes = {
//   setSelectedReceiver: PropTypes.func.isRequired,
// }

export default SelectReceiver
