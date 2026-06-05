/* eslint-disable react/prop-types */

import { useContext } from 'react'
import { useQuery } from '@apollo/client/react'
import ReviewPreview from './reviewPreview/ReviewPreview'
import { Heading, Page, Spinner } from '../../../shared'
import { ConfigContext } from '../../../config/src'
import { REVIEW_PREVIEW_MANUSCRIPT } from '../../../../queries'

const ReviewPreviewPage = ({ match }) => {
  const config = useContext(ConfigContext)

  const { loading, error, data } = useQuery(REVIEW_PREVIEW_MANUSCRIPT, {
    variables: {
      id: match.params.version,
      groupId: config.groupId,
    },
    partialRefetch: true,
  })

  if (loading) return <Spinner />

  if (error) {
    console.warn(error.message)
    return (
      <Page>
        <Heading>This review is no longer accessible.</Heading>
      </Page>
    )
  }

  const { manuscript, formForPurposeAndCategory } = data

  const submissionForm = formForPurposeAndCategory?.structure ?? {
    name: '',
    children: [],
    description: '',
    haspopup: 'false',
  }

  // Currently not expecting to preview threadedDiscussions from the ReviewPreviewPage
  const threadedDiscussionDummyProps = {
    threadedDiscussions: [],
  }

  return (
    <ReviewPreview
      manuscript={{
        ...manuscript,
        submission: JSON.parse(manuscript.submission),
      }}
      submissionForm={submissionForm}
      threadedDiscussionProps={threadedDiscussionDummyProps}
    />
  )
}

ReviewPreviewPage.propTypes = {
  // match: ReactRouterPropTypes.match.isRequired,
}

export default ReviewPreviewPage
