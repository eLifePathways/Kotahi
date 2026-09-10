/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */

import { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { set, flatten } from 'lodash'
import { ensureJsonIsParsed } from '../../../../../shared/objectUtils'
import ReadonlyFormTemplate from '../metadata/ReadonlyFormTemplate'
import Review from './Review'
import EditorSection from '../decision/EditorSection'
import {
  Columns,
  Manuscript,
  SectionContent,
  HiddenTabs,
  ErrorBoundary,
  VersionSwitcher,
} from '../../../../shared'
import MessageContainer from '../../../../component-chat/src/MessageContainer'
import ChatPanelExpandButton from '../../../../../ui/shared/ChatPanelExpandButton'
import SharedReviewerGroupReviews from './SharedReviewerGroupReviews'
import FormTemplate from '../../../../component-submit/src/components/FormTemplate'
import { ConfigContext } from '../../../../config/src'
import YjsContext from '../../../../provider-yjs/YjsProvider'
import { NEW_REVIEW_FRAGMENT } from '../../../../../queries'

const FloatingChatPanelExpandButton = styled(ChatPanelExpandButton)`
  margin-top: 16px;
  position: absolute;
  right: 18px;
`

const ReviewLayout = ({
  currentUser,
  currentUserReview,
  versions,
  reviewForm,
  // isValid,
  channels,
  channelId,
  submissionForm,
  createFile,
  deleteFile,
  decisionForm,
  hideChat = false,
  threadedDiscussionProps,
  chatProps,
  initialChatExpanded,
  saveChatExpanded,
  updateReviewMutation,
  updateReviewerStatus,
  versionsOfManuscriptCurrentUserIsReviewerOf,
}) => {
  const navigate = useNavigate()
  const config = useContext(ConfigContext) || {}
  const { createYjsProvider, wsProvider } = useContext(YjsContext)

  const { urlFrag } = config
  const priorVersions = versions.slice(1)
  priorVersions.reverse() // Convert to chronological order (was reverse-chron)

  const { t } = useTranslation()

  const channelData = chatProps?.channelsData?.find(
    channel => channel?.channelId === channelId,
  )

  useEffect(() => {
    if (currentUserReview?.id) {
      wsProvider?.disconnect()
    }

    if (currentUserReview && currentUserReview.isCollaborative) {
      setTimeout(() => {
        if (!wsProvider || wsProvider?.roomname !== currentUserReview.id) {
          createYjsProvider({
            currentUser,
            identifier: currentUserReview.id,
            object: {
              objectType: 'Review',
              category: 'review',
              purpose: 'review',
            },
          })
        }
      }, 500)
    }

    // return () => {
    //   if (wsProvider && wsProvider?.roomname !== currentUserReview.id) {
    //     wsProvider?.disconnect()
    //   }
    // }
  }, [currentUserReview.id])

  const createMetaDataSection = latestManuscript => {
    return (
      <div key={latestManuscript.id}>
        <ReadonlyFormTemplate
          form={submissionForm}
          formData={latestManuscript}
          manuscript={latestManuscript}
          showEditorOnlyFields={false}
          threadedDiscussionProps={threadedDiscussionProps}
        />
      </div>
    )
  }

  const createEditorSection = latestManuscript => {
    return (
      <div key={latestManuscript.id}>
        <EditorSection
          currentUser={currentUser}
          manuscript={latestManuscript}
          readonly
        />
      </div>
    )
  }

  const createReviewsSection = latestManuscript => {
    const sharedReviewsData = latestManuscript.reviews.filter(
      r =>
        r.isSharedWithCurrentUser &&
        r.user?.id !== currentUser.id &&
        !r.isDecision,
    )

    const reviewData = currentUserReview
      ? ensureJsonIsParsed(currentUserReview?.jsonData)
      : {}

    const reviewersTeams = latestManuscript.teams.filter(
      team => team.role === 'reviewer' || team.role === 'collaborativeReviewer',
    ) || { members: [] }

    const reviewerStatus = flatten(
      reviewersTeams.map(team => team.members),
    ).find(member => member.user.id === currentUser?.id)?.status

    const updateReviewJsonData = (manuscriptId, review, value, path) => {
      const delta = {} // Only the changed fields
      // E.g. if path is 'foo.bar' and value is 'Baz' this gives { foo: { bar: 'Baz' } }
      //   set(delta, path, value)
      set(delta, path, value)

      const reviewPayload = {
        jsonData: JSON.stringify(delta),
        // TODO The following fields ought to be left out. They are needed only
        // because we are currently catering for unexplained scenarios where there
        // is no pre-existing review object by the time we arrive at this page.
        // Thus we are potentially adding a new entry to the DB and need to supply
        // the relevant values.
        // We should instead ensure that a review object is always created prior to
        // the reviewer visiting this page, then we don't need this.
        isDecision: false,
        manuscriptId,
        userId: review.userId,
        isHiddenReviewerName: review.isHiddenReviewerName,
        isHiddenFromAuthor: review.isHiddenFromAuthor,
      }

      return updateReviewMutation({
        variables: { id: review.id, input: reviewPayload },
        update: (cache, { data: { updateReview: updateReviewTemp } }) => {
          cache.modify({
            id: cache.identify(latestManuscript.id),
            fields: {
              /* eslint-disable-next-line default-param-last */
              reviews(existingReviewRefs = [], { readField }) {
                const newReviewRef = cache.writeFragment({
                  data: updateReviewTemp,
                  fragment: NEW_REVIEW_FRAGMENT,
                })

                if (
                  existingReviewRefs.some(
                    ref => readField('id', ref) === updateReviewTemp.id,
                  )
                ) {
                  return existingReviewRefs
                }

                return [...existingReviewRefs, newReviewRef]
              },
            },
          })
        },
      })
    }

    const handleSubmit = async () => {
      await updateReviewerStatus({
        variables: {
          status: 'completed',
          manuscriptId: latestManuscript.id,
        },
      })

      navigate(`${urlFrag}/dashboard`)
    }

    const isLatestVersion = latestManuscript.id === versions[0].manuscript.id

    return (
      <div key={latestManuscript.id}>
        {reviewerStatus === 'completed' ||
        reviewerStatus === 'closed' ||
        !isLatestVersion ? (
          <Review
            isOldUnsubmitted={
              reviewerStatus !== 'completed' && reviewerStatus !== 'closed'
            }
            isReview
            review={currentUserReview}
            reviewForm={reviewForm}
            sharedReviews={sharedReviewsData}
            threadedDiscussionProps={threadedDiscussionProps}
          />
        ) : (
          <SectionContent>
            <FormTemplate
              collaborativeObject={{
                identifier: currentUserReview.id,
                currentUser,
              }}
              createFile={createFile}
              deleteFile={deleteFile}
              form={reviewForm}
              formikOptions={{
                enableReinitialize: currentUserReview.isCollaborative,
              }}
              initialValues={reviewData}
              isCollaborative={currentUserReview.isCollaborative}
              manuscriptId={latestManuscript.id}
              manuscriptShortId={latestManuscript.shortId}
              manuscriptStatus={latestManuscript.status}
              onChange={(value, path) =>
                updateReviewJsonData(
                  latestManuscript.id,
                  currentUserReview,
                  value,
                  path,
                )
              }
              onSubmit={handleSubmit}
              shouldStoreFilesInForm
              showEditorOnlyFields={false}
              submissionButtonText={t('reviewPage.Submit')}
              tagForFiles="review"
              threadedDiscussionProps={threadedDiscussionProps}
            />
          </SectionContent>
        )}
      </div>
    )
  }

  const createOtherReviewsSection = latestManuscript => {
    return (
      <div key={latestManuscript.id}>
        <SharedReviewerGroupReviews
          manuscript={latestManuscript}
          reviewerId={currentUser.id}
          reviewForm={reviewForm}
          threadedDiscussionProps={threadedDiscussionProps}
        />
      </div>
    )
  }

  const createDecisionDataSection = latestManuscript => {
    const decision = latestManuscript.reviews.find(r => r.isDecision) || {}

    const decisionIsCompleteData = [
      'accepted',
      'revise',
      'rejected',
      'evaluated',
      'published',
    ].includes(latestManuscript.status)

    const redactedDecisionFormData = decisionIsCompleteData
      ? decisionForm
      : {
          ...decisionForm,
          children: decisionForm.children.filter(
            x => x.component === 'ThreadedDiscussion',
          ),
        }

    let formData = {}

    try {
      formData = JSON.parse(decision.jsonData || '{}')
    } catch (error) {
      console.error('Error parsing decision jsonData:', error)
    }

    return (
      <ReadonlyFormTemplate
        form={redactedDecisionFormData}
        formData={formData}
        hideSpecialInstructions
        manuscript={latestManuscript}
        threadedDiscussionProps={threadedDiscussionProps}
        title={decisionForm.name}
      />
    )
  }

  const reviewTabs = versions
    .filter(({ manuscript: version }) =>
      versionsOfManuscriptCurrentUserIsReviewerOf.includes(version.id),
    )
    .map(({ manuscript: version, label }) => {
      const sharedReviewsForManuscriptVersion = version.reviews.filter(
        r =>
          r.isSharedWithCurrentUser &&
          r.user?.id !== currentUser.id &&
          !r.isDecision,
      )

      const reviewSectionsData = []
      reviewSectionsData.push({
        content: createMetaDataSection(version),
        key: 'metadata',
        label: 'Metadata',
      })
      if (version.meta.source)
        reviewSectionsData.push({
          content: createEditorSection(version),
          key: 'editor',
          label: 'Manuscript',
        })
      reviewSectionsData.push({
        content: createReviewsSection(version),
        key: 'review',
        label: 'Review',
      })
      if (sharedReviewsForManuscriptVersion?.length)
        reviewSectionsData.push({
          content: createOtherReviewsSection(version),
          key: 'other-reviews',
          label: 'Other Reviews',
        })
      if (
        config?.review?.showSummary &&
        version.reviews.find(r => r.isDecision)
      )
        reviewSectionsData.push({
          content: createDecisionDataSection(version),
          key: 'decision-data',
          label: decisionForm.name,
        })

      return {
        key: version.id,
        label,
        content: (
          <HiddenTabs
            defaultActiveKey={reviewSectionsData[0]?.key}
            sections={reviewSectionsData}
            shouldFillFlex
          />
        ),
      }
    })

  const [isDiscussionVisible, setIsDiscussionVisible] =
    useState(initialChatExpanded)

  const toggleSubmissionDiscussionVisibility = () => {
    const isExpanded = !isDiscussionVisible
    setIsDiscussionVisible(isExpanded)
    saveChatExpanded(isExpanded)

    // Refresh unread counts/notification data in the background so the
    // collapsed chat button's badge stays accurate. This must not block the
    // panel from opening/closing above.
    const { channelsData } = chatProps || {}

    const dataRefetchPromises = (channelsData || []).map(async channel => {
      await channel?.refetchUnreadMessagesCount?.()
      await channel?.refetchNotificationOptionData?.()
    })

    Promise.all(dataRefetchPromises).catch(error => {
      console.error('Error refreshing discussion data:', error)
    })
  }

  return (
    <Columns>
      <Manuscript>
        <ErrorBoundary>
          <VersionSwitcher
            fullWidth={hideChat}
            key={reviewTabs.length}
            versions={reviewTabs}
          />
        </ErrorBoundary>
      </Manuscript>
      {!hideChat && (
        <>
          <MessageContainer
            channelId={channelId}
            channels={channels}
            chatProps={chatProps}
            currentUser={currentUser}
            isOpen={isDiscussionVisible}
            onToggle={toggleSubmissionDiscussionVisibility}
          />
          <FloatingChatPanelExpandButton
            isOpen={isDiscussionVisible}
            onClick={toggleSubmissionDiscussionVisibility}
            unreadCount={channelData?.unreadMessagesCount}
          />
        </>
      )}
    </Columns>
  )
}

ReviewLayout.propTypes = {
  currentUser: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
  versions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      reviews: PropTypes.arrayOf(PropTypes.shape({})),
      status: PropTypes.string.isRequired,
      meta: PropTypes.shape({ source: PropTypes.string }).isRequired,
      files: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
          storedObjects: PropTypes.arrayOf(PropTypes.object.isRequired),
        }).isRequired,
      ).isRequired,
    }).isRequired,
  ).isRequired,
  currentUserReview: PropTypes.shape({}),
  channelId: PropTypes.string.isRequired,
  hideChat: PropTypes.bool,
  submissionForm: PropTypes.shape({
    children: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string,
        title: PropTypes.string,
        shortDescription: PropTypes.string,
      }).isRequired,
    ).isRequired,
  }).isRequired,
  versionsOfManuscriptCurrentUserIsReviewerOf: PropTypes.arrayOf(
    PropTypes.string.isRequired,
  ).isRequired,
}

export default ReviewLayout
