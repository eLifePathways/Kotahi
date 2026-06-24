import { useQuery } from '@apollo/client/react'

import { GET_ENTITY_FILES } from '../../../../queries'

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

export default useGetEntityFiles
