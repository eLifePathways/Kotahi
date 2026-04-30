/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
/* eslint-disable react/prop-types */

import { useState, useEffect } from 'react'
import { v4 as uuid } from 'uuid'
import { useTranslation } from 'react-i18next'
import ActionButton from '../../../../../shared/ActionButton'
import SimpleWaxEditor from '../../../../../wax-collab/src/SimpleWaxEditor'
import { SimpleWaxEditorWrapper } from '../../style'
import ThreadedComment from './ThreadedComment'
import { hasValue } from '../../../../../../shared/htmlUtils'

/** Returns an array of objects supplying useful into for each comment; and adds a new one at the end
 * if the user is permitted to add a new comment and haven't yet started doing so.
 */
const getExistingOrInitialComments = (
  comments,
  currentUser,
  userCanAddComment,
  manuscriptLatestVersionId,
  selectedManuscriptVersionId,
) => {
  let hasPendingVersion = false

  const result = comments
    .filter(c => {
      if (c.pendingVersion) {
        return manuscriptLatestVersionId === selectedManuscriptVersionId
      }

      return c.commentVersions.length > 0
    })
    .map(c => {
      if (c.pendingVersion) {
        // This comment is currently being edited!
        // Note that the server gives us only a pendingVersion for the current user.
        hasPendingVersion = true

        return {
          ...c.pendingVersion,
          updated: c.updated,
          manuscriptVersionId: c.manuscriptVersionId,
          id: c.id,
          isEditing: true,
          existingComment: c.commentVersions.length
            ? c.commentVersions[c.commentVersions.length - 1]
            : null, // If null, this is a new, unsubmitted comment.
        }
      }

      // This comment is not currently being edited.
      const cv = c.commentVersions[c.commentVersions.length - 1]
      const firstCommentVersion = c.commentVersions[0]
      return {
        ...cv,
        author: firstCommentVersion.author,
        updatedBy: cv.author,
        created: firstCommentVersion.created,
        updated: c.updated,
        published: c.published || undefined,
        id: c.id,
        manuscriptVersionId: c.manuscriptVersionId,
        existingComment: cv,
      }
    })
    .sort((a, b) => {
      const aParsed = a.created ? new Date(a.created) : Number.MAX_SAFE_INTEGER
      const bParsed = b.created ? new Date(b.created) : Number.MAX_SAFE_INTEGER
      return aParsed - bParsed
    })

  // By default the last completed comment in the thread is shown expanded; all others are collapsed
  const lastCompletedComment = result
    .filter(c => c.existingComment)
    .slice(-1)
    .pop()

  if (lastCompletedComment) lastCompletedComment.shouldExpandByDefault = true

  // If the last comment in the thread is not by this user (and they are permitted to comment at all),
  // we create the preliminary data for a new comment, not yet in the DB.
  // reply to a comment is only provided in the latest version of manuscript

  if (
    selectedManuscriptVersionId === manuscriptLatestVersionId &&
    userCanAddComment &&
    !hasPendingVersion
  )
    result.push({
      id: uuid(),
      comment: '<p class="paragraph"></p>',
      isEditing: true,
      author: currentUser,
    })

  return result
}

