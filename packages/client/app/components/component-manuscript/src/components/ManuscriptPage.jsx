import { useParams } from 'react-router-dom'
import { useQuery } from '@apollo/client/react'
import Manuscript from './Manuscript'
import { Spinner, CommsErrorBanner } from '../../../shared'
import {
  MANUSCRIPT_FOR_MANUSCRIPT_PAGE,
  CURRENT_USER,
} from '../../../../queries'

const ManuscriptPage = () => {
  const params = useParams()
  const { data, loading, error } = useQuery(MANUSCRIPT_FOR_MANUSCRIPT_PAGE, {
    variables: {
      id: params.version,
    },
  })

  const { data: currentUserData } = useQuery(CURRENT_USER)
  const currentUser = currentUserData.currentUser

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
