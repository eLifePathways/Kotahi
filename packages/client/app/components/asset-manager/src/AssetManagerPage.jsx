/* eslint-disable react/prop-types */

import { AssetManager } from './ui'
import {
  useGetEntityFiles,
  useUploadFiles,
  useDeleteFiles,
  useUpdateFile,
  useFilesUploadedSubscription,
  useFilesDeletedSubscription,
  useFileUpdatedSubscription,
} from './queries'

const Connected = props => {
  const { data, isOpen, hideModal } = props
  const { manuscriptId, withImport, handleImport } = data

  const {
    data: filesData,
    networkStatus,
    refetch,
  } = useGetEntityFiles(manuscriptId)

  const [uploadFiles] = useUploadFiles()
  const [deleteFiles] = useDeleteFiles()
  const [updateFile] = useUpdateFile()

  useFilesUploadedSubscription(refetch)
  useFilesDeletedSubscription(refetch)
  useFileUpdatedSubscription(refetch)

  return (
    <AssetManager
      deleteFiles={ids => deleteFiles({ variables: { ids } })}
      files={filesData?.getEntityFiles}
      handleImport={handleImport}
      hideModal={hideModal}
      isOpen={isOpen}
      loading={networkStatus === 1}
      manuscriptId={manuscriptId}
      refetch={(id, sortingParams) =>
        refetch({ input: { entityId: id, sortingParams, includeInUse: true } })
      }
      refetching={networkStatus === 4 || networkStatus === 2}
      updateFile={(fileId, fileData) =>
        updateFile({ variables: { input: { id: fileId, ...fileData } } })
      }
      uploadFiles={(id, files) =>
        uploadFiles({
          variables: { files, fileType: 'manuscriptImage', entityId: id },
        })
      }
      withImport={withImport}
    />
  )
}

export default Connected
