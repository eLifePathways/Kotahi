/* eslint-disable react/prop-types */

import { useState, useEffect, useContext } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { debounce, set } from 'lodash'
import { useQuery, useMutation, useApolloClient } from '@apollo/client/react'
import { gql } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import { ConfigContext } from '../../../config/src'
import Submit from './Submit'
import query, { fragmentFields } from '../userManuscriptFormQuery'
import { AccessErrorPage, Spinner } from '../../../shared'
import gatherManuscriptVersions from '../../../../shared/manuscript_versions'
import {
  publishManuscriptMutation,
  setShouldPublishFieldMutation,
} from '../../../component-review/src/components/queries'
import { validateManuscriptSubmission } from '../../../../shared/manuscriptUtils'
import CommsErrorBanner from '../../../shared/CommsErrorBanner'
import {
  validateDoi,
  validateSuffix,
  VALIDATE_ORCID,
} from '../../../../shared/commsUtils'
import {
  UPDATE_PENDING_COMMENT,
  COMPLETE_COMMENTS,
  COMPLETE_COMMENT,
  DELETE_PENDING_COMMENT,
} from '../../../component-formbuilder/src/components/builderComponents/ThreadedDiscussion/queries'
import useChat from '../../../../hooks/useChat'
import mutations from '../../../component-dashboard/src/graphql/mutations'

export const updateMutation = gql`
  mutation($id: ID!, $input: String) {
    updateManuscript(id: $id, input: $input) {
      id
      ${fragmentFields}
    }
  }
`

const submitMutation = gql`
  mutation($id: ID!, $input: String) {
    submitManuscript(id: $id, input: $input) {
      id
      ${fragmentFields}
    }
  }
`

const createNewVersionMutation = gql`
  mutation($id: ID!) {
    createNewVersion(id: $id) {
      id
      ${fragmentFields}
    }
  }
`

const createFileMutation = gql`
  mutation ($file: Upload!, $meta: FileMetaInput!) {
    createFile(file: $file, meta: $meta) {
      id
      created
      name
      updated
      name
      tags
      objectId
      storedObjects {
        key
        mimetype
        url
      }
    }
  }
`

const deleteFileMutation = gql`
  mutation ($id: ID!) {
    deleteFile(id: $id)
  }
`

let debouncers = {}

const useValidateORCID = () => {
  const { refetch } = useQuery(VALIDATE_ORCID, {
    skip: true, // you should skip the initial query
  })

  const validationOrcid = inputValue => {
    const variables = {
      input: inputValue,
    }

    return refetch(variables)
  }

  return { validationOrcid }
}

