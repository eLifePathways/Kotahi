const findReviewerTeamMember = (version, userId) =>
  ((version.teams ?? []).find(t => t.role === 'reviewer')?.members ?? []).find(
    m => m.user.id === userId,
  )

const findCollaborativeReviewerTeamMember = (version, userId) =>
  (
    (version.teams ?? []).find(t => t.role === 'collaborativeReviewer')
      ?.members ?? []
  ).find(m => m.user.id === userId)

/** Find the user's reviewer status in the most recent manuscript-version in which
 *  they were assigned as reviewer. If this was not the current version, then the
 *  statuses 'invited', 'accepted' and 'inProgress' are reported as 'closed'
 */
export const findReviewerStatus = (manuscript, userId) => {
  let memberIsCurrent = true
  let member = findReviewerTeamMember(manuscript, userId)

  if (!member) {
    member = findCollaborativeReviewerTeamMember(manuscript, userId)
  }

  if (!member) {
    memberIsCurrent = false

    for (const version of manuscript.manuscriptVersions) {
      member = findReviewerTeamMember(version, userId)
      if (member) break
    }
  }

  let status = member?.status
  if (
    !status ||
    (!memberIsCurrent && !['completed', 'rejected'].includes(status))
  )
    status = 'closed'

  return status
}
