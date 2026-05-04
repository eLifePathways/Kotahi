import { useContext } from 'react'
import PropTypes from 'prop-types'
import { ApolloConsumer } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import { Container, Content, UploadContainer, Heading } from '../style'
import UploadManuscript from './UploadManuscript'
import { ConfigContext } from '../../../config/src'

const acceptUploadFiles = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/x-latex',
  'text/vnd.latex-z',
  'text/plain',
  'text/x-tex',
  'application/x-tex',
  'application/x-dvi',
  'application/pdf',
  'application/epub+zip',
  'application/zip',
  '.tex',
]

const acceptFiles =
  acceptUploadFiles.length > 0
    ? acceptUploadFiles.join()
    : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

const Dashboard = ({ currentUser, history }) => {
  const { t } = useTranslation()

  const {
    submission: { submissionPage },
  } = useContext(ConfigContext)

  const { submitOptions = '' } = submissionPage ?? {}

  let showSubmitUrl =
    submitOptions === 'allowAuthorSubmitForm' ||
    submitOptions === 'allowAuthorUploadWithForm' ||
    submitOptions === 'allowAuthorSubmitFormWithBlankEditor'

  let showUploadManuscript =
    submitOptions === 'allowAuthorUploadOnly' ||
    submitOptions === 'allowAuthorUploadWithForm'

  if (!submitOptions) {
    showSubmitUrl = true
    showUploadManuscript = true
  }

  return (
    <Container>
      <Heading>
        {submissionPage?.title
          ? submissionPage.title
          : t('newSubmission.New submission')}
      </Heading>
      <Content>
        <UploadContainer>
          <ApolloConsumer>
            {client => (
              <UploadManuscript
                acceptFiles={acceptFiles}
                client={client}
                currentUser={currentUser}
                description={submissionPage?.submissionPagedescription}
                history={history}
                showSubmitUrl={showSubmitUrl}
                showUploadManuscript={showUploadManuscript}
              />
            )}
          </ApolloConsumer>
        </UploadContainer>
      </Content>
    </Container>
  )
}

Dashboard.propTypes = {
  currentUser: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
}

export default Dashboard
