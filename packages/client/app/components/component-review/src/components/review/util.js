import { uuid } from '@coko/client'

export const isCurrentUserCollaborative = (manuscript, currentUser) =>
  !!(
    manuscript?.teams?.find(team => team.role === 'collaborativeReviewer')
      ?.members || []
  ).find(member => member?.user?.id === currentUser?.id)

export const getCurrentUserReview = (manuscript, currentUser) => {
  const isUserCollaborative = isCurrentUserCollaborative(
    manuscript,
    currentUser,
  )

  return (
    manuscript?.reviews
      ?.filter(r => r.isCollaborative === isUserCollaborative)
      .find(review =>
        isUserCollaborative && !review.isDecision
          ? true
          : review.user?.id === currentUser.id && !review.isDecision,
      ) || {
      id: uuid(),
      isDecision: false,
      isHiddenReviewerName: true,
      jsonData: {},
      manuscriptId: manuscript?.id,
      userId: currentUser.id,
    }
  )
}
