/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */

import { useState, useContext, useEffect } from 'react'
import styled from 'styled-components'
import { get } from 'lodash'
import { useTranslation } from 'react-i18next'

import { Checkbox } from '../../pubsweet'
import YjsContext from '../../provider-yjs/YjsProvider'
import { convertTimestampToDateString } from '../../../shared/dateUtils'
import { ensureJsonIsParsed } from '../../../shared/objectUtils'
import Modal, { SecondaryButton } from '../../component-modal/src/Modal'
import {
  ConfigurableStatus,
  UserInfo,
  UserCombo,
  Primary,
  Secondary,
} from '../../shared'
import reviewStatuses from '../../../../config/journal/review-status'
import recommendations from '../../../../config/journal/recommendations'
import { UserAvatar } from '../../component-avatar/src'
import DeleteReviewerModal from '../../component-review/src/components/reviewers/DeleteReviewerModal'
import DeleteInvitationModal from '../../component-review/src/components/reviewers/DeleteInvitationModal'
import ReadonlyFieldData from '../../component-review/src/components/metadata/ReadonlyFieldData'
import FormTemplate from '../../component-submit/src/components/FormTemplate'
import { ConfigContext } from '../../config/src'
import localizeReviewFilterOptions from '../../../shared/localizeReviewFilterOptions'
import localizeRecommendations from '../../../shared/localizeRecommendations'

const Header = styled.div`
  font-size: 18px;
  font-weight: 500;
`

const ReviewItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 14px;
  gap: 0.8em;
`

const ReviewItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1em;
  margin-top: 1.5em;

  /* stylelint-disable-next-line selector-class-pattern */
  .ProseMirror {
    background: none;
  }
`

const StatusContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: 1.5em;
`

const ReviewDetailsModal = (
  props, // main title in black
) => {
  const {
    createFile,
    currentUser,
    deleteFile,
    status,
    canEditReviews,
    review,
    reviewerTeamMember,
    reviewForm,
    onClose,
    threadedDiscussionProps,
    showEditorOnlyFields,
    isAuthorCard,
    isOpen,
    isControlPage = true,
    readOnly = false,
    removeAuthor,
    removeInvitation,
    removeReviewer,
    manuscriptId,
    manuscriptShortId,
    isInvitation = false,
    updateSharedStatusForInvitedReviewer,
    updateTeamMember,
    updateCollaborativeTeamMember,
    updateReview,
    updateReviewJsonData,
  } = props

  const { createYjsProvider, wsProvider } = useContext(YjsContext)
  const { controlPanel } = useContext(ConfigContext)

  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  const { editorsDeleteReviewsEnabled } = controlPanel ?? {}

  useEffect(() => {
    if (review?.id) {
      wsProvider?.disconnect()
    }

    if (review?.isCollaborative) {
      setTimeout(() => {
        if (!wsProvider || wsProvider?.roomname !== review?.id) {
          createYjsProvider({
            currentUser,
            identifier: review.id,
            object: {
              objectType: 'Review',
              category: 'review',
              purpose: 'review',
            },
          })
        }
      }, 500)
    }

    // if (wsProvider && wsProvider?.roomname !== review?.id) {
    //   return () => wsProvider?.disconnect()
    // }

    return null
  }, [review?.id])

  const LocalizedReviewFilterOptions = localizeReviewFilterOptions(
    reviewStatuses,
    t,
  )

  const fallbackStatus =
    review?.isCollaborative && review?.isLock === true ? 'closed' : 'completed'

  const statusToDisplay = status ?? fallbackStatus

  const statusConfig = LocalizedReviewFilterOptions.find(
    item => item.value === statusToDisplay,
  )

  let reviewer = null
  let inviteeName = null

  if (review?.isCollaborative) {
    reviewer = reviewerTeamMember?.user
  } else if (review) {
    reviewer = review.user
  } else {
    reviewer = reviewerTeamMember?.user
  }

  if (!reviewer && reviewerTeamMember?.invitedPersonName) {
    inviteeName = reviewerTeamMember.invitedPersonName
  }

  const showRealReviewer = !review?.isHiddenReviewerName || isControlPage

  const reviewerName = showRealReviewer
    ? reviewer?.username || reviewerTeamMember?.invitedPersonName
    : 'Anonymous Reviewer'

  const generateModalTitle = () => {
    if (isAuthorCard) {
      return t('modals.reviewReport.authorReport', { name: reviewerName })
    }

    if (!showRealReviewer || !reviewer) {
      return t('modals.reviewReport.anonymousReviewReport')
    }

    if (review?.isCollaborative) {
      return t('modals.reviewReport.collaborativeReview', {
        name: reviewerName,
      })
    }

    return t('modals.reviewReport.reviewReport', {
      name: reviewerName,
    })
  }

  const timeString = convertTimestampToDateString(
    review ? review.updated : reviewerTeamMember.updated,
  )

  const reviewData = review ? ensureJsonIsParsed(review?.jsonData) : {}

  const showForm = !readOnly && canEditReviews

  return (
    <Modal
      contentStyles={{ width: '80%', maxWidth: '80%' }}
      isOpen={isOpen}
      leftActions={
        !readOnly &&
        !isAuthorCard && (
          <CheckboxActions
            isInvitation={isInvitation}
            manuscriptId={manuscriptId}
            review={review}
            reviewerTeamMember={reviewerTeamMember}
            updateCollaborativeTeamMember={updateCollaborativeTeamMember}
            updateReview={updateReview}
            updateSharedStatusForInvitedReviewer={
              updateSharedStatusForInvitedReviewer
            }
            updateTeamMember={updateTeamMember}
          />
        )
      }
      onClose={onClose}
      rightActions={
        !readOnly &&
        (!['closed', 'completed'].includes(statusToDisplay) ||
          editorsDeleteReviewsEnabled) && (
          <>
            <SecondaryButton onClick={() => setOpen(true)}>
              {t('modals.reviewReport.Delete')}
            </SecondaryButton>
            {isInvitation && (
              <DeleteInvitationModal
                isAuthorCard={isAuthorCard}
                isOpen={open}
                manuscriptId={manuscriptId}
                onClose={() => setOpen(false)}
                removeInvitation={removeInvitation}
                removeUserFromTeam={
                  isAuthorCard ? removeAuthor : removeReviewer
                }
                reviewer={reviewerTeamMember}
              />
            )}
            {!isInvitation && (
              <DeleteReviewerModal
                isOpen={open}
                manuscriptId={manuscriptId}
                onClose={() => setOpen(false)}
                removeReviewer={removeReviewer}
                reviewer={reviewerTeamMember}
              />
            )}
          </>
        )
      }
      subtitle={t(`modals.reviewReport.Last Updated`, {
        dateString: timeString,
      })}
      title={generateModalTitle()}
    >
      {(reviewer || inviteeName) && (
        <UserCombo style={{ marginBottom: '1em' }}>
          <UserAvatar
            isClickable
            showHoverProfile
            size="48"
            user={showRealReviewer ? reviewer : null}
          />
          <UserInfo>
            <p>
              <Primary>
                {t(
                  `modals.reviewReport.${isAuthorCard ? 'Author' : 'Reviewer'}`,
                )}{' '}
              </Primary>{' '}
              {inviteeName ?? reviewerName}
            </p>
            {showRealReviewer && (
              <div>
                {reviewer?.defaultIdentity?.identifier && (
                  <Secondary>
                    <Primary>ORCID:</Primary>{' '}
                    {reviewer.defaultIdentity.identifier}
                  </Secondary>
                )}
                {reviewerTeamMember?.toEmail && (
                  <Secondary>
                    <Primary>{t('modals.reviewReport.email')}</Primary>{' '}
                    {reviewerTeamMember.toEmail}
                  </Secondary>
                )}
              </div>
            )}
          </UserInfo>
        </UserCombo>
      )}
      <StatusContainer>
        <Header>{t('modals.reviewReport.Status')}</Header>
        <ConfigurableStatus
          color={statusConfig.color}
          lightText={statusConfig.lightText}
        >
          {statusConfig?.label}
        </ConfigurableStatus>
      </StatusContainer>
      {review && showForm && (
        <FormTemplate
          collaborativeObject={{ identifier: review.id, currentUser }}
          createFile={createFile}
          deleteFile={deleteFile}
          form={{ ...reviewForm, name: null, description: null }}
          formikOptions={{ enableReinitialize: review.isCollaborative }}
          initialValues={reviewData}
          isCollaborative={review.isCollaborative}
          manuscriptId={manuscriptId}
          manuscriptShortId={manuscriptShortId}
          onChange={(value, path) =>
            updateReviewJsonData(review.id, value, path, false, manuscriptId)
          }
          shouldStoreFilesInForm
          showEditorOnlyFields={false}
          tagForFiles="review"
          threadedDiscussionProps={threadedDiscussionProps}
        />
      )}
      {review && !showForm && (
        <ReviewData
          review={review}
          reviewForm={reviewForm}
          showEditorOnlyFields={showEditorOnlyFields}
          threadedDiscussionProps={threadedDiscussionProps}
        />
      )}
      {!review && !isAuthorCard && (
        <ReviewItemsContainer>
          <i>{t('modals.reviewReport.reviewNotCompleted')}</i>
        </ReviewItemsContainer>
      )}
    </Modal>
  )
}

const CheckboxActions = ({
  review,
  reviewerTeamMember,
  updateSharedStatusForInvitedReviewer,
  updateTeamMember,
  updateCollaborativeTeamMember,
  isInvitation,
  manuscriptId,
  updateReview,
}) => {
  const { controlPanel } = useContext(ConfigContext)
  const { t } = useTranslation()

  const { hideReview, sharedReview } = controlPanel ?? {}

  const toggleSharedStatus = async () => {
    if (isInvitation) {
      await updateSharedStatusForInvitedReviewer({
        variables: {
          invitationId: reviewerTeamMember.id,
          isShared: !reviewerTeamMember.isShared,
        },
      })
    } else if (review.isCollaborative) {
      await updateCollaborativeTeamMember({
        variables: {
          manuscriptId,
          input: JSON.stringify({ isShared: !reviewerTeamMember.isShared }),
        },
      })
    } else {
      await updateTeamMember({
        variables: {
          id: reviewerTeamMember.id,
          input: JSON.stringify({ isShared: !reviewerTeamMember.isShared }),
        },
      })
    }
  }

  const toggleIsHiddenFromAuthor = () => {
    updateReview(
      review?.id,
      {
        isHiddenFromAuthor: !review?.isHiddenFromAuthor,
        manuscriptId,
      },
      manuscriptId,
    )
  }

  const toggleIsHiddenReviewerNameFromPublishedAndAuthor = () => {
    updateReview(
      review?.id,
      {
        isHiddenReviewerName: !review?.isHiddenReviewerName,
        manuscriptId,
      },
      manuscriptId,
    )
  }

  return (
    <>
      {review && hideReview && (
        <>
          <Checkbox
            checked={
              review.isHiddenFromAuthor || review.isHiddenFromAuthor == null
            }
            label={t('modals.reviewReport.Hide Review')}
            onChange={toggleIsHiddenFromAuthor}
          />
          <Checkbox
            checked={
              review.isHiddenReviewerName || review.isHiddenReviewerName == null
            }
            label={t('modals.reviewReport.Hide Reviewer Name')}
            onChange={toggleIsHiddenReviewerNameFromPublishedAndAuthor}
          />
        </>
      )}
      {sharedReview && (
        <Checkbox
          checked={reviewerTeamMember?.isShared}
          label={t('modals.reviewReport.Shared')}
          onChange={toggleSharedStatus}
        />
      )}
    </>
  )
}

const ReviewData = ({
  review,
  reviewForm,
  threadedDiscussionProps,
  showEditorOnlyFields,
}) => {
  const reviewFormData = ensureJsonIsParsed(review.jsonData) ?? {}
  const { t } = useTranslation()
  const localizedRecommendations = localizeRecommendations(recommendations, t)

  const recommendationConfig = localizedRecommendations.find(
    item => item.value === get(reviewFormData, '$verdict'),
  )

  const isViewable = element =>
    (showEditorOnlyFields || element.hideFromAuthors !== 'true') &&
    element.hideFromReviewers !== 'true' &&
    element.name !== '$verdict'

  const isFileField = element =>
    ['SupplementaryFiles', 'VisualAbstract'].includes(element.component)

  const nonFileFields = reviewForm.children.filter(
    element => isViewable(element) && !isFileField(element),
  )

  const fileFields = reviewForm.children.filter(
    element => isViewable(element) && isFileField(element),
  )

  return (
    <>
      {recommendationConfig && (
        <StatusContainer>
          <Header>{t('modals.reviewReport.Recommendation')}</Header>
          <ConfigurableStatus color={recommendationConfig.color} lightText>
            {recommendationConfig.label}
          </ConfigurableStatus>
        </StatusContainer>
      )}

      <ReviewItemsContainer>
        {[...nonFileFields, ...fileFields].map(element => (
          <ReviewItemContainer key={element.id}>
            <Header>{element.shortDescription || element.title}</Header>
            <ReadonlyFieldData
              fieldName={element.name}
              form={reviewForm}
              formData={reviewFormData}
              isCollaborativeForm={review.isCollaborative}
              threadedDiscussionProps={threadedDiscussionProps}
            />
          </ReviewItemContainer>
        ))}
      </ReviewItemsContainer>
    </>
  )
}

export default ReviewDetailsModal
