import { useApolloClient } from '@apollo/client/react'

import { GET_SPECIFIC_FILES } from '../../../../queries'

const useGetSpecificFiles = () => {
  const client = useApolloClient()
  return { client, query: GET_SPECIFIC_FILES }
}

export default useGetSpecificFiles
