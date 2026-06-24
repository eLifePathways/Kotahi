import { Fragment, useContext } from 'react'
import PropTypes from 'prop-types'
import { useQuery } from '@apollo/client/react'
import { CommsErrorBanner, Spinner } from '../../shared'
import EmailTemplates from './EmailTemplates'
import { useEmailTemplatesContext } from '../hooks/EmailTemplatesContext'
import { handlebars } from './handlebarsAutocomplete/constants'
import { ConfigContext } from '../../config/src'
import { GET_TEMPLATE_VARIABLES } from '../../../queries'

const EmailTemplatesPage = ({ wrapper: Wrapper = Fragment }) => {
  const config = useContext(ConfigContext)
  const { groupId } = config
  useQuery(GET_TEMPLATE_VARIABLES, {
    variables: { groupId },
    onCompleted: ({ getVariables: variables = [] }) => {
      handlebars.store({ variables })
    },
  })
  const { loading, error, emailTemplates } = useEmailTemplatesContext()

  if (loading || !emailTemplates) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />

  return (
    <Wrapper>
      <EmailTemplates />
    </Wrapper>
  )
}

EmailTemplatesPage.propTypes = {
  wrapper: PropTypes.elementType,
}

export default EmailTemplatesPage
