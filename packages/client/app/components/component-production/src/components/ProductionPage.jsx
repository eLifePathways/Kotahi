/* eslint-disable promise/catch-or-return, promise/always-return */

import React, { useCallback, useContext, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useApolloClient } from '@apollo/client/react'

import Production from './Production'
import { ConfigContext } from '../../../config/src'
import { Spinner, CommsErrorBanner } from '../../../shared'
import ModalContext from '../../../asset-manager/src/ui/Modal/ModalContext'
import DownloadPdfComponent from './DownloadPdf'
import DownloadJatsComponent from './DownloadJats'
import { waxAiToolSystem } from '../../helpers'
import { useCurrentUser } from '../../../../pages/hooks/useCurrentUser'

import {
  GET_SPECIFIC_FILES,
  CHAT_GPT,
  PRODUCTION_MANUSCRIPT,
  PRODUCTION_MANUSCRIPT_UPDATE,
  SUBMIT_AUTHOR_PROOFING_FEEDBACK,
  UPDATE_TEMPLATE,
} from '../../../../queries'

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

const ProductionPage = () => {
  const params = useParams()
  const currentUser = useCurrentUser()
  const { groupId, controlPanel, submission } = useContext(ConfigContext)
  const client = useApolloClient()
  const {
    showModal,
    hideModal,
    modals,
    modalKey,
    data: modalData,
  } = useContext(ModalContext)

  const onAssetManager = useCallback(
    manuscriptId =>
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
      }),
    [client, showModal, hideModal],
  )

  const [makingPdf, setMakingPdf] = React.useState(false)
  const [makingJats, setMakingJats] = React.useState(false)
  // const [saving, setSaving] = React.useState(false)
  // const [downloading, setDownloading] = React.useState(false)

  // const [currentJats, setCurrentJats] = React.useState({
  //   xml: '',
  //   error: false,
  // })

  const { refetch } = useQuery(CHAT_GPT, {
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

  const [update] = useMutation(PRODUCTION_MANUSCRIPT_UPDATE)

  const [submitAuthorProofingFeedback] = useMutation(
    SUBMIT_AUTHOR_PROOFING_FEEDBACK,
  )

  const [updateTempl] = useMutation(UPDATE_TEMPLATE)

  const updateManuscript = useCallback(
    async (versionId, manuscriptDelta) => {
      const newQuery = await update({
        variables: {
          id: versionId,
          input: JSON.stringify(manuscriptDelta),
        },
      })

      return newQuery
    },
    [update],
  )

  const updateTemplate = useCallback(
    (id, input) => updateTempl({ variables: { id, input } }),
    [updateTempl],
  )

  const { data, loading, error } = useQuery(PRODUCTION_MANUSCRIPT, {
    variables: {
      id: params.version,
      groupId,
      isCms: false,
    },
  })

  const manuscript = useMemo(
    () =>
      data?.manuscript && {
        ...data.manuscript,
        submission: JSON.parse(data.manuscript.submission),
      },
    [data],
  )

  const addNewVersion = useCallback(
    async newVersion => {
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
    },
    [manuscript, update],
  )

  // Get 'currentUserRole' for the manuscript version isAdmin, isGroupManager, isAuthor, isEditor
  const currentUserRole = useMemo(() => {
    const role = {}

    const { globalRoles = [] } = currentUser
    role.isAdmin = globalRoles.includes('admin')
    role.isGroupAdmin = currentUser.groupRoles.includes('groupAdmin')
    role.isGroupManager = currentUser.groupRoles.includes('groupManager')

    if (!manuscript) return role

    const authorTeam = manuscript.teams.find(team => team.role === 'author')

    const sortedAuthors = authorTeam?.members
      .slice()
      .sort(
        (a, b) =>
          Date.parse(new Date(b.created)) - Date.parse(new Date(a.created)),
      )

    role.isAuthor =
      sortedAuthors && sortedAuthors[0]?.user?.id === currentUser.id // This logic might change in the future! Now it uses the latest created author

    const editorTeam = manuscript.teams.find(team => team.role === 'editor')

    role.isEditor = editorTeam?.members[0]?.user?.id === currentUser.id // This will be 'true' only for 'editor' role assigned and not for 'handlingEditor' or 'senoirEditor'

    return role
  }, [currentUser, manuscript])

  const isAuthorProofingMode = useMemo(
    () =>
      manuscript &&
      showAuthorProofingMode(currentUserRole, manuscript, updateManuscript),
    [currentUserRole, manuscript, updateManuscript],
  )

  // 'currentUser' is assigned author for proofing and has completed author proofing, we go read-only
  // If the currentUser is editor of the manuscript version, we go read-only (might change in the future!)
  // If the author proofing mode status is 'assigned' or 'inProgress' and currentUser is neither author nor editor, we go read-only
  const isReadOnlyMode =
    (isAuthorProofingMode && ['completed'].includes(manuscript?.status)) ||
    (['assigned', 'inProgress'].includes(manuscript?.status) &&
      !isAuthorProofingMode)

  const form = useMemo(
    () =>
      data?.submissionForm?.structure ?? {
        name: '',
        children: [],
        description: '',
        haspopup: 'false',
      },
    [data],
  )

  const queryAI = useCallback(
    input => {
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
    },
    [refetch, groupId],
  )

  if (loading) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />

  const { articleTemplate, manuscript: unparsedManuscript } = data

  const canSubmitWithBlankEditor =
    submission.submissionPage?.submitOptions ===
    'allowAuthorSubmitFormWithBlankEditor'

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
      <div>
        {makingPdf ? (
          <DownloadPdfComponent
            manuscript={manuscript}
            resetMakingPdf={() => {
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
          updateManuscript={updateManuscript}
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
