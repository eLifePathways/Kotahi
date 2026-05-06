/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/prop-types */

import { useTranslation } from 'react-i18next'
// TODO: Sort out the imports, perhaps make DecisionReview a shared component?
import DecisionReview from '../../../component-review/src/components/decision/DecisionReview'
import ReadonlyFormTemplate from '../../../component-review/src/components/metadata/ReadonlyFormTemplate'

import {
  SectionHeader,
  SectionRow,
  Title,
  SectionContent,
} from '../../../shared'

const Decision = ({
  decisionForm,
  manuscript,
  showEditorOnlyFields,
  threadedDiscussionProps,
  allowAuthorsSubmitNewVersion,
}) => {
  const decisionDataString = manuscript.reviews.find(
    r => r.isDecision,
  )?.jsonData

  const decisionData = decisionDataString
    ? JSON.parse(decisionDataString)
    : null

  const filteredChildren = !manuscript.decision
    ? {
        ...decisionForm,
        children: decisionForm.children.filter(
          formComponent => formComponent.component === 'ThreadedDiscussion',
        ),
      }
    : decisionForm

  return decisionData ? (
    <ReadonlyFormTemplate
      allowAuthorsSubmitNewVersion={allowAuthorsSubmitNewVersion}
      form={filteredChildren}
      formData={decisionData}
      hideSpecialInstructions
      manuscript={manuscript}
      showEditorOnlyFields={showEditorOnlyFields}
      threadedDiscussionProps={threadedDiscussionProps}
    />
  ) : (
    <SectionRow>Pending.</SectionRow>
  )
}

const DecisionAndReviews = ({
  createFile,
  deleteFile,
  manuscript,
  isControlPage = false,
  reviewForm,
  decisionForm,
  showEditorOnlyFields,
  threadedDiscussionProps,
  currentUser,
  allowAuthorsSubmitNewVersion,
  showDecision = true,
  showReviews = true,
}) => {
  const decision =
    manuscript.reviews &&
    !!manuscript.reviews.length &&
    manuscript.reviews.find(review => review.isDecision)

  const reviews =
    (Array.isArray(manuscript.reviews) &&
      manuscript.reviews.filter(review => !review.isDecision)) ||
    []

  if (!currentUser) return null

  const authorTeam =
    manuscript.teams &&
    !!manuscript.teams.length &&
    manuscript.teams.find(team => {
      return team.role.toLowerCase().includes('author')
    })

  const isCurrentUserAuthor = authorTeam
    ? authorTeam.members.find(member => member.user.id === currentUser.id)
    : false

  const reviewsToShow = isControlPage
    ? reviews
    : reviews.filter(
        review => !review.isHiddenFromAuthor && isCurrentUserAuthor,
      )

  const { t } = useTranslation()

  return (
    <>
      {showDecision && (
        <SectionContent>
          <SectionHeader>
            <Title>{decisionForm.name}</Title>
          </SectionHeader>
          <Decision
            allowAuthorsSubmitNewVersion={allowAuthorsSubmitNewVersion}
            decisionForm={decisionForm}
            editor={decision?.user}
            manuscript={manuscript}
            showEditorOnlyFields={showEditorOnlyFields}
            threadedDiscussionProps={threadedDiscussionProps}
          />
        </SectionContent>
      )}
      {showReviews && (
        <SectionContent>
          <SectionHeader>
            <Title>{t('manuscriptSubmit.Reviews')}</Title>
          </SectionHeader>
          {reviewsToShow.length ? (
            reviewsToShow.map((review, index) => (
              <SectionRow key={review.id}>
                <DecisionReview
                  createFile={createFile}
                  currentUser={currentUser}
                  deleteFile={deleteFile}
                  isControlPage={isControlPage}
                  open
                  ordinal={index + 1}
                  readOnly
                  review={review}
                  reviewForm={reviewForm}
                  showEditorOnlyFields={showEditorOnlyFields}
                  teams={manuscript.teams}
                  threadedDiscussionProps={threadedDiscussionProps}
                />
              </SectionRow>
            ))
          ) : (
            <SectionRow>
              {reviews.length
                ? t('manuscriptSubmit.No reviews to show')
                : t('manuscriptSubmit.No completed reviews')}
            </SectionRow>
          )}
        </SectionContent>
      )}
    </>
  )
}

export default DecisionAndReviews
