import { isEmpty } from 'lodash'
import {
  callOn,
  camelCaseToCapital,
  getBy,
  onEntries,
  safeParse,
  switchOn,
} from '../../../shared/generalUtils'

const { values } = Object

const createRecipientOptions = ({ roles, users }, cc) => {
  return [
    {
      label: 'User Roles',
      options: roles?.map(({ displayName, role }) => ({
        value: role,
        label: displayName,
      })),
    },
    {
      label: 'Registered Users',
      options: users?.map(({ username, email }) => ({
        value: email,
        label: username,
      })),
    },
    ...(cc?.length
      ? [
          {
            label: 'Unregistered users',
            options: cc?.map(email => ({ value: email, label: email })),
          },
        ]
      : []),
  ]
}

const findOption = (groups, value) => {
  return (
    groups
      .flatMap(group => group?.options?.find(option => option.value === value))
      .find(option => option !== undefined) ||
    (value && {
      value,
      label: camelCaseToCapital(value),
    })
  )
}

export const getRoleRecipients = (groupId, updateRecipients) => {
  return ({ groups }) => {
    const [currentGroup] = getBy({ id: groupId }, groups)
    const oldConfig = safeParse(currentGroup?.oldConfig)
    const { nonGlobal } = oldConfig?.teams ?? {}

    const roles = values(nonGlobal)
      .filter(v => !['user', 'managingEditor'].includes(v.role))
      .sort((a, b) => a.displayName.localeCompare(b.displayName))

    updateRecipients({ roles })
  }
}

export const getUserRecipients = updateRecipients => {
  return ({ paginatedUsers }) => {
    const users = [...paginatedUsers.users].sort((a, b) =>
      a.username.localeCompare(b.username),
    )

    updateRecipients({ users })
  }
}

export const createDefaultOptions = (notification, options) => {
  const { emailTemplateId, recipient, notificationType, ccEmails } =
    notification

  return {
    recipient: recipient ? findOption(options.recipient, recipient) : null,
    emailTemplateId: options.emailTemplateId.find(
      option => option.value === emailTemplateId,
    ),
    notificationType: options.notificationType.find(
      option => option.value === notificationType,
    ),
    ccEmails:
      ccEmails
        ?.map(email => findOption(options.ccEmails, email))
        .filter(Boolean) ?? [],
  }
}

export const createOptions = (recipients, emailTemplates, cc) => {
  const options = {
    recipient: createRecipientOptions(recipients, null),
    emailTemplateId: emailTemplates.map(template => ({
      value: template.id,
      label: template.emailContent.description,
    })),
    notificationType: [{ value: 'email', label: 'E-mail' }],
    ccEmails: createRecipientOptions(recipients, cc),
  }

  return options
}

export const createFieldsStatusObject = notification => {
  const {
    // skipped fields
    /* eslint-disable-next-line no-unused-vars */
    id: skippedId,
    /* eslint-disable-next-line no-unused-vars */
    isDefault: skippedIsDefault,
    // fields to validate
    ...fieldsToValidate
  } = notification

  const fieldsStatus = {
    hasChanged: {},
    isValid: {},
  }

  const validationCriteria = {
    active: () => true,
    ccEmails: () => true,
    delay: v => Number.isInteger(v),
    default: v => !isEmpty(v),
  }

  onEntries(fieldsToValidate, (k, v) => {
    const validValue = callOn(k, validationCriteria, [v])
    fieldsStatus.isValid[k] = validValue
  })

  return fieldsStatus
}

export const filterEventAndNotifications = (
  filter,
  notifications,
  eventIsActive,
) => {
  const filteredNotifications = switchOn(filter, {
    active: notifications.filter(e => e.active),
    inactive: notifications.filter(e => !e.active),
    delayed: notifications.filter(e => e.delay),
    email: notifications.filter(e => e.notificationType === 'email'),
    default: notifications,
  })

  const noNotifications = filter !== 'all' && !filteredNotifications.length

  const excludeEvent = switchOn(filter, {
    delayed: !filteredNotifications.some(e => e.delay),
    email: !filteredNotifications.some(e => e.notificationType === 'email'),
    activeEvents: !eventIsActive || !filteredNotifications.length,
    inactiveEvents: eventIsActive,
    active: !eventIsActive || noNotifications,
    default: noNotifications,
  })

  return { excludeEvent, filteredNotifications }
}