const ThreadedDiscussion = ({
  threadedDiscussionProps: {
    threadedDiscussion,
    currentUser,
    firstVersionManuscriptId,
    updatePendingComment,
    completeComment,
    deletePendingComment,
    userCanAddThread,
    commentsToPublish: commsToPublish,
    setShouldPublishComment,
    selectedManuscriptVersionId,
    manuscriptLatestVersionId,
  },
  onChange,
  ...SimpleWaxEditorProps
}) => {
  const {
    updated,
    userCanAddComment,
    userCanEditOwnComment,
    userCanEditAnyComment,
  } = threadedDiscussion || { userCanAddComment: userCanAddThread }

  const { t } = useTranslation()

  const [threadedDiscussionId] = useState(threadedDiscussion?.id || uuid())
  const [threadId] = useState(threadedDiscussion?.threads?.[0]?.id || uuid())
  const threadComments = threadedDiscussion?.threads?.[0]?.comments || []
  const [comments, setComments] = useState([])
  const mustCreateNewThreadedDiscussion = !threadedDiscussion?.id

  const [commentsToPublish, setCommentsToPublish] = useState(
    commsToPublish || [],
  )

  const isLatestVersionOfManuscript =
    selectedManuscriptVersionId === manuscriptLatestVersionId

  useEffect(() => {
    setComments(
      getExistingOrInitialComments(
        threadComments,
        currentUser,
        userCanAddComment && !!updatePendingComment && !!completeComment, // Don't allow editing if mutation functions aren't available
        manuscriptLatestVersionId,
        selectedManuscriptVersionId,
      ),
    )
  }, [updated])

  return (
    <>
      {comments &&
        comments.map(comment => {
          const handleUpdateComment = content => {
            updatePendingComment({
              variables: {
                manuscriptId: firstVersionManuscriptId,
                threadedDiscussionId,
                threadId,
                commentId: comment.id,
                comment: content,
                manuscriptVersionId: selectedManuscriptVersionId,
              },
            })
          }

          const handleUpdateNewComment = content => {
            handleUpdateComment(content)
            if (mustCreateNewThreadedDiscussion) onChange(threadedDiscussionId) // This will record the threadedDiscussion ID in the form data
            setComments(
              comments.map(c =>
                c.id === comment.id ? { ...c, comment: content } : c,
              ),
            )
          }

          const handleCancelEditingComment = () =>
            deletePendingComment({
              variables: {
                threadedDiscussionId,
                threadId,
                commentId: comment.id,
              },
            })

          const handleSubmitButtonClick = () => {
            if (hasValue(comment.comment)) {
              completeComment({
                variables: {
                  threadedDiscussionId,
                  threadId,
                  commentId: comment.id,
                },
              })

              setComments(
                comments.map(c =>
                  c.id === comment.id
                    ? {
                        ...c,
                        isEditing: false,
                        existingComment: undefined,
                      }
                    : c,
                ),
              )
            }
          }

          if (isLatestVersionOfManuscript && !comment.existingComment) {
            return (
              <div key={comment.id}>
                <SimpleWaxEditorWrapper key={comment.id}>
                  <SimpleWaxEditor
                    {...SimpleWaxEditorProps}
                    onChange={handleUpdateNewComment}
                    value={comment.comment}
                  />
                </SimpleWaxEditorWrapper>
                <ActionButton
                  disabled={!hasValue(comment.comment)}
                  onClick={handleSubmitButtonClick}
                  primary
                >
                  {t('formBuilder.submitComment')}
                </ActionButton>
              </div>
            )
          }

          return (
            <ThreadedComment
              comment={comment}
              currentUser={currentUser}
              isLatestVersionOfManuscript={isLatestVersionOfManuscript}
              key={comment.id}
              onCancel={handleCancelEditingComment}
              onChange={handleUpdateComment}
              onSubmit={() =>
                completeComment({
                  variables: {
                    threadedDiscussionId,
                    threadId,
                    commentId: comment.id,
                  },
                })
              }
              selectedManuscriptVersionId={selectedManuscriptVersionId}
              setShouldPublish={
                setShouldPublishComment &&
                (val => {
                  setShouldPublishComment(comment.id, val)
                  const ids = commentsToPublish.filter(id => id !== comment.id)
                  if (val) ids.push(comment.id)
                  setCommentsToPublish(ids)
                })
              }
              shouldPublish={commentsToPublish.includes(comment.id)}
              simpleWaxEditorProps={SimpleWaxEditorProps}
              userCanEditAnyComment={userCanEditAnyComment}
              userCanEditOwnComment={userCanEditOwnComment}
            />
          )
        })}
    </>
  )
}

export default ThreadedDiscussion
