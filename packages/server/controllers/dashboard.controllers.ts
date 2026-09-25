import TeamMember from '../models/teamMember/teamMember.model'
import Manuscript from '../models/manuscript/manuscript.model'

const AUTHOR_ROLE = 'author'
const REVIEWER_ROLES = ['reviewer', 'collaborativeReviewer']
const ACTIONABLE_REVIEWER_STATUSES = ['invited', 'accepted', 'inProgress']
const EDITOR_ROLES = ['editor', 'handlingEditor', 'seniorEditor']
const ALMOST_OVERDUE_THRESHOLD_DAYS = 2

type ActionType =
  | 'authorSubmit'
  | 'authorRevise'
  | 'reviewerRespond'
  | 'reviewerSubmit'
  | 'editorDecide'
  | 'taskOverdue'
  | 'taskAlmostOverdue'

type Bucket = 'submissions' | 'review' | 'editingQueue'

type ActionCardItem = {
  id: string
  type: ActionType
  bucket: Bucket
  shortId: string
  title: string
}

type TableCardData = {
  totalCount: number
}

type DashboardData = {
  actionCardData: ActionCardItem[]
  submissionsData: TableCardData
  reviewData: TableCardData
  editingQueueData: TableCardData
}

const getManuscriptTitle = (manuscript: Manuscript): string =>
  manuscript.submission?.$title || ''

const manuscriptsForRole = (
  userId: string,
  groupId: string,
  roles: string[],
): Promise<Manuscript[]> =>
  Manuscript.getLatestVersionsOfManuscriptsUserHasRolesIn(
    userId,
    groupId,
    roles,
  )

const getReviewerStatusesByManuscriptId = async (
  userId: string,
  groupId: string,
): Promise<Map<string, string>> => {
  const rows = await TeamMember.getReviewerStatusesForUser(userId, groupId, {
    statusFilter: ACTIONABLE_REVIEWER_STATUSES,
  })

  return new Map(rows.map(row => [row.manuscriptId, row.status]))
}

export const getDashboardData = async (
  userId: string,
  groupId: string,
): Promise<DashboardData> => {
  const now = new Date()
  const almostOverdueThreshold = new Date(
    now.getTime() + ALMOST_OVERDUE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000,
  )

  const [
    authorManuscripts,
    reviewerManuscripts,
    editorManuscripts,
    reviewerStatusesByManuscriptId,
    dueTaskManuscripts,
  ] = await Promise.all([
    manuscriptsForRole(userId, groupId, [AUTHOR_ROLE]),
    manuscriptsForRole(userId, groupId, REVIEWER_ROLES),
    manuscriptsForRole(userId, groupId, EDITOR_ROLES),
    getReviewerStatusesByManuscriptId(userId, groupId),
    Manuscript.findManuscriptsWithOverdueTasksForUser(userId, groupId, {
      dueBefore: almostOverdueThreshold,
    }),
  ])

  const actionCardData: ActionCardItem[] = []

  authorManuscripts.forEach(manuscript => {
    let type: ActionType | null = null

    if (manuscript.status === 'new' && !manuscript.submittedDate) {
      type = 'authorSubmit'
    } else if (manuscript.status === 'revise') {
      type = 'authorRevise'
    }

    if (type) {
      actionCardData.push({
        id: `${type}-${manuscript.id}`,
        type,
        bucket: 'submissions',
        shortId: String(manuscript.shortId),
        title: getManuscriptTitle(manuscript),
      })
    }
  })

  reviewerManuscripts.forEach(manuscript => {
    const status = reviewerStatusesByManuscriptId.get(manuscript.id)
    let type: ActionType | null = null

    if (status === 'invited') {
      type = 'reviewerRespond'
    } else if (status === 'accepted' || status === 'inProgress') {
      type = 'reviewerSubmit'
    }

    if (type) {
      actionCardData.push({
        id: `${type}-${manuscript.id}`,
        type,
        bucket: 'review',
        shortId: String(manuscript.shortId),
        title: getManuscriptTitle(manuscript),
      })
    }
  })

  editorManuscripts.forEach(manuscript => {
    if (!manuscript.decision && manuscript.status !== 'new') {
      actionCardData.push({
        id: `editorDecide-${manuscript.id}`,
        type: 'editorDecide',
        bucket: 'editingQueue',
        shortId: String(manuscript.shortId),
        title: getManuscriptTitle(manuscript),
      })
    }
  })

  /**
   * overdue/almost-overdue tasks - bucketed by the user's own role on thatmanuscript
   * priority: editor > reviewer > author
   */
  const authorManuscriptIds = authorManuscripts.map(m => m.id)
  const reviewerManuscriptIds = reviewerManuscripts.map(m => m.id)
  const editorManuscriptIds = editorManuscripts.map(m => m.id)

  dueTaskManuscripts.forEach(manuscript => {
    let bucket: Bucket | null = null

    if (editorManuscriptIds.includes(manuscript.id)) {
      bucket = 'editingQueue'
    } else if (reviewerManuscriptIds.includes(manuscript.id)) {
      bucket = 'review'
    } else if (authorManuscriptIds.includes(manuscript.id)) {
      bucket = 'submissions'
    }

    if (bucket) {
      const type: ActionType =
        new Date(manuscript.nextTaskDueDate) < now
          ? 'taskOverdue'
          : 'taskAlmostOverdue'

      actionCardData.push({
        id: `${type}-${manuscript.id}`,
        type,
        bucket,
        shortId: String(manuscript.shortId),
        title: getManuscriptTitle(manuscript),
      })
    }
  })

  return {
    actionCardData,
    submissionsData: { totalCount: authorManuscripts.length },
    reviewData: { totalCount: reviewerManuscripts.length },
    editingQueueData: { totalCount: editorManuscripts.length },
  }
}
