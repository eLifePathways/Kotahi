/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
/* eslint-disable promise/catch-or-return, promise/always-return */

import { useCallback, useContext, useEffect, useState } from 'react'
import styled from 'styled-components'
import { debounce } from 'lodash'
import { useTranslation } from 'react-i18next'
import SelectEmailTemplate from '../../component-review/src/components/emailNotifications/SelectEmailTemplate'
import { RoundIconButton, Select, TextInput } from '../../shared'
import SecondaryActionButton from '../../shared/SecondaryActionButton'
import CounterFieldWithOptions from '../../shared/CounterFieldWithOptions'
import CounterField from '../../shared/CounterField'
import theme, { color } from '../../../theme'
import { ConfigContext } from '../../config/src'
import { ifReviewInviteThenAssignRecipientsAsReviewers } from './notificationUtils'

import tasksJson from '../../../../config/journal/tasks.json' with { type: 'json' }

const { emailNotifications } = tasksJson

const TaskTitle = styled.div`
  color: ${color.gray20};
  font-family: Roboto, sans-serif;
  font-size: ${theme.fontSizeBase};
  font-style: normal;
  font-weight: 500;
  letter-spacing: 0.01em;
  line-height: 19px;
  margin-bottom: 4px;
`

const TaskFieldsContainer = styled.div`
  display: flex;
  flex-direction: column;

  + div {
    margin-left: 20px;
  }
`

const RecipientFieldContainer = styled(TaskFieldsContainer)`
  flex: 1 1 20em;
`

const EmailTemplateFieldContainer = styled(TaskFieldsContainer)`
  flex: 1 1 15em;

  div {
    font-size: ${theme.fontSizeBase};
  }

  /* stylelint-disable-next-line no-descending-specificity */
  > div:nth-child(2) > div:nth-child(2) {
    height: 45px;
  }
`

const ScheduleNotificationFieldContainer = styled(TaskFieldsContainer)`
  flex: 0 0 330px;
`

const SendNowActionContainer = styled.div`
  align-items: flex-start;
  display: flex;
  justify-content: center;
  padding-top: 22px;
`

const RoundIconButtonContainer = styled.div`
  display: flex;
  flex: 0 0 36px;
  justify-content: flex-end;

  & > button > span {
    padding: 0;
  }

  & > button {
    height: 25px;
    margin-top: 25px;
    min-width: 0;
    width: 25px;
  }

  & > button > svg {
    width: 18px;
  }
`

const NotificationDeadlineCell = styled.div`
  align-items: center;
  color: ${props => (props.disabled ? color.gray60 : 'inherit')};
  display: flex;
  height: 45px;

  /* stylelint-disable-next-line no-descending-specificity */
  & > div {
    margin: 0 10px;
  }
`

const UnregisteredUserCell = styled.div`
  display: flex;

  > input {
    margin-top: 10px;

    + input {
      margin-left: 10px;
    }
  }
`

const NotificationDeadlineContainer = styled.div`
  display: flex;
  flex-direction: column;
`

const NotificationDetailsContainer = styled.div`
  display: flex;
  width: 100%;

  /* stylelint-disable-next-line no-descending-specificity */
  & + div {
    margin-top: 16px;
  }
`

const AssigneeCell = styled.div`
  justify-content: flex-start;
  line-height: 1em;

  /* stylelint-disable-next-line no-descending-specificity */
  > div > div {
    font-size: ${theme.fontSizeBase};
    line-height: 1.25;

    /* stylelint-disable-next-line no-descending-specificity */
    &:nth-child(2) {
      height: 45px;
    }
  }
`

