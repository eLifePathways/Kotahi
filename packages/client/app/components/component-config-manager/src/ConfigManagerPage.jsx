import { useContext, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { ConfigContext } from '../../config/src'
import {
  UPDATE_CONFIG,
  GET_SUBMISSION_FORM,
  GET_CONFIG_AND_EMAIL_TEMPLATES,
  CREATE_FILE,
  DELETE_FILE,
  GENERATE_NEW_COAR_AUTH_TOKEN,
} from '../../../queries'

import { CommsErrorBanner, Spinner } from '../../shared'
import ConfigManagerForm from './ConfigManagerForm'

const ConfigManagerPage = () => {
  const config = useContext(ConfigContext)
  const [update] = useMutation(UPDATE_CONFIG)
  const [createFile] = useMutation(CREATE_FILE)
  const [deleteFile] = useMutation(DELETE_FILE)

  const [generateNewCoarAuthToken] = useMutation(GENERATE_NEW_COAR_AUTH_TOKEN)

  const [updateConfigStatus, setUpdateConfigStatus] = useState(null)

  const { data: metadata, loading: loadingMetadata } = useQuery(
    GET_SUBMISSION_FORM,
    {
      variables: {
        groupId: config.groupId,
      },
    },
  )

  const { loading, error, data } = useQuery(GET_CONFIG_AND_EMAIL_TEMPLATES, {
    variables: { id: config?.id },
    fetchPolicy: 'network-only',
  })

  const handleRefreshCoarAuthToken = async () => {
    const { data: coarRefreshData, errors: coarRefreshError } =
      await generateNewCoarAuthToken({
        variables: { name: 'coar', groupId: config.groupId },
        errorPolicy: 'all',
      })

    if (coarRefreshError) {
      console.error(
        'Error refreshing COAR Notify auth token:',
        coarRefreshError,
      )
    }

    return {
      authToken: coarRefreshData?.generateNewToken,
      error: coarRefreshError
        ? JSON.stringify(coarRefreshError[0], null, 2)
        : undefined,
    }
  }

  if ((loading && !data) || (!metadata && loadingMetadata)) return <Spinner />

  if (error) return <CommsErrorBanner error={error} />

  const updateConfig = async (configId, formData) => {
    setUpdateConfigStatus('pending')

    const response = await update({
      variables: {
        id: configId,
        input: {
          formData: JSON.stringify(formData),
          active: true,
        },
      },
    })

    setUpdateConfigStatus(response.data.updateConfig ? 'success' : 'failure')

    return response
  }

  const { submissionForm = {} } = metadata || {}

  const form = submissionForm?.structure ?? {
    name: '',
    children: [],
    description: '',
    haspopup: 'false',
  }

  return (
    <ConfigManagerForm
      config={data.config}
      configId={data.config.id}
      createFile={createFile}
      deleteFile={deleteFile}
      disabled={!data.config.active}
      emailTemplates={data.emailTemplates}
      formData={JSON.parse(data.config.formData)}
      onRefreshCoarAuthToken={handleRefreshCoarAuthToken}
      submissionForm={form}
      updateConfig={updateConfig}
      updateConfigStatus={updateConfigStatus}
    />
  )
}

export default ConfigManagerPage
