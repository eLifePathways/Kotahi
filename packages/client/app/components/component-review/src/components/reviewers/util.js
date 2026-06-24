export const selectReviewerInvitationEmail = (
  config,
  emailTemplates,
  isCollaborative,
) => {
  let reviewerInvitationEmailTemplate

  if (
    !isCollaborative &&
    config.eventNotification?.reviewerInvitationPrimaryEmailTemplate
  ) {
    reviewerInvitationEmailTemplate =
      config.eventNotification.reviewerInvitationPrimaryEmailTemplate
  } else if (
    isCollaborative &&
    config.eventNotification
      ?.reviewerCollaborativeInvitationPrimaryEmailTemplate
  ) {
    reviewerInvitationEmailTemplate =
      config.eventNotification
        .reviewerCollaborativeInvitationPrimaryEmailTemplate
  } else if (isCollaborative) {
    reviewerInvitationEmailTemplate = emailTemplates.find(
      template =>
        template.emailTemplateType === 'collaborativeReviewerInvitation',
    ).id
  } else {
    reviewerInvitationEmailTemplate = emailTemplates.find(
      template => template.emailTemplateType === 'reviewerInvitation',
    ).id
  }

  return reviewerInvitationEmailTemplate
}

export const findReviewFromReviewer = (allReviews, reviewer) => {
  return allReviews
    .filter(r => r.isCollaborative === reviewer.isCollaborative)
    .find(review => {
      if (review.isCollaborative === true && review?.user === null) {
        return true
      }

      return (
        review.isCollaborative === false &&
        review?.user?.id === reviewer.user.id &&
        review.isDecision === false
      )
    })
}
