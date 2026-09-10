import { useCurrentUser } from './useCurrentUser'

type GroupRoleFlags = {
  isAdmin: boolean
  isGroupAdmin: boolean
  isGroupManager: boolean
}

export const useGroupRole = (): GroupRoleFlags => {
  const currentUser = useCurrentUser()

  return {
    // Alternatively, we could split admin to useGlobalRole
    isAdmin: currentUser.globalRoles.includes('admin'),
    isGroupAdmin: currentUser.groupRoles.includes('groupAdmin'),
    isGroupManager: currentUser.groupRoles.includes('groupManager'),
  }
}

type ManuscriptRoleFlags = {
  isAuthor: boolean
  isReviewer: boolean
  isCollaborativeReviewer: boolean
  isEditor: boolean
  isSeniorEditor: boolean
  isHandlingEditor: boolean
}

export const useManuscriptRole = (
  manuscript: Record<string, any>,
): ManuscriptRoleFlags => {
  const currentUser = useCurrentUser()

  if (!manuscript.teams) {
    console.error(`
      useManuscriptRole: manuscript.teams is missing -- did the query fetch it?
      All roles will return false as a result.
    `)
  }

  const roles = (manuscript.teams ?? [])
    .filter((team: Record<string, any>) =>
      team.members.some(
        (member: Record<string, any>) => member.user.id === currentUser.id,
      ),
    )
    .map((team: Record<string, any>) => team.role)

  return {
    isAuthor: roles.includes('author'),
    isReviewer: roles.includes('reviewer'),
    isCollaborativeReviewer: roles.includes('collaborativeReviewer'),
    isEditor: roles.includes('editor'),
    isSeniorEditor: roles.includes('seniorEditor'),
    isHandlingEditor: roles.includes('handlingEditor'),
  }
}
