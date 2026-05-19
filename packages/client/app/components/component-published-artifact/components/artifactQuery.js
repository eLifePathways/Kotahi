import { gql } from '@apollo/client'

export default gql`
  query publishedManuscriptAndForms($id: ID!) {
    publishedManuscript(id: $id) {
      id
      meta {
        manuscriptId
      }
      submission
      publishedArtifacts {
        id
        updated
        manuscriptId
        platform
        externalId
        title
        content
        hostedInKotahi
        relatedDocumentUri
        relatedDocumentType
      }
    }
  }
`
