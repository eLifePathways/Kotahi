import React, { useContext, useRef, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { set, debounce } from 'lodash'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import DecisionReviews from './decision/DecisionReviews'
import AssignEditorsReviewers from './assignEditors/AssignEditorsReviewers'
import AssignEditor from './assignEditors/AssignEditor'
import AssignAuthorForProofing from './assignAuthors/AssignAuthorForProofing'
import EmailNotifications from './emailNotifications'
import ReadonlyFormTemplate from './metadata/ReadonlyFormTemplate'
import EditorSection from './decision/EditorSection'
import Publish from './Publish'
import { AdminSection } from './style'
import {
  HiddenTabs,
  SectionContent,
  SectionHeader,
  SectionRow,
  Title,
} from '../../../shared'
import DecisionAndReviews from '../../../component-submit/src/components/DecisionAndReviews'
import FormTemplate from '../../../component-submit/src/components/FormTemplate'
import TaskList from '../../../component-task-manager/src/TaskList'
import KanbanBoard from './KanbanBoard'
import InviteReviewer from './reviewers/InviteReviewer'
import { ConfigContext } from '../../../config/src'
import { getActiveTab } from '../../../../shared/manuscriptUtils'
import { transformTeamsToLegacy } from '../../../utils'
import CoarMessages from './coar/CoarMessages'

const TaskSectionRow = styled(SectionRow)`
  padding: 12px 0 18px;
`

const createBlankSubmissionBasedOnForm = form => {
  const allBlankedFields = {}
  const fieldNames = form?.children?.map(field => field.name)
  fieldNames.forEach(fieldName => set(allBlankedFields, fieldName, ''))
  return allBlankedFields.submission ?? {}
}

const DecisionVersion = ({
  allUsers,
  addReviewer,
  assignAuthorForProofing,
  roles,
  decisionForm,
  form,
  coarMessages,
  currentDecisionData,
  currentUser,
  version,
  versionNumber,
  isCoarLoading,
  isCurrentVersion,
  parent,
  updateManuscript, // To handle manuscript editing
  onChange, // To handle form editing
  onRefreshAdaStatus,
  makeDecision,
  lockUnlockReview,
  sendNotifyEmail,
  sendChannelMessage,
  publishManuscript,
  updateTeam,
  createTeam,
  updateReview,
  reviewForm,
  reviewers,
  teamLabels,
  canHideReviews,
  urlFrag,
  displayShortIdAsIdentifier,
  updateReviewJsonData,
  validateDoi,
  validateSuffix,
  createFile,
  deleteFile,
  threadedDiscussionProps,
  invitations,
  externalEmail,
  setExternalEmail,
  selectedEmail,
  setSelectedEmail,
  setShouldPublishField,
  selectedEmailIsBlacklisted,
  updateSharedStatusForInvitedReviewer,
  dois,
  refetch,
  updateTask,
  updateTasks,
  teams,
  removeAuthor,
  removeInvitation,
  removeReviewer,
  updateAda,
  updateTeamMember,
  updateCollaborativeTeamMember,
  updateTaskNotification,
  deleteTaskNotification,
  createTaskEmailNotificationLog,
  manuscriptLatestVersionId,
  emailTemplates,
  queryAI,
  unpublish,
}) => {
  const teamLabelsTransformed = transformTeamsToLegacy(teamLabels)

  const config = useContext(ConfigContext)

  const threadedDiscussionExtendedProps = {
    ...threadedDiscussionProps,
    manuscriptLatestVersionId,
    selectedManuscriptVersionId: version.id,
  }

  const isGroupManager = currentUser?.groupRoles?.includes('groupManager')
  const isGroupAdmin = currentUser?.groupRoles?.includes('groupAdmin')

  const isEditor = version?.teams
    .filter(t => ['editor', 'handlingEditor', 'seniorEditor'].includes(t.role))
    .some(t => t.members.some(m => m.user.id === currentUser?.id))

  const isAuthor = version?.teams
    .filter(t => ['author'].includes(t.role))
    .some(t => t.members.some(m => m.user.id === currentUser?.id))

  const authorProofingEnabled = config.controlPanel?.authorProofingEnabled // let's set this based on the config

  const canPublish =
    isGroupAdmin ||
    (isGroupManager && config.controlPanel?.groupManagersCanPublish) ||
    (isEditor && config.controlPanel?.editorsCanPublish)

  const debouncedSave = useCallback(
    debounce(source => {
      updateManuscript(version.id, { meta: { source } })
    }, 2000),
    [],
  )

  const debouncedSaveComments = useCallback(
    debounce(comments => {
      updateManuscript(version.id, {
        meta: { comments: JSON.stringify(comments) },
      })
    }, 500),
    [],
  )

  const { t } = useTranslation()
  useEffect(() => debouncedSave.flush, [])
  const location = useLocation()

  const activeTab = React.useMemo(
    () => getActiveTab(location, 'tab'),
    [location],
  )

  const addEditor = (manuscript, isCurrent, user) => {
    const isReadOnly =
      !isCurrent || ['assigned', 'inProgress'].includes(manuscript.status)

    return {
      content: (
        <EditorSection
          currentUser={user}
          editorSection="CPEditor"
          manuscript={manuscript}
          queryAI={queryAI}
          readonly={isReadOnly}
          saveComments={debouncedSaveComments}
          saveSource={isReadOnly ? null : debouncedSave}
        />
      ),
      key: `editor`,
      label: `${t('decisionPage.Manuscript text')} ${
        isReadOnly ? t('decisionPage.read-only') : ''
      }`,
    }
  }

  const reviewOrInitial = manuscript =>
    manuscript?.reviews?.find(review => review.isDecision) || {
      isDecision: true,
    }

  // Find an existing review or create a placeholder, and hold a ref to it
  const existingReview = useRef(reviewOrInitial(version))

  // Update the value of that ref if the manuscript object changes
  useEffect(() => {
    existingReview.current = reviewOrInitial(version)
  }, [version.reviews])

  const editorSection = addEditor(version, isCurrentVersion, currentUser)

  const metadataSection = () => {
    const submissionValues = isCurrentVersion
      ? createBlankSubmissionBasedOnForm(form)
      : {}

    Object.assign(submissionValues, version.submission)

    const versionValues = {
      ...version,
      submission: submissionValues,
    }

    const versionId = version.id

    const { preventGmFromEditing } = config.submission || {}

    const userCanEditMetadata =
      isCurrentVersion &&
      ((isGroupManager && !(isAuthor && preventGmFromEditing)) ||
        isGroupAdmin ||
        isEditor)

    return {
      content: (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>
          {!userCanEditMetadata ? (
            <ReadonlyFormTemplate
              displayShortIdAsIdentifier={displayShortIdAsIdentifier}
              form={form}
              formData={version}
              manuscript={version}
              showEditorOnlyFields
              threadedDiscussionProps={threadedDiscussionExtendedProps}
            />
          ) : (
            <SectionContent>
              <FormTemplate
                createFile={createFile}
                deleteFile={deleteFile}
                displayShortIdAsIdentifier={displayShortIdAsIdentifier}
                fieldsToPublish={
                  version.formFieldsToPublish.find(
                    ff => ff.objectId === version.id,
                  )?.fieldsToPublish ?? []
                }
                form={form}
                initialValues={versionValues}
                isSubmission
                manuscriptId={version.id}
                manuscriptShortId={version.shortId}
                manuscriptStatus={version.status}
                match={{ url: 'decision' }}
                onChange={(value, path) => {
                  onChange(value, path, versionId)
                }}
                republish={() => null}
                setShouldPublishField={async (fieldName, shouldPublish) =>
                  setShouldPublishField({
                    variables: {
                      manuscriptId: version.id,
                      objectId: version.id,
                      fieldName,
                      shouldPublish,
                    },
                  })
                }
                shouldShowOptionToPublish
                showEditorOnlyFields
                threadedDiscussionProps={threadedDiscussionExtendedProps}
                urlFrag={urlFrag}
                validateDoi={validateDoi}
                validateSuffix={validateSuffix}
              />
            </SectionContent>
          )}
        </>
      ),
      key: `metadata`,
      label: t('decisionPage.Metadata'),
    }
  }

  const tasksAndNotificationsSection = () => {
    return {
      content: (
        <>
          {isCurrentVersion &&
            ['journal', 'prc'].includes(config.instanceName) && (
              <EmailNotifications
                addReviewer={addReviewer}
                allUsers={allUsers}
                currentUser={currentUser}
                emailTemplates={emailTemplates}
                externalEmail={externalEmail}
                manuscript={version}
                selectedEmail={selectedEmail}
                selectedEmailIsBlacklisted={selectedEmailIsBlacklisted}
                sendChannelMessage={sendChannelMessage}
                sendNotifyEmail={sendNotifyEmail}
                setExternalEmail={setExternalEmail}
                setSelectedEmail={setSelectedEmail}
              />
            )}
          <SectionContent>
            <SectionHeader>
              <Title>{t('decisionPage.tasksTab.Tasks')}</Title>
            </SectionHeader>
            <TaskSectionRow>
              <TaskList
                addReviewer={addReviewer}
                createTaskEmailNotificationLog={createTaskEmailNotificationLog}
                currentUser={currentUser}
                deleteTaskNotification={deleteTaskNotification}
                emailTemplates={emailTemplates}
                manuscript={version}
                manuscriptId={parent.id}
                roles={roles}
                sendNotifyEmail={sendNotifyEmail}
                tasks={parent.tasks}
                updateTask={updateTask}
                updateTaskNotification={updateTaskNotification}
                updateTasks={updateTasks}
                users={allUsers}
              />
            </TaskSectionRow>
          </SectionContent>
        </>
      ),
      key: `tasks`,
      label: t('decisionPage.Tasks & Notifications'),
    }
  }

  const teamSection = () => {
    return {
      content: (
        <>
          {isCurrentVersion && (
            <AssignEditorsReviewers
              allUsers={allUsers}
              AssignEditor={AssignEditor}
              createTeam={createTeam}
              manuscript={version}
              teamLabels={teamLabels}
              updateTeam={updateTeam}
            />
          )}
          {!isCurrentVersion && (
            <SectionContent>
              <SectionHeader>
                <Title>Assigned editors</Title>
              </SectionHeader>
              <SectionRow>
                {version?.teams?.map(team => {
                  if (
                    ['seniorEditor', 'handlingEditor', 'editor'].includes(
                      team.role,
                    )
                  ) {
                    return (
                      <p key={team.id}>
                        {teamLabelsTransformed[team.role].name}:{' '}
                        {team.members?.[0]?.user?.username}
                      </p>
                    )
                  }

                  return null
                })}
              </SectionRow>
            </SectionContent>
          )}
          {/* Reviewer Kanban Board */}
          <KanbanBoard
            createFile={createFile}
            currentUser={currentUser}
            deleteFile={deleteFile}
            invitations={invitations}
            isCurrentVersion={isCurrentVersion}
            manuscript={version}
            removeInvitation={removeInvitation}
            removeReviewer={removeReviewer}
            reviewForm={reviewForm}
            reviews={reviewers}
            title={t('decisionPage.Reviewer Status')}
            updateCollaborativeTeamMember={updateCollaborativeTeamMember}
            updateReview={updateReview}
            updateReviewJsonData={updateReviewJsonData}
            updateSharedStatusForInvitedReviewer={
              updateSharedStatusForInvitedReviewer
            }
            updateTeamMember={updateTeamMember}
            version={version}
            versionNumber={versionNumber}
          />
          {isCurrentVersion && (
            <AdminSection>
              <InviteReviewer
                addReviewer={addReviewer}
                currentUser={currentUser}
                emailTemplates={emailTemplates}
                manuscript={version}
                reviewerUsers={allUsers}
                selectedEmailIsBlacklisted={selectedEmailIsBlacklisted}
                sendChannelMessage={sendChannelMessage}
                sendNotifyEmail={sendNotifyEmail}
                setExternalEmail={setExternalEmail}
                updateSharedStatusForInvitedReviewer={
                  updateSharedStatusForInvitedReviewer
                }
                updateTeamMember={updateTeamMember}
              />
            </AdminSection>
          )}
          {/* Author Kanban Board */}
          {config?.controlPanel?.displayAuthorKanban && (
            <KanbanBoard
              createFile={createFile}
              currentUser={currentUser}
              deleteFile={deleteFile}
              invitations={invitations}
              isAuthorBoard
              isCurrentVersion={isCurrentVersion}
              manuscript={version}
              removeAuthor={removeAuthor}
              removeInvitation={removeInvitation}
              reviewForm={reviewForm}
              reviews={reviewers}
              title={t('decisionPage.authorStatus')}
              updateCollaborativeTeamMember={updateCollaborativeTeamMember}
              updateReview={updateReview}
              updateReviewJsonData={updateReviewJsonData}
              updateSharedStatusForInvitedReviewer={
                updateSharedStatusForInvitedReviewer
              }
              updateTeamMember={updateTeamMember}
              version={version}
              versionNumber={versionNumber}
            />
          )}
          {authorProofingEnabled && (
            <AdminSection>
              <AssignAuthorForProofing
                assignAuthorForProofing={assignAuthorForProofing}
                isCurrentVersion={isCurrentVersion}
                manuscript={version}
              />
            </AdminSection>
          )}
        </>
      ),
      key: `team`,
      label: t('decisionPage.Team'),
    }
  }

  const decisionSection = () => {
    const formVerdictOptions =
      decisionForm?.children
        .find(formElement => formElement.name === '$verdict')
        ?.options.map(verdictOption => verdictOption.value) || []

    const areVerdictOptionsComplete = ['accept'].every(requiredOption =>
      formVerdictOptions.includes(requiredOption),
    )

    return {
      content: (
        <>
          {!isCurrentVersion && (
            <SectionContent>
              <SectionHeader>
                <Title>{t('decisionPage.decisionTab.Archived version')}</Title>
              </SectionHeader>
              <SectionRow>
                {t('decisionPage.decisionTab.notCurrentVersion')}
              </SectionRow>
            </SectionContent>
          )}
          {!isCurrentVersion && (
            <DecisionAndReviews
              createFile={createFile}
              currentUser={currentUser}
              decisionForm={decisionForm}
              deleteFile={deleteFile}
              isControlPage
              manuscript={version}
              readOnly
              reviewForm={reviewForm}
              showDecision
              showEditorOnlyFields
              showReviews={false}
              threadedDiscussionProps={threadedDiscussionExtendedProps}
            />
          )}
          {isCurrentVersion && (
            <AdminSection key="decision-form">
              <SectionContent>
                <FormTemplate
                  createFile={createFile}
                  deleteFile={deleteFile}
                  fieldsToPublish={
                    version.formFieldsToPublish.find(
                      ff => ff.objectId === currentDecisionData.id,
                    )?.fieldsToPublish ?? []
                  }
                  form={decisionForm}
                  initialValues={
                    currentDecisionData?.jsonData
                      ? JSON.parse(currentDecisionData?.jsonData)
                      : { comment: '', $verdict: '', discussion: '' } // TODO this should just be {}, but needs testing.
                  }
                  isSubmission={false}
                  manuscriptId={version.id}
                  manuscriptShortId={version.shortId}
                  manuscriptStatus={version.status}
                  onChange={(value, path) => {
                    updateReviewJsonData(
                      currentDecisionData?.id,
                      value,
                      path,
                      true,
                      version.id,
                    )
                  }}
                  onSubmit={async (values, actions) => {
                    try {
                      await makeDecision({
                        variables: {
                          id: version.id,
                          decision: values.$verdict,
                        },
                      })

                      actions.setSubmitting(false)
                    } catch (decisionError) {
                      actions.setErrors({ makeDecision: decisionError.message })
                    }
                  }}
                  reviewId={currentDecisionData.id}
                  setShouldPublishField={async (fieldName, shouldPublish) =>
                    setShouldPublishField({
                      variables: {
                        manuscriptId: version.id,
                        objectId: currentDecisionData.id,
                        fieldName,
                        shouldPublish,
                      },
                    })
                  }
                  shouldShowOptionToPublish
                  shouldStoreFilesInForm
                  showEditorOnlyFields
                  submissionButtonText={t('decisionPage.decisionTab.Submit')}
                  tagForFiles="decision"
                  threadedDiscussionProps={threadedDiscussionExtendedProps}
                  unpublish={unpublish}
                  urlFrag={urlFrag}
                  validateDoi={validateDoi}
                  validateSuffix={validateSuffix}
                />
              </SectionContent>
            </AdminSection>
          )}
          {isCurrentVersion && canPublish && (
            <AdminSection>
              <Publish
                areVerdictOptionsComplete={areVerdictOptionsComplete}
                dois={dois}
                manuscript={version}
                onRefreshAdaStatus={onRefreshAdaStatus}
                publishManuscript={publishManuscript}
                unpublish={unpublish}
                updateAda={updateAda}
              />
            </AdminSection>
          )}
        </>
      ),
      key: `decision`,
      label: t('decisionPage.Decision'),
    }
  }

  const reviewsSection = () => {
    return {
      content: (
        <>
          {!isCurrentVersion && (
            <SectionContent>
              <SectionHeader>
                <Title>{t('decisionPage.decisionTab.Archived version')}</Title>
              </SectionHeader>
              <SectionRow>
                {t('decisionPage.decisionTab.notCurrentVersion')}
              </SectionRow>
            </SectionContent>
          )}
          {!isCurrentVersion && (
            <DecisionAndReviews
              createFile={createFile}
              currentUser={currentUser}
              decisionForm={decisionForm}
              deleteFile={deleteFile}
              isControlPage
              manuscript={version}
              readOnly
              reviewForm={reviewForm}
              showDecision={false}
              showEditorOnlyFields
              showReviews
              threadedDiscussionProps={threadedDiscussionExtendedProps}
            />
          )}
          {isCurrentVersion && (
            <DecisionReviews
              canEditReviews={config?.controlPanel?.editorsEditReviewsEnabled}
              canHideReviews={canHideReviews}
              createFile={createFile}
              currentUser={currentUser}
              deleteFile={deleteFile}
              invitations={invitations}
              lockUnlockReview={lockUnlockReview}
              manuscript={version}
              reviewers={reviewers}
              reviewForm={reviewForm}
              threadedDiscussionProps={threadedDiscussionExtendedProps}
              updateCollaborativeTeamMember={updateCollaborativeTeamMember}
              updateReview={updateReview}
              updateReviewJsonData={updateReviewJsonData}
              updateSharedStatusForInvitedReviewer={
                updateSharedStatusForInvitedReviewer
              }
              updateTeamMember={updateTeamMember}
              urlFrag={urlFrag}
            />
          )}
        </>
      ),
      key: 'reviews',
      label: 'Reviews',
    }
  }

  const coarMessagesSection = () => ({
    content: <CoarMessages loading={isCoarLoading} messages={coarMessages} />,
    key: 'coarMessages',
    label: t('decisionPage.COAR Notify Metadata'),
  })

  let defaultActiveKey

  switch (config?.controlPanel?.showTabs[0]) {
    case 'Team':
      defaultActiveKey = `team`
      break
    case 'Decision':
      defaultActiveKey = `decision`
      break
    case 'Reviews':
      defaultActiveKey = `reviews`
      break
    case 'Manuscript text':
      defaultActiveKey = `editor`
      break
    case 'Metadata':
      defaultActiveKey = `metadata`
      break
    case 'Tasks & Notifications':
      defaultActiveKey = `tasks`
      break
    case 'COAR Notify Metadata':
      defaultActiveKey = `coarMessages`
      break
    default:
      defaultActiveKey = `team`
      break
  }

  let locationState =
    location.state !== undefined && location.state.tab === 'Decision'
      ? `decision`
      : defaultActiveKey

  if (activeTab) locationState = activeTab

  const sections = []

  if (config?.controlPanel?.showTabs) {
    if (config?.controlPanel?.showTabs.includes('Team'))
      sections.push(teamSection())
    if (config?.controlPanel?.showTabs.includes('Decision'))
      sections.push(decisionSection())
    if (config?.controlPanel?.showTabs.includes('Reviews'))
      sections.push(reviewsSection())
    if (config?.controlPanel?.showTabs.includes('Manuscript text'))
      sections.push(editorSection)
    if (config?.controlPanel?.showTabs.includes('Metadata'))
      sections.push(metadataSection())
    if (config?.controlPanel?.showTabs.includes('Tasks & Notifications'))
      sections.push(tasksAndNotificationsSection())
    if (config?.controlPanel?.showTabs.includes('COAR Notify Metadata'))
      sections.push(coarMessagesSection())
  }

  return (
    <HiddenTabs
      defaultActiveKey={locationState}
      onChange={refetch}
      sections={sections}
    />
  )
}

DecisionVersion.propTypes = {
  addReviewer: PropTypes.func.isRequired,
  updateManuscript: PropTypes.func.isRequired,
  form: PropTypes.shape({
    children: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string,
        title: PropTypes.string,
        shortDescription: PropTypes.string,
      }).isRequired,
    ).isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  isCurrentVersion: PropTypes.bool.isRequired,
  version: PropTypes.shape({
    id: PropTypes.string.isRequired,
    meta: PropTypes.shape({ source: PropTypes.string }).isRequired,
    files: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        storedObjects: PropTypes.arrayOf(PropTypes.object.isRequired),
      }).isRequired,
    ).isRequired,
    reviews: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        isDecision: PropTypes.bool.isRequired,
        decisionComment: PropTypes.shape({
          content: PropTypes.string,
        }),
        user: PropTypes.shape({
          username: PropTypes.string.isRequired,
          defaultIdentity: PropTypes.shape({
            identifier: PropTypes.string.isRequired,
          }),
        }),
      }).isRequired,
    ).isRequired,
  }).isRequired,
  versionNumber: PropTypes.number.isRequired,
  parent: PropTypes.shape({
    id: PropTypes.string.isRequired,
    teams: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        members: PropTypes.arrayOf(
          PropTypes.shape({
            user: PropTypes.shape({
              id: PropTypes.string.isRequired,
              username: PropTypes.string.isRequired,
              defaultIdentity: PropTypes.shape({
                name: PropTypes.string.isRequired,
              }),
            }),
          }).isRequired,
        ),
        role: PropTypes.string.isRequired,
      }).isRequired,
    ),
  }).isRequired,
}

export default DecisionVersion
