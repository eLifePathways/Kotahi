import { useCallback, useContext } from 'react'
import WaxAppContext from '../WaxAppContext'

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
const useWaxImageUpload = manuscriptId => {
  const { uploadManuscriptImage } = useContext(WaxAppContext)

  return useCallback(
    async file => {
      if (!uploadManuscriptImage || !manuscriptId) return renderImage(file)

      try {
        return await uploadManuscriptImage(file, manuscriptId)
      } catch (e) {
        console.error('Image upload failed, inlining it instead', e)
        // The server will still convert the inlined image to a file on save
        return renderImage(file)
      }
    },
    [uploadManuscriptImage, manuscriptId],
  )
}

export default useWaxImageUpload
