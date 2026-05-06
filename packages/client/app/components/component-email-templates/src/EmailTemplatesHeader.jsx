import { convertTimestampToDateTimeString } from '../../../shared/dateUtils'
import { useEmailTemplatesContext } from '../hooks/EmailTemplatesContext'
import {
  CreateButton,
  DescriptionContainer,
  EditedOnLabel,
  HeaderRoot,
  Heading,
} from '../misc/styleds'

const EmailTemplatesHeader = () => {
  const { t, isDraft, activeTemplate } = useEmailTemplatesContext()

  const { emailContent, updated } = activeTemplate.state ?? {}
  const { description } = emailContent ?? {}

  const editedLabel = t('emailTemplate.Edited on', {
    date: convertTimestampToDateTimeString(updated || new Date()),
  })

  return (
    <HeaderRoot>
      <DescriptionContainer>
        <Heading>
          {description ?? t('emailTemplate.New Email Template')}
        </Heading>
        <EditedOnLabel>{editedLabel}</EditedOnLabel>
      </DescriptionContainer>

      <CreateButton
        disabled={isDraft}
        onClick={activeTemplate.clear}
        primary
        title={t('emailTemplate.addANewEmailTemplate')}
      >
        {t('common.Create')}
      </CreateButton>
    </HeaderRoot>
  )
}

export default EmailTemplatesHeader
