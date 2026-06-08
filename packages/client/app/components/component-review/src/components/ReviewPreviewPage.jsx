/* eslint-disable react/prop-types */

import { useContext } from 'react'
import { useQuery } from '@apollo/client/react'
import { gql } from '@apollo/client'
import ReviewPreview from './reviewPreview/ReviewPreview'
import { Heading, Page, Spinner } from '../../../shared'
import { ConfigContext } from '../../../config/src'

const fragmentFields = `
  id
  shortId
  created
  status
  meta {
    manuscriptId
  }
  submission
  files {
    id
    name
    tags
    storedObjects {
      mimetype
      url
    }
  }
`

const query = gql`
  query($id: ID!, $groupId: ID) {
    manuscript(id: $id) {
      ${fragmentFields}
      manuscriptVersions {
        ${fragmentFields}
      }
    }

    formForPurposeAndCategory(purpose: "submit", category: "submission", groupId: $groupId) {
      structure {
        children {
          title
          shortDescription
          id
          component
          name
          isReadOnly
          hideFromReviewers
          format
        }
      }
    }
  }
`

const ReviewPreviewPage = ({ match }) => {
  const config = useContext(ConfigContext)

  const { loading, error, data } = useQuery(query, {
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
