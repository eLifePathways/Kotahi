import { useCallback } from 'react'

import type { UploadResult } from '../../features/images'
import { useWaxApp } from '../WaxAppContext'

export const inlineImage = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (): void => resolve(reader.result as string)
    reader.onerror = (): void => reject(reader.error)
    reader.readAsDataURL(file)
  })

const useImageUpload = (
  manuscriptId?: string,
): ((file: File) => Promise<UploadResult>) => {
  const { uploadManuscriptImage } = useWaxApp()

  return useCallback(
    async (file: File): Promise<UploadResult> => {
      if (!uploadManuscriptImage || !manuscriptId) return inlineImage(file)

      try {
        return await uploadManuscriptImage(file, manuscriptId)
      } catch (error) {
        console.error('Image upload failed, inlining it instead', error)
        return inlineImage(file)
      }
    },
    [uploadManuscriptImage, manuscriptId],
  )
}

export default useImageUpload
