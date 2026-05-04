import { Fragment, useContext } from 'react'
import PropTypes from 'prop-types'
import { useQuery } from '@apollo/client'
import { CommsErrorBanner, Spinner } from '../../shared'
import EmailTemplates from './EmailTemplates'
import { useEmailTemplatesContext } from '../hooks/EmailTemplatesContext'
import GET_VARIABLES from './handlebarsAutocomplete/graphql/graphql'
import { handlebars } from './handlebarsAutocomplete/constants'
import { ConfigContext } from '../../config/src'

const EmailTemplatesPage = ({ wrapper: Wrapper }) => {
  const config = useContext(ConfigContext)
  const { groupId } = config
  useQuery(GET_VARIABLES, {
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

EmailTemplatesPage.defaultProps = {
  wrapper: Fragment,
}

export default EmailTemplatesPage
