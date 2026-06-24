/* eslint-disable react/prop-types */

import { useTranslation } from 'react-i18next'
import { Select } from '../../../../shared'

const hideEmailTemplateTypes = [
  'authorProofingInvitation',
  'authorProofingSubmitted',
  'systemEmail',
]

const SelectEmailTemplate = ({
  onChangeEmailTemplate,
  selectedEmailTemplate,
  updateTaskNotification,
  taskEmailNotification,
  placeholder,
  isClearable,
  // task,
  emailTemplates,
}) => {
  const emailOptionsToDisplay = emailTemplates.filter(template => {
    return !hideEmailTemplateTypes.includes(template.emailTemplateType)
  })

  const emailNotificationOptions = emailOptionsToDisplay.map(template => {
    const emailOption = {
      label: template.emailContent.description,
      value: template.id,
      type: template.emailTemplateType,
    }

    return emailOption
  })

  const { t } = useTranslation()
  return (
    <Select
      aria-label="Notification_email_select"
      data-testid="Notification_email_select"
      emailTemplateOptions={emailNotificationOptions}
      isClearable={isClearable || false}
      label="notification email"
      menuPortalTarget={document.querySelector('body')}
      onChange={selected => {
        if (taskEmailNotification) {
          updateTaskNotification({
            ...taskEmailNotification,
            id: taskEmailNotification.id,
            taskId: taskEmailNotification.taskId,
            emailTemplateId: selected ? selected.value : '',
          })
        }

        onChangeEmailTemplate(selected ? selected.value : '')
      }}
      options={emailNotificationOptions}
      placeholder={
        placeholder || t('decisionPage.tasksTab.Choose notification template')
      }
      value={selectedEmailTemplate}
    />
  )
}

export default SelectEmailTemplate
