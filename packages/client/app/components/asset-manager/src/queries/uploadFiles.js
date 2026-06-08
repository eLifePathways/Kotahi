import { useMutation } from '@apollo/client/react'
import { gql } from '@apollo/client'

const UPLOAD_FILES = gql`
  mutation UploadFiles($files: [Upload]!, $fileType: String, $entityId: ID) {
    uploadFiles(files: $files, fileType: $fileType, entityId: $entityId) {
      id
    }
  }
`

const useUploadFiles = () => useMutation(UPLOAD_FILES)

export { UPLOAD_FILES }
export default useUploadFiles
