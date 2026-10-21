import { useCallback } from 'react'
import { GET_SPECIFIC_FILES, UPLOAD_FILES } from '../../../queries'

const renderImage = file => {
  const reader = new FileReader()
  return new Promise((resolve, reject) => {
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    // Some extra delay to make the asynchronicity visible
    setTimeout(() => {
      reader.readAsDataURL(file)
    }, 150)
  })
}

// Upload the image straight away so Wax stores its file id on the image node.
// Otherwise the editor keeps the base64 src (Wax never re-reads `value`) and
// resubmits it on every autosave.
const useWaxImageUpload = (client, manuscriptId) =>
  useCallback(
    async file => {
      if (!client || !manuscriptId) return renderImage(file)

      try {
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
      } catch (e) {
        console.error('Image upload failed, inlining it instead', e)
        // The server will still convert the inlined image to a file on save
        return renderImage(file)
      }
    },
    [client, manuscriptId],
  )

export default useWaxImageUpload
