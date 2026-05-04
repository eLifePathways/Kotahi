/* eslint-disable react/prop-types */

import { useQuery } from '@apollo/client/react'
import { gql } from '@apollo/client'
import Manuscript from './Manuscript'
import { Spinner, CommsErrorBanner } from '../../../shared'

const fragmentFields = `
  id
  created
  status
  files {
    id
    tags
    storedObjects {
      mimetype
    }
  }
  meta {
    source
		comments
    manuscriptId
  }
  channels {
    id
    type
  }
`

const query = gql`
  query($id: ID!) {
    manuscript(id: $id) {
      ${fragmentFields}
    }
  }
`

const ManuscriptPage = ({ currentUser, match }) => {
  const { data, loading, error } = useQuery(query, {
    variables: {
      id: match.params.version,
    },
  })

  if (loading) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />
  const { manuscript } = data

  return (
    <Manuscript
      channel={manuscript.channels.find(c => c.type === 'all')}
      content={manuscript.meta?.source}
      currentUser={currentUser}
      file={manuscript.files.find(file => file.tags.includes('manuscript'))}
      manuscript={manuscript}
    />
  )
}

ManuscriptPage.propTypes = {
  // match: ReactRouterPropTypes.match.isRequired,
}

export default ManuscriptPage
