import { useMutation } from '@apollo/client/react'

import { UPLOAD_FILES } from '../../../../queries'

const useUploadFiles = () => useMutation(UPLOAD_FILES)

export default useUploadFiles
