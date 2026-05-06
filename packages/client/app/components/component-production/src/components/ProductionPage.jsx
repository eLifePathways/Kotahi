/* eslint-disable react/prop-types */
/* eslint-disable promise/catch-or-return, promise/always-return */

import React, { useContext } from 'react'
import { useParams } from 'react-router-dom'
import { gql } from '@apollo/client'
import { useQuery, useMutation, useApolloClient } from '@apollo/client/react'

import Production from './Production'
import { ConfigContext } from '../../../config/src'
import { Spinner, CommsErrorBanner } from '../../../shared'
import { GET_SPECIFIC_FILES } from '../../../asset-manager/src/queries'
import ModalContext from '../../../asset-manager/src/ui/Modal/ModalContext'
import DownloadPdfComponent from './DownloadPdf'
import DownloadJatsComponent from './DownloadJats'
import { waxAiToolSystem } from '../../helpers'

const fileFragment = `
  files {
    id
    name
    tags
    created
    storedObjects {
      type
      key
      mimetype
      size
      url
    }
  }
`

const formFields = `
  structure {
    name
    description
    haspopup
    popuptitle
    popupdescription
    children {
      title
      shortDescription
      id
      component
      name
      description
      doiValidation
      doiUniqueSuffixValidation
      allowFutureDatesOnly
      placeholder
      permitPublishing
      parse
      format
      options {
        id
        label
        labelColor
        defaultValue
        value
      }
      validate {
        id
        label
        value
      }
      validateValue {
        minChars
        maxChars
        minSize
      }
    }
  }
`

const fragmentFields = `
  id
  created
  status
  teams {
    role
    members {
      user {
        id
        created
      }
    }
  }
  ${fileFragment}
  submission
  meta {
    source
    comments
    manuscriptId
    previousVersions {
      source
      created
      user {
        id
        userName
      }
    }
  }
  authorFeedback {
    text
    fileIds
    edited
    submitted
    submitter {
      username
      defaultIdentity {
        name
      }
      id
    }
    assignedAuthors {
      authorName
      assignedOnDate
    }
    previousSubmissions {
      text
      fileIds
      edited
      submitted
      submitter {
        username
        id
      }
    }
  }
`

const query = gql`
  query($id: ID!, $groupId: ID!, $isCms: Boolean!) {
    manuscript(id: $id) {
      ${fragmentFields}
      manuscriptVersions {
        ${fragmentFields}
      }
    }

    submissionForm: formForPurposeAndCategory(purpose: "submit", category: "submission", groupId: $groupId) {
      ${formFields}
    }

    articleTemplate(groupId: $groupId, isCms: $isCms) {
      id
      name
      groupId
      ${fileFragment}
      article
      css
    }
  }
`

const useChatGpt = gql`
  query OpenAi(
    $input: UserMessage!
    $groupId: ID!
    $history: [OpenAiMessage]
    $system: SystemMessage
    $format: String
  ) {
    openAi(
      input: $input
      groupId: $groupId
      history: $history
      format: $format
      system: $system
    )
  }
`

export const updateMutation = gql`
mutation($id: ID!, $input: String) {
  updateManuscript(id: $id, input: $input) {
    id
    ${fragmentFields}
  }
}
`

const submitAuthorProofingFeedbackMutation = gql`
  mutation($id: ID!, $input: String) {
    submitAuthorProofingFeedback(id: $id, input: $input) {
      id
      ${fragmentFields}
    }
  }
`

const showAuthorProofingMode = (
  currentUserRole,
  manuscript,
  updateManuscript,
) => {
  // Admin and Group Manager roles don't need to be in author proofing mode
  if (
    currentUserRole.isAdmin ||
    currentUserRole.isGroupAdmin ||
    currentUserRole.isGroupManager
  )
    return false

  const isAuthorProofingAssignedToAuthor =
    manuscript.status === 'assigned' && currentUserRole.isAuthor

  if (isAuthorProofingAssignedToAuthor) {
    updateManuscript(manuscript.id, { status: 'inProgress' })
  }

  // Author proofing authors and assigned edtior of the manuscript can only be in author proofing mode
  return (
    ['assigned', 'inProgress', 'completed'].includes(manuscript.status) &&
    currentUserRole.isAuthor
  )
}

