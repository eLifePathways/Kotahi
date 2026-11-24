import { useCallback } from 'react'

import type { UploadResult } from '../../features/images'

export const inlineImage = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (): void => resolve(reader.result as string)
    reader.onerror = (): void => reject(reader.error)
    reader.readAsDataURL(file)
  })

export type UploadImage = (
  file: File,
  manuscriptId: string,
) => Promise<UploadResult>

const useImageUpload = (
  uploadImage?: UploadImage,
  manuscriptId?: string,
): ((file: File) => Promise<UploadResult>) =>
  useCallback(
    async (file: File): Promise<UploadResult> => {
      if (!uploadImage || !manuscriptId) return inlineImage(file)

      try {
        return await uploadImage(file, manuscriptId)
      } catch (error) {
        console.error('Image upload failed, inlining it instead', error)
        return inlineImage(file)
      }
    },
    [uploadImage, manuscriptId],
  )

export default useImageUpload
