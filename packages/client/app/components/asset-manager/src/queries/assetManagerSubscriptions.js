import { useSubscription } from '@apollo/client/react'

import {
  FILES_DELETED,
  FILES_UPLOADED,
  FILE_UPDATED,
} from '../../../../queries'

const useFilesUploadedSubscription = refetch => {
  useSubscription(FILES_UPLOADED, { onData: () => refetch() })
}

const useFilesDeletedSubscription = refetch => {
  useSubscription(FILES_DELETED, { onData: () => refetch() })
}

const useFileUpdatedSubscription = refetch => {
  useSubscription(FILE_UPDATED, { onData: () => refetch() })
}

export {
  useFilesUploadedSubscription,
  useFilesDeletedSubscription,
  useFileUpdatedSubscription,
}