export const updateTemplateMutation = gql`
  mutation($id: ID!, $input: UpdateTemplateInput!) {
    updateTemplate(id: $id, input: $input) {
      id
      name
      groupId
      ${fileFragment}
      article
      css
    }
  }
`

const ProductionPage = ({ currentUser }) => {
  const params = useParams()
  const { groupId, controlPanel, submission } = useContext(ConfigContext)
  const client = useApolloClient()
  const {
    showModal,
    hideModal,
    modals,
    modalKey,
    data: modalData,
  } = useContext(ModalContext)

  const onAssetManager = manuscriptId =>
    new Promise(resolve => {
      const handleImport = async selectedFileIds => {
        const { data } = await client.query({
          query: GET_SPECIFIC_FILES,
          variables: { ids: selectedFileIds },
        })

        const alteredFiles = data.getSpecificFiles.map(file => {
          const mediumSizeFile = file.storedObjects.find(
            storedObject => storedObject.type === 'medium',
          )

          return {
            source: mediumSizeFile.url,
            mimetype: mediumSizeFile.mimetype,
            ...file,
          }
        })

        hideModal()
        resolve(alteredFiles)
      }

      showModal('assetManagerEditor', {
        manuscriptId,
        withImport: true,
        handleImport,
      })
    })
  const [makingPdf, setMakingPdf] = React.useState(false)
  const [makingJats, setMakingJats] = React.useState(false)
  // const [saving, setSaving] = React.useState(false)
  // const [downloading, setDownloading] = React.useState(false)

  // const [currentJats, setCurrentJats] = React.useState({
  //   xml: '',
  //   error: false,
  // })

  const { refetch } = useQuery(useChatGpt, {
    fetchPolicy: 'network-only',
    skip: true,
    // onError: err => {
    //   console.log(err)
    //   if (err.toString().includes('Missing access key')) {
    //     // onInfoModal('Access key is missing or invalid')
    //   } else if (
    //     err.toString().includes('Request failed with status code 429')
    //   ) {
    //     // showOpenAiRateLimitModal()
    //   } else {
    //     // showGenericErrorModal()
    //   }
    // },
  })

  const [update] = useMutation(updateMutation)

  const [submitAuthorProofingFeedback] = useMutation(
    submitAuthorProofingFeedbackMutation,
  )

  const [updateTempl] = useMutation(updateTemplateMutation)

  const updateManuscript = async (versionId, manuscriptDelta) => {
    const newQuery = await update({
      variables: {
        id: versionId,
        input: JSON.stringify(manuscriptDelta),
      },
    })

    return newQuery
  }

  const updateTemplate = (id, input) =>
    updateTempl({ variables: { id, input } })

  const { data, loading, error } = useQuery(query, {
    variables: {
      id: params.version,
      groupId,
      isCms: false,
    },
  })

  if (loading) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />

  const manuscript = {
    ...data.manuscript,
    submission: JSON.parse(data.manuscript.submission),
  }

  const {
    submissionForm,
    articleTemplate,
    manuscript: unparsedManuscript,
  } = data

  const addNewVersion = async newVersion => {
    // This adds a new version to the top of the previousVersions stack
    // console.log('in update version list!')
    // get current manuscript version list
    const existing = manuscript?.meta?.previousVersions || []

    if (existing[0]?.source && existing[0].source === newVersion.source) {
      // if this is the same as the last version, don't resave
      return false
    }

    // add new version to the top to the stack
    const updateDelta = {
      meta: { previousVersions: [newVersion, ...existing] },
    }

    // console.log('Delta to send: ', updateDelta)

    // save this as a mutation to the manuscript
    const newQuery = await update({
      variables: {
        id: manuscript.id,
        input: JSON.stringify(updateDelta),
      },
    })

    // console.log('saved!', newQuery)
    return newQuery
  }

  // Get 'currentUserRole' for the manuscript version isAdmin, isGroupManager, isAuthor, isEditor
  const currentUserRole = {}

  const { globalRoles = [] } = currentUser
  currentUserRole.isAdmin = globalRoles.includes('admin')
  currentUserRole.isGroupAdmin = currentUser.groupRoles.includes('groupAdmin')
  currentUserRole.isGroupManager =
    currentUser.groupRoles.includes('groupManager')

  const authorTeam = manuscript.teams.find(team => team.role === 'author')

  const sortedAuthors = authorTeam?.members
    .slice()
    .sort(
      (a, b) =>
        Date.parse(new Date(b.created)) - Date.parse(new Date(a.created)),
    )

  currentUserRole.isAuthor =
    sortedAuthors && sortedAuthors[0]?.user?.id === currentUser.id // This logic might change in the future! Now it uses the latest created author

  const editorTeam = manuscript.teams.find(team => team.role === 'editor')

  currentUserRole.isEditor = editorTeam?.members[0]?.user?.id === currentUser.id // This will be 'true' only for 'editor' role assigned and not for 'handlingEditor' or 'senoirEditor'

  const isAuthorProofingMode = showAuthorProofingMode(
    currentUserRole,
    manuscript,
    updateManuscript,
  ) // If true, we are in author proofing mode

  // 'currentUser' is assigned author for proofing and has completed author proofing, we go read-only
  // If the currentUser is editor of the manuscript version, we go read-only (might change in the future!)
  // If the author proofing mode status is 'assigned' or 'inProgress' and currentUser is neither author nor editor, we go read-only
  const isReadOnlyMode =
    (isAuthorProofingMode && ['completed'].includes(manuscript.status)) ||
    (['assigned', 'inProgress'].includes(manuscript.status) &&
      !isAuthorProofingMode)

  const canSubmitWithBlankEditor =
    submission.submissionPage?.submitOptions ===
    'allowAuthorSubmitFormWithBlankEditor'

  // console.log('Author proofing mode: ', isAuthorProofingMode)
  // console.log('Read only mode: ', isReadOnlyMode)

  const form = submissionForm?.structure ?? {
    name: '',
    children: [],
    description: '',
    haspopup: 'false',
  }

  const queryAI = input => {
    const [userInput, highlightedText] = input.text

    const formattedInput = {
      text: [`${userInput}.\nHighlighted text: ${highlightedText}`],
    }

    return new Promise(resolve => {
      refetch({
        system: waxAiToolSystem,
        input: formattedInput,
        groupId,
      }).then(({ data: { openAi } }) => {
        const {
          message: { content },
        } = JSON.parse(openAi)

        resolve(content)
      })
    })
  }

  const ModalComponent = modals?.[modalKey]

  return (
    <>
      {modalKey && ModalComponent && (
        <ModalComponent
          data={modalData}
          hideModal={hideModal}
          isOpen={modalKey !== undefined}
        />
      )}
      <div style={{ width: '100%' }}>
        {makingPdf ? (
          <DownloadPdfComponent
            manuscript={manuscript}
            resetMakingPdf={() => {
              // refetch({ id: match.params.version, manuscriptId: manuscript.id })
              // console.log('resetMakingPdf fired!')
              setMakingPdf(false)
            }}
          />
        ) : null}
        {makingJats ? (
          <DownloadJatsComponent
            manuscript={manuscript}
            resetMakingJats={() => {
              setTimeout(() => {
                setMakingJats(false)
              }, 1000)
            }}
          />
        ) : null}
        <Production
          addNewVersion={addNewVersion}
          articleTemplate={articleTemplate}
          canSubmitWithBlankEditor={canSubmitWithBlankEditor}
          client={client}
          currentUser={currentUser}
          currentUserRole={currentUserRole}
          displayShortIdAsIdentifier={controlPanel?.displayManuscriptShortId}
          file={manuscript.files.find(file => file.tags.includes('manuscript'))}
          form={form}
          isAuthorProofingVersion={isAuthorProofingMode}
          isReadOnlyVersion={isReadOnlyMode}
          makeJats={setMakingJats}
          makePdf={setMakingPdf}
          manuscript={manuscript}
          onAssetManager={onAssetManager}
          queryAI={queryAI}
          submitAuthorProofingFeedback={submitAuthorProofingFeedback}
          unparsedManuscript={unparsedManuscript}
          updateManuscript={(a, b) => {
            // TODO: This might need to be different based on value of isAuthorProofingMode?

            // console.log('in update manuscript!')
            updateManuscript(a, b)
          }}
          updateTemplate={updateTemplate}
        />
      </div>
    </>
  )
}

ProductionPage.propTypes = {
  // match: ReactRouterPropTypes.match.isRequired,
}

export default ProductionPage
