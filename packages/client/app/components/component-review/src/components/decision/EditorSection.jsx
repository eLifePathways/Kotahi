/* eslint-disable react-hooks/rules-of-hooks */

/* eslint-disable react/prop-types */

import { useContext } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import FullWaxEditor from '../../../../wax-collab/src/FullWaxEditor'
import { ConfigContext } from '../../../../config/src'
import { Info } from '../style'
import { useGetSpecificFiles } from '../../../../asset-manager/src/queries'
import ModalContext from '../../../../asset-manager/src/ui/Modal/ModalContext'

const EditorSection = ({
  manuscript,
  saveSource,
  saveComments,
  readonly,
  currentUser,
  editorSection,
  queryAI,
}) => {
  const {
    submission: { submissionPage = {} },
  } = useContext(ConfigContext)

  const {
    showModal,
    hideModal,
    modals,
    modalKey,
    data: modalData,
  } = useContext(ModalContext)

  const { client, query } = useGetSpecificFiles()

  const allowAuthorSubmitFormWithBlankEditor =
    submissionPage?.submitOptions === 'allowAuthorSubmitFormWithBlankEditor'

  const manuscriptFile = manuscript?.files?.find(file =>
    file.tags.includes('manuscript'),
  )

  const { t } = useTranslation()

  if (
    ((manuscriptFile &&
      manuscriptFile.storedObjects[0].mimetype !==
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document') ||
      !manuscriptFile) &&
    allowAuthorSubmitFormWithBlankEditor === false
  )
    return <Info>{t('editorSection.noSupportedView')}</Info>

  const editorTeam = manuscript?.teams?.find(team => {
    return team.role.toLowerCase().includes('editor')
  })

  const authorTeam = manuscript?.teams?.find(team => {
    return team.role.toLowerCase().includes('author')
  })

  const currentUserIsAuthor =
    authorTeam && currentUser
      ? authorTeam.members.find(member => member.user.id === currentUser.id)
      : false

  const currentUserIsEditor =
    editorTeam && currentUser
      ? editorTeam.members.find(member => member.user.id === currentUser.id)
      : false

  const isAuthorMode = !!(currentUserIsAuthor && readonly)

  const config = useContext(ConfigContext)

  const editorType =
    editorSection === 'CPEditor' ? 'AiControlPanelEditor' : 'AiAuthorEditor'

  const aiConfig = {
    AskAiContentTransformation: queryAI,
    AiOn:
      config?.groupIdentity?.toggleAi && config?.groupIdentity?.[editorType],
    FreeTextPromptsOn: config?.groupIdentity?.AiFreeTextPrompts,
    CustomPromptsOn: config?.groupIdentity?.customAiPrompts,
    CustomPrompts: config?.groupIdentity?.customAiInputs || [],
  }

  const onAssetManager = manuscriptId =>
    new Promise(resolve => {
      const handleImport = async selectedFileIds => {
        const { data } = await client.query({
          query,
          variables: { ids: selectedFileIds },
        })

        const { getSpecificFiles } = data

        const alteredFiles = getSpecificFiles.map(getSpecificFile => {
          const mediumSizeFile = getSpecificFile.storedObjects.find(
            storedObject => storedObject.type === 'medium',
          )

          return {
            source: mediumSizeFile.url,
            mimetype: mediumSizeFile.mimetype,
            ...getSpecificFile,
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
        <FullWaxEditor
          aiConfig={aiConfig}
          authorComments={isAuthorMode}
          getComments={saveComments}
          manuscriptId={manuscript.id}
          onAssetManager={onAssetManager}
          readonly={readonly}
          saveSource={saveSource}
          setComments={() => JSON.parse(manuscript.meta.comments) || []}
          useComments={
            !!(
              currentUserIsEditor ||
              currentUser.groupRoles.includes('groupAdmin') ||
              currentUser.groupRoles.includes('groupManager') ||
              (currentUserIsAuthor && readonly)
            )
          }
          user={currentUser}
          value={manuscript.meta.source}
        />
      </div>
    </>
  )
}

EditorSection.propTypes = {
  manuscript: PropTypes.shape({
    files: PropTypes.arrayOf(
      PropTypes.shape({
        storedObjects: PropTypes.arrayOf(PropTypes.object.isRequired),
        tags: PropTypes.arrayOf(PropTypes.string.isRequired),
      }),
    ),
    meta: PropTypes.shape({
      source: PropTypes.string,
    }).isRequired,
  }).isRequired,
  readonly: PropTypes.bool,
}

EditorSection.defaultProps = {
  readonly: false,
}

export default EditorSection
