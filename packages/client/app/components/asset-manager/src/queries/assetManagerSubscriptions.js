import { useSubscription, gql } from '@apollo/client'

const FILES_UPLOADED_SUBSCRIPTION = gql`
  subscription FilesUploaded {
    filesUploaded
  }
`

const FILES_DELETED_SUBSCRIPTION = gql`
  subscription FilesDeleted {
    filesDeleted
  }
`

const FILE_UPDATED_SUBSCRIPTION = gql`
  subscription FileUpdated {
    fileUpdated {
      id
    }
  }
`

const useFilesUploadedSubscription = refetch => {
  useSubscription(FILES_UPLOADED_SUBSCRIPTION, { onData: () => refetch() })
}

const useFilesDeletedSubscription = refetch => {
  useSubscription(FILES_DELETED_SUBSCRIPTION, { onData: () => refetch() })
}

const useFileUpdatedSubscription = refetch => {
  useSubscription(FILE_UPDATED_SUBSCRIPTION, { onData: () => refetch() })
}

export {
  useFilesUploadedSubscription,
  useFilesDeletedSubscription,
  useFileUpdatedSubscription,
}
