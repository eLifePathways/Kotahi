import { useMutation } from '@apollo/client/react'
import { gql } from '@apollo/client'

const UPDATE_FILE = gql`
  mutation UpdateFile($input: UpdateFileInput!) {
    updateFile(input: $input) {
      id
    }
  }
`

const useUpdateFile = () => useMutation(UPDATE_FILE)

export default useUpdateFile
