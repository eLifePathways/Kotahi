import { gql } from '@apollo/client'

export default {
  frontpage: gql`
    query publishedManuscripts(
      $sort: String
      $offset: Int
      $limit: Int
      $groupId: ID!
    ) {
      publishedManuscripts(
        sort: $sort
        offset: $offset
        limit: $limit
        groupId: $groupId
      ) {
        totalCount
        manuscripts {
          id
          status
          files {
            id
            name
            tags
            storedObjects {
              mimetype
              url
            }
          }
          meta {
            manuscriptId
            source
          }
          published
          submission
          publishedArtifacts {
            id
            manuscriptId
            platform
            externalId
            title
            content
            hostedInKotahi
          }
        }
      }
    }
  `,
}