const SubmitPage = ({ currentUser }) => {
  const navigate = useNavigate()
  const params = useParams()
  const location = useLocation()

  const { t } = useTranslation()
  const config = useContext(ConfigContext)
  const { urlFrag, instanceName } = config
  const [chatExpand] = useMutation(mutations.updateChatUI)
  const { validationOrcid } = useValidateORCID()

  useEffect(() => {
    return () => {
      Object.values(debouncers).forEach(d => d.flush())
      debouncers = {}
    }
  }, [])

  const submitPurpose = 'submit'
  const decisionPurpose = 'decision'
  const reviewPurpose = 'review'

  const { data, loading, error } = useQuery(
    query,
    {
      variables: {
        id: params.version,
        groupId: config.groupId,
        submitPurpose,
        decisionPurpose,
        reviewPurpose,
      },
      partialRefetch: true,
    },
    { refetchOnMount: true },
  )

  let channelId

  let editorialChannel

  if (
    Array.isArray(data?.manuscript.channels) &&
    data?.manuscript.channels.length
  ) {
    editorialChannel = data?.manuscript.channels.find(c => c.type === 'all')
    channelId = editorialChannel?.id
  }

  const {
    hideDiscussionFromAuthors,
    hideDiscussionFromEditorsReviewersAuthors,
  } = config?.discussionChannel || {}

  const hideChat =
    hideDiscussionFromAuthors || hideDiscussionFromEditorsReviewersAuthors

  const channels = [
    ...(hideChat
      ? []
      : [
          {
            id: channelId,
            name: t('chat.Discussion with editorial team'),
            type: editorialChannel?.type,
          },
        ]),
  ]

  const chatProps = useChat(channels)

  const [update] = useMutation(updateMutation)
  const [submit] = useMutation(submitMutation)
  const [createNewVersion] = useMutation(createNewVersionMutation)
  const [publishManuscript] = useMutation(publishManuscriptMutation)
  const [createFile] = useMutation(createFileMutation)
  const [updatePendingComment] = useMutation(UPDATE_PENDING_COMMENT)
  const [completeComments] = useMutation(COMPLETE_COMMENTS)
  const [completeComment] = useMutation(COMPLETE_COMMENT)
  const [deletePendingComment] = useMutation(DELETE_PENDING_COMMENT)
  const [setShouldPublishField] = useMutation(setShouldPublishFieldMutation)

  const [deleteFile] = useMutation(deleteFileMutation, {
    update(cache, { data: { deleteFile: fileToDelete } }) {
      const id = cache.identify({
        __typename: 'File',
        id: fileToDelete,
      })

      cache.evict({ id })
    },
  })

  const [manuscriptChangedFields, setManuscriptChangedFields] = useState({
    submission: {},
  })

  const client = useApolloClient()

  if (loading) return <Spinner />

  if (error) {
    if (error.graphQLErrors.find(e => e.message === 'Not Authorised!')) {
      return <AccessErrorPage message={t('submitPage.unauthorized')} />
    }

    return <CommsErrorBanner error={error} />
  }

  const manuscript = data?.manuscript
  const submissionForm = data?.submissionForm?.structure
  const decisionForm = data?.decisionForm?.structure
  const reviewForm = data?.reviewForm?.structure

  const authorTeam = manuscript.teams.find(e => e.role === 'author')

  const authorMember = authorTeam?.members.find(
    m => m.user.id === currentUser.id,
  )

  if (['journal', 'prc'].includes(instanceName) && !authorMember) {
    return <AccessErrorPage message={t('submitPage.unauthorized')} />
  }

  const updateManuscript = (versionId, manuscriptDelta) => {
    return update({
      variables: {
        id: versionId,
        input: JSON.stringify(manuscriptDelta),
      },
    })
  }

  // This is passed as a custom onChange prop (not belonging/originating from Formik)
  // to support continuous auto-saving
  const handleChange = (value, path, versionId) => {
    const manuscriptDelta = {} // Only the changed fields
    set(manuscriptDelta, path, value)
    setManuscriptChangedFields(s => {
      return {
        submission: {
          ...s.submission,
          ...manuscriptDelta.submission,
        },
      }
    })
    debouncers[path] = debouncers[path] || debounce(updateManuscript, 3000)
    return debouncers[path](versionId, manuscriptDelta)
  }

  const republish = async (manuscriptId, groupId) => {
    const fieldErrors = await validateManuscriptSubmission(
      {
        ...JSON.parse(manuscript.submission),
        ...manuscriptChangedFields.submission,
      },
      submissionForm,
      validateDoi(client),
      validateSuffix(client, groupId),
    )

    if (fieldErrors.filter(Boolean).length) {
      return [
        {
          stepLabel: 'publishing',
          errorMessage:
            'This manuscript has incomplete or invalid fields. Please correct these and try again.',
        },
      ]
    }

    await updateManuscript(manuscriptId, manuscriptChangedFields)

    const result = (
      await publishManuscript({
        variables: {
          id: manuscriptId,
        },
      })
    )?.data?.publishManuscript

    if (result?.steps?.some(step => !step.succeeded)) return result

    if (['journal', 'prc'].includes(config.instanceName)) {
      navigate(`${urlFrag}/dashboard`)
    } else if (['preprint1', 'preprint2'].includes(config.instanceName)) {
      navigate(`${urlFrag}/admin/manuscripts`)
    }

    return null
  }

  const onSubmit = async versionId => {
    await updateManuscript(versionId, manuscriptChangedFields)

    const delta = {
      status: location.pathname.includes('/evaluation')
        ? 'evaluated'
        : 'submitted',
    }

    await submit({
      variables: {
        id: versionId,
        input: JSON.stringify(delta),
      },
    })

    if (['journal', 'prc'].includes(config.instanceName)) {
      navigate(`${urlFrag}/dashboard`)
    }

    if (['preprint1', 'preprint2'].includes(config.instanceName)) {
      navigate(`${urlFrag}/admin/manuscripts`)
    }
  }

  const versions = gatherManuscriptVersions(manuscript)

  const manuscriptLatestVersionId = versions[0].manuscript.id

  const threadedDiscussionProps = {
    threadedDiscussions: data.threadedDiscussions,
    updatePendingComment,
    completeComment,
    completeComments,
    deletePendingComment,
    currentUser,
    firstVersionManuscriptId: manuscript.parentId || manuscript.id,
    versions,
    currentVersion: manuscript,
  }

  return (
    <Submit
      channelId={channelId}
      channels={channels}
      chatExpand={chatExpand}
      chatProps={chatProps}
      createFile={createFile}
      createNewVersion={createNewVersion}
      currentUser={currentUser}
      decisionForm={decisionForm}
      deleteFile={deleteFile}
      hideChat={hideChat}
      manuscript={manuscript}
      manuscriptLatestVersionId={manuscriptLatestVersionId}
      onChange={handleChange}
      onSubmit={onSubmit}
      parent={manuscript}
      republish={republish}
      reviewForm={reviewForm}
      setShouldPublishField={
        currentUser.groupRoles.includes('groupAdmin')
          ? setShouldPublishField
          : null
      }
      submissionForm={submissionForm}
      threadedDiscussionProps={threadedDiscussionProps}
      updateManuscript={updateManuscript}
      validateDoi={validateDoi(client)}
      validateSuffix={validateSuffix(client, config.groupId)}
      validationOrcid={validationOrcid}
      versions={versions}
    />
  )
}

SubmitPage.propTypes = {
  // history: ReactRouterPropTypes.history.isRequired,
  // match: ReactRouterPropTypes.match.isRequired,
}

export default SubmitPage
