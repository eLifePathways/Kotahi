import { useMutation } from '@apollo/client/react'

import { DELETE_FILES } from '../../../../queries'

const useDeleteFiles = () => useMutation(DELETE_FILES)

export default useDeleteFiles
