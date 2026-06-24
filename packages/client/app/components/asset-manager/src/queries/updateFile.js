import { useMutation } from '@apollo/client/react'

import { UPDATE_FILE } from '../../../../queries'

const useUpdateFile = () => useMutation(UPDATE_FILE)

export default useUpdateFile
