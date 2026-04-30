import { useQuery, gql } from '@apollo/client'

const GET_ENTITY_FILES = gql`
  query GetEntityFilesQuery($input: EntityFilesInput) {
    getEntityFiles(input: $input) {
      id
      name
      alt
      objectId
      updated
      inUse
      storedObjects {
        type
        key
        mimetype
        size
        url
        imageMetadata {
          width
          height
          space
          density
        }
      }
    }
  }
`

const useGetEntityFiles = entityId =>
  useQuery(GET_ENTITY_FILES, {
    fetchPolicy: 'cache-and-network',
    variables: {
      input: {
        entityId,
        sortingParams: [
          { key: 'name', order: 'asc' },
          { key: 'updated', order: 'asc' },
        ],
        includeInUse: true,
      },
    },
  })

export { GET_ENTITY_FILES }
export default useGetEntityFiles
