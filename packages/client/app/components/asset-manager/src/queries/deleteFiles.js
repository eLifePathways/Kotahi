import { useMutation } from '@apollo/client/react'
import { gql } from '@apollo/client'

const DELETE_FILES = gql`
  mutation DeleteFiles($ids: [ID!]!) {
    deleteFiles(ids: $ids)
  }
`

const useDeleteFiles = () => useMutation(DELETE_FILES)

export default useDeleteFiles
