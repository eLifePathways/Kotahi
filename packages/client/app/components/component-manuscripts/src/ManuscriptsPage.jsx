/* eslint-disable react-hooks/immutability */
/* eslint-disable react/prop-types */

/* eslint-disable no-shadow */

import { useState, useContext, useRef, useEffect } from 'react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useTranslation } from 'react-i18next'
import {
  useQuery,
  useMutation,
  useSubscription,
  useApolloClient,
  useLazyQuery,
} from '@apollo/client'
import fnv from 'fnv-plus'
import { saveAs } from 'file-saver'
import { ConfigContext } from '../../config/src'
import {
  GET_MANUSCRIPTS_AND_FORM,
  DELETE_MANUSCRIPT,
  IMPORT_MANUSCRIPTS,
  IMPORTED_MANUSCRIPTS_SUBSCRIPTION,
  GET_SYSTEM_WIDE_DISCUSSION_CHANNEL,
  ARCHIVE_MANUSCRIPTS,
  GET_MANUSCRIPTS_DATA,
  UNARCHIVE_MANUSCRIPTS,
} from '../../../queries'
import { updateMutation } from '../../component-submit/src/components/SubmitPage'
import { publishManuscriptMutation } from '../../component-review/src/components/queries'
import Manuscripts from './Manuscripts'
import {
  extractFilters,
  extractSortData,
  extractArchived,
  URI_PAGENUM_PARAM,
  useQueryParams,
} from '../../../shared/urlParamUtils'
import { validateDoi, validateSuffix } from '../../../shared/commsUtils'
import useChat from '../../../hooks/useChat'
import { updateManuscriptMutation } from '../../component-review/src/components/DecisionPage'
import mutations from '../../component-dashboard/src/graphql/mutations'

