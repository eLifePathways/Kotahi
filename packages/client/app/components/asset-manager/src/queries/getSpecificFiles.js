import { useApolloClient, gql } from '@apollo/client'

const GET_SPECIFIC_FILES = gql`
  query GetSpecificFilesQuery($ids: [ID!]!) {
    getSpecificFiles(ids: $ids) {
      id
      name
      alt
      objectId
      updated
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

const useGetSpecificFiles = () => {
  const client = useApolloClient()
  return { client, query: GET_SPECIFIC_FILES }
}

export { GET_SPECIFIC_FILES }
export default useGetSpecificFiles
