import { useTheme } from 'styled-components'

import EmailTemplateContent from './EmailTemplateContent'
import EmailTemplatesHeader from './EmailTemplatesHeader'
import EmailTemplatesNav from './EmailTemplatesNav'
import { ConfirmationModal } from '../../component-modal/src/ConfirmationModal'
import { useEmailTemplatesContext } from '../hooks/EmailTemplatesContext'
import { Content, Root } from '../misc/styleds'

const EmailTemplates = () => {
  const theme = useTheme()
  const { handleDelete, deleteModalState, t } = useEmailTemplatesContext()

  return (
    <Root>
      <EmailTemplatesHeader />
      <Content>
        <EmailTemplateContent />
        <EmailTemplatesNav />
      </Content>
      <ConfirmationModal
        buttonColor={theme.color.error.base}
        closeModal={deleteModalState.off}
        confirmationAction={handleDelete}
        confirmationButtonText={t('emailTemplate.delete')}
        isOpen={deleteModalState.state}
        message={t('emailTemplate.permanentlyDelete')}
      />
    </Root>
  )
}

export default EmailTemplates