const ManuscriptsPage = ({ currentUser, history }) => {
  const { t } = useTranslation()
  const [doUpdateManuscript] = useMutation(updateManuscriptMutation)
  const config = useContext(ConfigContext)
  const { urlFrag } = config
  const chatRoomId = fnv.hash(config.clientUrl).hex()

  /** Returns an array of column names, e.g.
   *  ['shortId', 'created', 'titleAndAbstract', 'submission.topic', 'status'] */
  const configuredColumnNames = (config?.manuscript?.tableColumns || '')
    .split(',')
    .map(columnName => columnName.trim())

  const [isImporting, setIsImporting] = useState(false)
  const applyQueryParams = useQueryParams()

  const uriQueryParams = new URLSearchParams(history.location.search)
  const page = uriQueryParams.get(URI_PAGENUM_PARAM) || 1
  const sortName = extractSortData(uriQueryParams).name
  const sortDirection = extractSortData(uriQueryParams).direction
  const filters = extractFilters(uriQueryParams)
  const archived = extractArchived(uriQueryParams)
  const limit = config?.manuscript?.paginationCount || 10

  const queryObject = useQuery(GET_MANUSCRIPTS_AND_FORM, {
    variables: {
      sort: sortName
        ? { field: sortName, isAscending: sortDirection === 'ASC' }
        : null,
      offset: (page - 1) * limit,
      limit,
      filters,
      archived,
      timezoneOffsetMinutes: new Date().getTimezoneOffset(),
      groupId: config.groupId,
    },
    fetchPolicy: 'network-only',
  })

  // GET_SYSTEM_WIDE_DISCUSSION_ID
  const systemWideDiscussionChannel = useQuery(
    GET_SYSTEM_WIDE_DISCUSSION_CHANNEL,
    {
      variables: { groupId: config.groupId },
    },
  )

  useSubscription(IMPORTED_MANUSCRIPTS_SUBSCRIPTION, {
    onSubscriptionData: data => {
      const {
        subscriptionData: {
          data: { manuscriptsImportStatus },
        },
      } = data

      setIsImporting(false)
      applyQueryParams({ [URI_PAGENUM_PARAM]: 1 })

      toast.success(
        manuscriptsImportStatus && 'Manuscripts successfully imported',
        { hideProgressBar: true },
      )
    },
  })

  const [importManuscripts] = useMutation(IMPORT_MANUSCRIPTS)

  const importManuscriptsAndRefetch = async () => {
    setIsImporting(true)

    await importManuscripts({
      variables: {
        groupId: config.groupId,
      },
    })
  }

  // Used Lazy Query, as it's fetching data upon a particular trigger
  const [getManuscriptsData, { loading, error, data, refetch }] =
    useLazyQuery(GET_MANUSCRIPTS_DATA)

  const selectedNewManuscriptsRef = useRef([])

  // Once export action is selected, the following block would trigger query to fetch data from the backend.
  const exportManuscriptsToJson = async selectedNewManuscripts => {
    try {
      selectedNewManuscriptsRef.current = selectedNewManuscripts

      if (selectedNewManuscripts) {
        if (refetch) {
          const refetchData = await refetch({
            selectedManuscripts: selectedNewManuscripts,
          })

          const extractedData = refetchData.data.getManuscriptsData.map(
            /* eslint-disable-next-line no-unused-vars */
            ({ __typename, ...rest }) => rest,
          )

          downloadJSON(extractedData, 'exportedData.json')
        } else {
          // If refetch is not available, execute the query again
          getManuscriptsData({
            variables: { selectedManuscripts: selectedNewManuscripts },
          })
        }
      }
    } catch (error) {
      console.error('Error exporting manuscripts:', error)
    }
  }

  // To respond to the JSON data fetched when export is selected as action
  useEffect(() => {
    if (!loading && !error && data) {
      const extractedData = data.getManuscriptsData.map(
        /* eslint-disable-next-line no-unused-vars */
        ({ __typename, ...rest }) => rest,
      )

      downloadJSON(extractedData, 'exportedData.json')
    }
  }, [loading, error, data])

  // Function to download the JSON data
  const downloadJSON = (data, fileName) => {
    const jsonBlob = new Blob([JSON.stringify(data)], {
      type: 'application/json',
    })

    saveAs(jsonBlob, fileName)
  }

  const [doArchiveManuscripts] = useMutation(ARCHIVE_MANUSCRIPTS, {
    update(cache, { data: { ids } }) {
      const cacheIds = cache.identify({
        __typename: 'Manuscript',
        id: ids,
      })

      cache.evict({ cacheIds })
    },
  })

  const [doUnarchiveManuscripts] = useMutation(UNARCHIVE_MANUSCRIPTS, {
    update(cache, { data: { ids } }) {
      const cacheIds = cache.identify({
        __typename: 'Manuscript',
        id: ids,
      })

      cache.evict({ cacheIds })
    },
  })

  const [deleteManuscriptMutation] = useMutation(DELETE_MANUSCRIPT, {
    update(cache, { data: { id } }) {
      const cacheId = cache.identify({
        __typename: 'Manuscript',
        id,
      })

      cache.evict({ cacheId })
    },
  })

  const deleteManuscriptMutations = id => {
    deleteManuscriptMutation({ variables: { id } })
  }

  const setReadyToEvaluateLabels = id => {
    update({
      variables: {
        id,
        input: JSON.stringify({
          submission: {
            $customStatus: 'readyToEvaluate',
          },
        }),
      },
    })
  }

  const unsetCustomStatus = id => {
    update({
      variables: {
        id,
        input: JSON.stringify({
          submission: {
            $customStatus: null,
          },
        }),
      },
    })
  }

  const archiveManuscripts = selectedNewManuscript => {
    doArchiveManuscripts({
      variables: { ids: selectedNewManuscript },
    })
  }

  const unarchiveManuscripts = selectedNewManuscript => {
    doUnarchiveManuscripts({
      variables: { ids: selectedNewManuscript },
    })
  }

  const [update] = useMutation(updateMutation)
  const [chatExpand] = useMutation(mutations.updateChatUI)

  const [doPublishManuscript] = useMutation(publishManuscriptMutation)
  const client = useApolloClient()

  const publishManuscript = async manuscriptId => {
    return doPublishManuscript({
      variables: { id: manuscriptId },
    })
  }

  const shouldAllowBulkImport = config?.manuscript?.manualImport

  const groupManagerDiscussionChannel =
    systemWideDiscussionChannel?.data?.systemWideDiscussionChannel

  const { hideDiscussionFromGroupAdminsManagers } =
    config?.discussionChannel || {}

  const channels = [
    ...(hideDiscussionFromGroupAdminsManagers
      ? []
      : [
          {
            id: groupManagerDiscussionChannel?.id,
            name: t('chat.Group Manager discussion'),
            type: groupManagerDiscussionChannel?.type,
          },
        ]),
  ]

  const chatProps = useChat(channels)

  return (
    <Manuscripts
      applyQueryParams={applyQueryParams}
      archived={archived}
      archiveManuscripts={archiveManuscripts}
      channels={channels}
      chatExpand={chatExpand}
      chatProps={chatProps}
      chatRoomId={chatRoomId}
      configuredColumnNames={configuredColumnNames}
      currentUser={currentUser}
      deleteManuscriptMutations={deleteManuscriptMutations}
      doUpdateManuscript={doUpdateManuscript}
      exportManuscriptsToJson={exportManuscriptsToJson}
      getManuscriptsData={getManuscriptsData}
      groupManagerDiscussionChannel={groupManagerDiscussionChannel}
      hideManuscriptsChat={hideDiscussionFromGroupAdminsManagers}
      history={history}
      importManuscripts={importManuscriptsAndRefetch}
      isImporting={isImporting}
      page={page}
      publishManuscript={publishManuscript}
      queryObject={queryObject}
      setReadyToEvaluateLabels={setReadyToEvaluateLabels}
      shouldAllowBulkImport={shouldAllowBulkImport}
      sortDirection={sortDirection}
      sortName={sortName}
      unarchiveManuscripts={unarchiveManuscripts}
      unsetCustomStatus={unsetCustomStatus}
      uriQueryParams={uriQueryParams}
      urlFrag={urlFrag}
      validateDoi={validateDoi(client)}
      validateSuffix={validateSuffix(client, config.groupId)}
    />
  )
}

export default ManuscriptsPage
