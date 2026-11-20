import { useCallback } from 'react'
import { useApolloClient } from '@apollo/client/react'
import { GET_SPECIFIC_FILES, UPLOAD_FILES } from '../queries'

const useUploadManuscriptImage = () => {
  const client = useApolloClient()

  return useCallback(
    async (file, manuscriptId) => {
      const { data } = await client.mutate({
        mutation: UPLOAD_FILES,
        variables: {
          files: [file],
          fileType: 'manuscriptImage',
          entityId: manuscriptId,
        },
      })

      const fileId = data.uploadFiles[0].id

      const { data: filesData } = await client.query({
        query: GET_SPECIFIC_FILES,
        variables: { ids: [fileId] },
        fetchPolicy: 'network-only',
      })

      const { storedObjects } = filesData.getSpecificFiles[0]

      const { url } =
        storedObjects.find(storedObject => storedObject.type === 'medium') ||
        storedObjects[0]

      return { url, extraData: { fileId } }
    },
    [client],
  )
}

export default useUploadManuscriptImage
