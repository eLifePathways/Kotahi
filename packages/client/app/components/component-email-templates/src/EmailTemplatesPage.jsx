import { Fragment, useContext } from 'react'
import PropTypes from 'prop-types'
import { useQuery } from '@apollo/client/react'
import { CommsErrorBanner } from '../../shared'
import Spinner from '../../../ui/shared/Spinner'
import EmailTemplates from './EmailTemplates'
import { useEmailTemplatesContext } from '../hooks/EmailTemplatesContext'
import { ConfigContext } from '../../config/src'
import { GET_TEMPLATE_VARIABLES } from '../../../queries'

const EmailTemplatesPage = ({ wrapper: Wrapper = Fragment }) => {
  const { groupId } = useContext(ConfigContext)

  const { data: templateVariablesData } = useQuery(GET_TEMPLATE_VARIABLES, {
    variables: { groupId },
  })

  const { loading, error, emailTemplates } = useEmailTemplatesContext()

  if (loading || !emailTemplates) return <Spinner fullpage />
  if (error) return <CommsErrorBanner error={error} />

  return (
    <Wrapper>
      <EmailTemplates
        templateVariables={templateVariablesData?.getVariables ?? []}
      />
    </Wrapper>
  )
}

EmailTemplatesPage.propTypes = {
  wrapper: PropTypes.elementType,
}

export default EmailTemplatesPage