const TaskNotificationDetails = ({
  updateTaskNotification,
  recipientGroupedOptions,
  taskEmailNotification: propTaskEmailNotification,
  deleteTaskNotification,
  task,
  manuscript,
  currentUser,
  sendNotifyEmail,
  editAsTemplate,
  createTaskEmailNotificationLog,
  selectedDurationDays,
  emailTemplates,
  addReviewer,
}) => {
  const config = useContext(ConfigContext)
  const { groupId } = config
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const { recipientTypes } = emailNotifications

  const [taskEmailNotification, setTaskNotification] = useState(
    propTaskEmailNotification,
  )

  const { t } = useTranslation()

  useEffect(() => {
    setTaskNotification(propTaskEmailNotification)
  }, [propTaskEmailNotification])

  const [taskNotificationStatus, setTaskNotificationStatus] = useState(null)

  const [recipientDropdownState, setRecipientDropdownState] = useState(false)

  const [recipientEmail, setRecipientEmail] = useState(
    taskEmailNotification?.recipientEmail || '',
  )

  const [recipientName, setRecipientName] = useState(
    taskEmailNotification?.recipientName || '',
  )

  const [isNewRecipient, setIsNewRecipient] = useState(
    taskEmailNotification.recipientType === recipientTypes.UNREGISTERED_USER,
  )

  useEffect(() => {
    setRecipientEmail(taskEmailNotification.recipientEmail)
    setIsNewRecipient(
      taskEmailNotification.recipientType === recipientTypes.UNREGISTERED_USER,
    )
    setRecipientName(taskEmailNotification.recipientName)
  }, [taskEmailNotification])

  const updateTaskNotificationDebounced = useCallback(
    debounce(updateTaskNotification ?? (() => {}), 1000),
    [],
  )

  useEffect(() => {
    return updateTaskNotificationDebounced.flush
  }, [])

  const updateRecipientName = value => {
    const updatedTaskNotification = {
      ...taskEmailNotification,
      recipientUserId: null,
      recipientType: recipientTypes.UNREGISTERED_USER,
      recipientName: value,
    }

    setRecipientName(value)
    updateTaskNotificationDebounced(updatedTaskNotification)
  }

  const updateRecipientEmail = value => {
    const updatedTaskNotification = {
      ...taskEmailNotification,
      recipientUserId: null,
      recipientType: recipientTypes.UNREGISTERED_USER,
      recipientEmail: value,
    }

    setRecipientEmail(value)
    updateTaskNotificationDebounced(updatedTaskNotification)
  }

  let notificationOption

  const notificationElapsedDays = Math.abs(
    taskEmailNotification?.notificationElapsedDays,
  )

  if (taskEmailNotification?.notificationElapsedDays < 0) {
    notificationOption = 'before'
  }

  if (taskEmailNotification?.notificationElapsedDays > 0) {
    notificationOption = 'after'
  }

  const [taskEmailNotificationDeadline, setTaskEmailNotificationDeadline] =
    useState(notificationOption)

  const [
    taskEmailNotificationElapsedDays,
    setTaskEmailNotificationElapsedDays,
  ] = useState(notificationElapsedDays)

  function handleRecipientInput(selectedOption, taskNotification) {
    setRecipientDropdownState(selectedOption)

    if (!selectedOption) {
      setIsNewRecipient(false)
      updateTaskNotification({
        ...taskNotification,
        id: taskNotification.id,
        taskId: taskNotification.taskId,
        recipientUserId: null,
        recipientType: null,
        recipientEmail: null,
        recipientName: null,
      })
      return
    }

    switch (selectedOption.key) {
      case 'userRole':
        setIsNewRecipient(false)
        updateTaskNotification({
          ...taskNotification,
          id: taskNotification.id,
          taskId: taskNotification.taskId,
          recipientUserId: null,
          recipientType: selectedOption.value,
          recipientEmail: null,
          recipientName: null,
        })

        break
      case recipientTypes.REGISTERED_USER:
        setIsNewRecipient(false)
        updateTaskNotification({
          ...taskNotification,
          id: taskNotification.id,
          taskId: taskNotification.taskId,
          recipientUserId: selectedOption?.value,
          recipientType: recipientTypes.REGISTERED_USER,
          recipientEmail: null,
          recipientName: null,
        })

        break
      case recipientTypes.ASSIGNEE:
        setIsNewRecipient(false)
        updateTaskNotification({
          ...taskNotification,
          id: taskNotification.id,
          taskId: taskNotification.taskId,
          recipientUserId: null,
          recipientType: recipientTypes.ASSIGNEE,
          recipientEmail: null,
          recipientName: null,
        })

        break
      case recipientTypes.UNREGISTERED_USER:
        setIsNewRecipient(true)
        updateTaskNotification({
          ...taskNotification,
          id: taskNotification.id,
          taskId: taskNotification.taskId,
          recipientUserId: null,
          recipientType: recipientTypes.UNREGISTERED_USER,
          recipientEmail: null,
          recipientName: null,
        })

        break
      default:
    }
  }

  function handleTaskNotificationDeadline(
    deadlineOption,
    elapsedDays,
    taskNotification,
  ) {
    let elapsedDaysValue = elapsedDays

    if (deadlineOption === 'before') {
      elapsedDaysValue = -Math.abs(elapsedDaysValue)
    }

    updateTaskNotification({
      ...taskNotification,
      id: taskNotification.id,
      taskId: taskNotification.taskId,
      notificationElapsedDays: elapsedDaysValue,
    })
  }

  const handleManuscriptTeamInputForNotification = (
    notificationRecipientType,
    manuscriptTeams,
  ) => {
    const teamsOfRecipientType = manuscriptTeams
      .map(team => ({
        ...team,
        members: team.members.filter(
          member => !['invited', 'rejected'].includes(member.status),
        ),
      }))
      .filter(team => {
        if (notificationRecipientType === 'editor') {
          return ['editor', 'handlingEditor', 'seniorEditor'].includes(
            team.role,
          )
        }

        return team.role === notificationRecipientType && team.members.length
      })

    const logsDataArray = []

    const prepareEmailRecipients = () => {
      return new Promise((resolve, reject) => {
        let emailSuccess = true
        let emailCount = 0

        if (teamsOfRecipientType.length === 0) {
          emailSuccess = false
        }

        const totalEmails = teamsOfRecipientType.reduce(
          (sum, team) => sum + team.members.length,
          0,
        )

        const promises = []

        for (const team of teamsOfRecipientType) {
          for (const member of team.members) {
            const input = {
              selectedEmail: member.user.email,
              selectedTemplate: taskEmailNotification.emailTemplateId,
              manuscript,
              currentUser: currentUser.username,
              groupId,
            }

            const logsData = {
              selectedTemplate: taskEmailNotification.emailTemplateId,
              recipientName: member.user.username,
              recipientEmail: member.user.email,
              senderEmail: currentUser.email,
            }

            promises.push(
              sendNotifyEmail(input)
                // eslint-disable-next-line no-loop-func
                .then(response => {
                  const responseStatus =
                    response.data.sendEmail.response.success

                  if (!responseStatus) {
                    emailSuccess = false
                    reject(new Error('Sending email failed'))
                    emailCount += 1
                  } else {
                    logsDataArray.push(logsData)
                  }

                  if (emailCount === totalEmails) {
                    resolve(emailSuccess)
                  }
                })
                // eslint-disable-next-line no-loop-func
                .catch(error => {
                  emailSuccess = false
                  reject(error)
                }),
            )
          }
        }

        Promise.all(promises).then(() => {
          resolve(emailSuccess)
        })
      })
    }

    return prepareEmailRecipients().then(emailStatus => {
      if (emailStatus) {
        updateTaskNotification({
          ...taskEmailNotification,
          sentAt: new Date(),
        })
        logTaskNotificationEmails(logsDataArray)
      }

      return emailStatus
    })
  }

  const sendTaskNotificationEmailHandler = async () => {
    setTaskNotificationStatus('pending')

    ifReviewInviteThenAssignRecipientsAsReviewers(
      taskEmailNotification.emailTemplateId,
      taskEmailNotification.recipientType,
      taskEmailNotification.recipientUser,
      task,
      manuscript,
      emailTemplates,
      addReviewer,
    )

    if (taskEmailNotification.recipientType) {
      let input
      let response
      let responseStatus
      let logsData = []

      switch (taskEmailNotification.recipientType) {
        case recipientTypes.UNREGISTERED_USER:
          input = {
            externalEmail: taskEmailNotification.recipientEmail,
            externalName: taskEmailNotification.recipientName,
            selectedTemplate: taskEmailNotification.emailTemplateId,
            currentUser: currentUser.username,
            manuscript,
            groupId,
          }
          logsData = [
            {
              selectedTemplate: taskEmailNotification.emailTemplateId,
              recipientName: taskEmailNotification.recipientName,
              recipientEmail: taskEmailNotification.recipientEmail,
              senderEmail: currentUser.email,
            },
          ]
          response = await sendNotifyEmail(input)
          responseStatus = response.data.sendEmail.response.success

          if (responseStatus) {
            updateTaskNotification({
              ...taskEmailNotification,
              sentAt: new Date(),
            })
            logTaskNotificationEmails(logsData)
          }

          setTaskNotificationStatus(responseStatus ? 'success' : 'failure')
          break
        case recipientTypes.REGISTERED_USER:
          input = {
            selectedEmail: taskEmailNotification.recipientUser.email,
            selectedTemplate: taskEmailNotification.emailTemplateId,
            manuscript,
            currentUser: currentUser.username,
            groupId,
          }
          logsData = [
            {
              selectedTemplate: taskEmailNotification.emailTemplateId,
              recipientName: taskEmailNotification.recipientUser.username,
              recipientEmail: taskEmailNotification.recipientUser.email,
              senderEmail: currentUser.email,
            },
          ]
          response = await sendNotifyEmail(input)
          responseStatus = response.data.sendEmail.response.success

          if (responseStatus) {
            updateTaskNotification({
              ...taskEmailNotification,
              sentAt: new Date(),
            })
            logTaskNotificationEmails(logsData)
          }

          setTaskNotificationStatus(responseStatus ? 'success' : 'failure')
          break
        case recipientTypes.ASSIGNEE:
          switch (task.assigneeType) {
            case recipientTypes.UNREGISTERED_USER:
              input = {
                externalEmail: task.assigneeEmail,
                externalName: task.assigneeName,
                selectedTemplate: taskEmailNotification.emailTemplateId,
                currentUser: currentUser.username,
                manuscript,
                groupId,
              }
              logsData = [
                {
                  selectedTemplate: taskEmailNotification.emailTemplateId,
                  recipientName: task.assigneeName,
                  recipientEmail: task.assigneeEmail,
                  senderEmail: currentUser.email,
                },
              ]
              response = await sendNotifyEmail(input)
              responseStatus = response.data.sendEmail.response.success

              if (responseStatus) {
                updateTaskNotification({
                  ...taskEmailNotification,
                  sentAt: new Date(),
                })
                logTaskNotificationEmails(logsData)
              }

              setTaskNotificationStatus(responseStatus ? 'success' : 'failure')
              break
            case recipientTypes.REGISTERED_USER:
              input = {
                selectedEmail: task.assignee.email,
                selectedTemplate: taskEmailNotification.emailTemplateId,
                manuscript,
                currentUser: currentUser.username,
                groupId,
              }

              logsData = [
                {
                  selectedTemplate: taskEmailNotification.emailTemplateId,
                  recipientName: task.assignee.username,
                  recipientEmail: task.assignee.email,
                  senderEmail: currentUser.email,
                },
              ]
              response = await sendNotifyEmail(input)
              responseStatus = response.data.sendEmail.response.success

              if (responseStatus) {
                updateTaskNotification({
                  ...taskEmailNotification,
                  sentAt: new Date(),
                })
                logTaskNotificationEmails(logsData)
              }

              setTaskNotificationStatus(responseStatus ? 'success' : 'failure')
              break
            case 'editor':
            case 'reviewer':
            case 'collaborativeReviewer':
            case 'author':
              responseStatus = handleManuscriptTeamInputForNotification(
                task.assigneeType,
                manuscript.teams,
              )
                .then(emailStatus => {
                  setTaskNotificationStatus(emailStatus ? 'success' : 'failure')
                })
                .catch(error => {
                  console.error(error)
                  setTaskNotificationStatus('failure')
                })
              break
            default:
          }

          break
        case 'editor':
        case 'reviewer':
        case 'author':
          responseStatus = handleManuscriptTeamInputForNotification(
            taskEmailNotification.recipientType,
            manuscript.teams,
          )
            .then(emailStatus => {
              setTaskNotificationStatus(emailStatus ? 'success' : 'failure')
            })
            .catch(error => {
              console.error(error)
              setTaskNotificationStatus('failure')
            })
          break
        default:
      }
    }
  }

  const logTaskNotificationEmails = async logsData => {
    const manuscriptEditor = manuscript.teams.reduce((editors, item) => {
      if (item.role === 'editor') {
        editors.push(item.members[0]?.user.username)
      }

      return editors
    }, [])

    for (const logData of logsData) {
      const emailTemplateOption = emailTemplates.find(
        template => template.id === logData.selectedTemplate,
      )

      const selectedTemplateValue = emailTemplateOption.emailContent.description

      const messageBody = `${selectedTemplateValue} sent by ${
        manuscriptEditor[0] ?? currentUser.username
      } to ${logData.recipientName}`

      // eslint-disable-next-line no-await-in-loop
      await createTaskEmailNotificationLog({
        variables: {
          taskEmailNotificationLog: {
            taskId: task.id,
            content: messageBody,
            emailTemplateId: emailTemplateOption.id,
            senderEmail: logData.senderEmail,
            recipientEmail: logData.recipientEmail,
          },
        },
      })
    }
  }

  const handleEmailTemplateChange = template => {
    setSelectedTemplate(template)
    setTaskNotificationStatus('')
  }

  return (
    <NotificationDetailsContainer>
      <RecipientFieldContainer>
        <TaskTitle>{t('modals.taskEdit.Recipient')}</TaskTitle>
        <AssigneeCell title={taskEmailNotification.recipientType}>
          <Select
            aria-label="Recipient"
            data-testid="Recipient_select"
            dropdownState={recipientDropdownState}
            hasGroupedOptions
            isClearable
            label="Recipient"
            menuPortalTarget={document.querySelector('body')}
            onChange={selected =>
              handleRecipientInput(selected, taskEmailNotification)
            }
            options={recipientGroupedOptions}
            placeholder={t('modals.taskEdit.Select a recipient')}
            value={
              taskEmailNotification?.recipientUserId ||
              taskEmailNotification?.recipientType
            }
          />
        </AssigneeCell>
        {isNewRecipient && (
          <UnregisteredUserCell>
            <TextInput
              data-cy="new-recipient-email"
              onChange={event => updateRecipientEmail(event.target.value)}
              placeholder={t('taskManager.task.unregisteredUser.Email')}
              value={recipientEmail}
            />
            <TextInput
              data-cy="new-recipient-name"
              onChange={event => updateRecipientName(event.target.value)}
              placeholder={t('taskManager.task.unregisteredUser.Name')}
              value={recipientName}
            />
          </UnregisteredUserCell>
        )}
      </RecipientFieldContainer>
      <EmailTemplateFieldContainer>
        <TaskTitle>{t('modals.taskEdit.Select email template')}</TaskTitle>
        <SelectEmailTemplate
          emailTemplates={emailTemplates}
          isClearable
          onChangeEmailTemplate={handleEmailTemplateChange}
          placeholder={t('modals.taskEdit.Select email template')}
          selectedEmailTemplate={
            selectedTemplate || taskEmailNotification.emailTemplateId
          }
          task={task}
          taskEmailNotification={taskEmailNotification}
          updateTaskNotification={updateTaskNotification}
        />
      </EmailTemplateFieldContainer>
      <ScheduleNotificationFieldContainer>
        <NotificationDeadlineContainer>
          <TaskTitle>{t('modals.taskEdit.Send notification')}</TaskTitle>
          <NotificationDeadlineCell disabled={selectedDurationDays === null}>
            <span>{t('modals.taskEdit.Send')}</span>
            <CounterField
              compact
              disabled={selectedDurationDays === null}
              minValue={0}
              onChange={val => {
                setTaskEmailNotificationElapsedDays(val)
                handleTaskNotificationDeadline(
                  taskEmailNotificationDeadline,
                  val,
                  taskEmailNotification,
                )
              }}
              value={taskEmailNotificationElapsedDays || 0}
            />
            <span>{t('modals.taskEdit.days')}</span>
            <CounterFieldWithOptions
              disabled={selectedDurationDays === null}
              onChange={selected => {
                if (selected && selected.value) {
                  setTaskEmailNotificationDeadline(selected.value)
                  handleTaskNotificationDeadline(
                    selected.value,
                    taskEmailNotificationElapsedDays,
                    taskEmailNotification,
                  )
                }
              }}
              options={[
                { label: t('modals.taskEdit.before'), value: 'before' },
                { label: t('modals.taskEdit.after'), value: 'after' },
              ]}
              value={taskEmailNotificationDeadline || 'before'}
            />
            <span>{t('modals.taskEdit.due date')}</span>
          </NotificationDeadlineCell>
        </NotificationDeadlineContainer>
      </ScheduleNotificationFieldContainer>
      {!editAsTemplate && (
        <SendNowActionContainer>
          <SecondaryActionButton
            onClick={sendTaskNotificationEmailHandler}
            status={taskNotificationStatus}
          >
            {t('modals.taskEdit.Send Now')}
          </SecondaryActionButton>
        </SendNowActionContainer>
      )}
      <RoundIconButtonContainer>
        <RoundIconButton
          iconName="Minus"
          onClick={() => deleteTaskNotification(taskEmailNotification.id)}
          secondary
          title="Delete Notification"
        />
      </RoundIconButtonContainer>
    </NotificationDetailsContainer>
  )
}

export default TaskNotificationDetails
