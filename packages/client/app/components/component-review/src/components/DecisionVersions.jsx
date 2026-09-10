/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */

import { useMemo, useState } from 'react'
import styled from 'styled-components'
import { uuid } from '@coko/client'
import DecisionVersion from './DecisionVersion'
import gatherManuscriptVersions from '../../../../shared/manuscript_versions'

import {
  VersionSwitcher,
  ErrorBoundary,
  Columns,
  Manuscript,
} from '../../../shared'
import MessageContainer from '../../../component-chat/src/MessageContainer'
import ChatPanelExpandButton from '../../../../ui/shared/ChatPanelExpandButton'

const FloatingChatPanelExpandButton = styled(ChatPanelExpandButton)`
  margin-top: 16px;
  position: absolute;
  right: 18px;
`

const DecisionVersions = ({
  allUsers,
  addReviewer,
  assignAuthorForProofing,
  roles,
  currentUser,
  decisionForm,
  chatProps,
  channels,
  coarMessages,
  initialChatExpanded,
  saveChatExpanded,
  form,
  handleChange,
  hideChat,
  isCoarLoading,
  onRefreshAdaStatus,
  updateManuscript,
  manuscript,
  sendNotifyEmail,
  sendChannelMessage,
  makeDecision,
  updateReviewJsonData,
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
  deleteFile,
  createFile,
  threadedDiscussionProps,
  validateDoi,
  validateSuffix,
  setExternalEmail,
  externalEmail,
  selectedEmail,
  setSelectedEmail,
  setShouldPublishField,
  selectedEmailIsBlacklisted,
  updateSharedStatusForInvitedReviewer,
  lockUnlockReview,
  dois,
  refetch,
  updateAda,
  updateTask,
  updateTasks,
  teams,
  updateTeamMember,
  updateCollaborativeTeamMember,
  removeAuthor,
  removeInvitation,
  removeReviewer,
  updateTaskNotification,
  deleteTaskNotification,
  createTaskEmailNotificationLog,
  emailTemplates,
  queryAI,
  unpublish,
}) => {
  const versions = gatherManuscriptVersions(manuscript)
  const firstVersion = versions[versions.length - 1]

  const initialValue = useMemo(
    () =>
      versions[0].manuscript.reviews.find(r => r.isDecision) || {
        id: uuid(),
        isDecision: true,
        userId: currentUser.id,
      },
    [],
  )

  const [isDiscussionVisible, setIsDiscussionVisible] =
    useState(initialChatExpanded)

  const toggleDiscussionVisibility = () => {
    const isExpanded = !isDiscussionVisible
    setIsDiscussionVisible(isExpanded)
    saveChatExpanded(isExpanded)

    // Refresh unread counts/notification data in the background so the
    // collapsed chat button's badge stays accurate. This must not block the
    // panel from opening/closing above.
    const { channelsData, reloadUnreadMessageCounts } = chatProps || {}

    const dataRefetchPromises = (channelsData || []).map(async channel => {
      await channel?.refetchUnreadMessagesCount?.()
      await channel?.refetchNotificationOptionData?.()
    })

    if (reloadUnreadMessageCounts) {
      dataRefetchPromises.push(reloadUnreadMessageCounts())
    }

    Promise.all(dataRefetchPromises).catch(error => {
      console.error('Error refreshing discussion data:', error)
    })
  }

  const manuscriptLatestVersionId = versions[0].manuscript.id

  return (
    <Columns>
      <Manuscript>
        <ErrorBoundary>
          <VersionSwitcher fullWidth={hideChat}>
            {versions.map((version, index) => (
              <DecisionVersion
                addReviewer={addReviewer}
                allUsers={allUsers}
                assignAuthorForProofing={assignAuthorForProofing}
                canHideReviews={canHideReviews}
                coarMessages={coarMessages}
                createFile={createFile}
                createTaskEmailNotificationLog={createTaskEmailNotificationLog}
                createTeam={createTeam}
                currentDecisionData={initialValue}
                currentUser={currentUser}
                decisionForm={decisionForm}
                deleteFile={deleteFile}
                deleteTaskNotification={deleteTaskNotification}
                displayShortIdAsIdentifier={displayShortIdAsIdentifier}
                dois={dois}
                emailTemplates={emailTemplates}
                externalEmail={externalEmail}
                form={form}
                invitations={version.manuscript.invitations || []}
                isCoarLoading={isCoarLoading}
                isCurrentVersion={index === 0}
                key={version.manuscript.id}
                lockUnlockReview={lockUnlockReview}
                makeDecision={makeDecision}
                manuscriptLatestVersionId={manuscriptLatestVersionId}
                onChange={handleChange}
                onRefreshAdaStatus={onRefreshAdaStatus}
                parent={firstVersion.manuscript}
                publishManuscript={publishManuscript}
                queryAI={queryAI}
                refetch={refetch}
                removeAuthor={removeAuthor}
                removeInvitation={removeInvitation}
                removeReviewer={removeReviewer}
                reviewers={reviewers}
                reviewForm={reviewForm}
                roles={roles}
                selectedEmail={selectedEmail}
                selectedEmailIsBlacklisted={selectedEmailIsBlacklisted}
                sendChannelMessage={sendChannelMessage}
                sendNotifyEmail={sendNotifyEmail}
                setExternalEmail={setExternalEmail}
                setSelectedEmail={setSelectedEmail}
                setShouldPublishField={setShouldPublishField}
                teamLabels={teamLabels}
                teams={teams}
                threadedDiscussionProps={threadedDiscussionProps}
                unpublish={unpublish}
                updateAda={updateAda}
                updateCollaborativeTeamMember={updateCollaborativeTeamMember}
                updateManuscript={updateManuscript}
                updateReview={updateReview}
                updateReviewJsonData={updateReviewJsonData}
                updateSharedStatusForInvitedReviewer={
                  updateSharedStatusForInvitedReviewer
                }
                updateTask={updateTask}
                updateTaskNotification={updateTaskNotification}
                updateTasks={updateTasks}
                updateTeam={updateTeam}
                updateTeamMember={updateTeamMember}
                urlFrag={urlFrag}
                validateDoi={validateDoi}
                validateSuffix={validateSuffix}
                version={version.manuscript}
                versionNumber={versions.length - index}
              />
            ))}
          </VersionSwitcher>
        </ErrorBoundary>
      </Manuscript>
      {!hideChat && (
        <>
          <MessageContainer
            channels={channels}
            chatProps={chatProps}
            currentUser={currentUser}
            isOpen={isDiscussionVisible}
            onToggle={toggleDiscussionVisibility}
          />
          <FloatingChatPanelExpandButton
            isOpen={isDiscussionVisible}
            onClick={toggleDiscussionVisibility}
            unreadCount={
              chatProps.unreadMessagesQueryResult?.data?.unreadMessagesCount
            }
          />
        </>
      )}
    </Columns>
  )
}

export default DecisionVersions
