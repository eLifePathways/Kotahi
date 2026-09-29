import TeamMember from '../models/teamMember/teamMember.model'
import Manuscript from '../models/manuscript/manuscript.model'
import Config from '../models/config/config.model'

const AUTHOR_ROLE = 'author'
const REVIEWER_ROLES = ['reviewer', 'collaborativeReviewer']
const ACTIONABLE_REVIEWER_STATUSES = ['invited', 'accepted', 'inProgress']
const EDITOR_ROLES = ['editor', 'handlingEditor', 'seniorEditor']
const ALMOST_OVERDUE_THRESHOLD_DAYS = 2

type ActionType =
  | 'authorSubmit'
  | 'authorRevise'
  | 'authorSubmitRevision'
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
  manuscriptId: string
  shortId: string
  title: string
}

type TableCardData = {
  totalCount: number
}

type DashboardData = {
  actionCardData: ActionCardItem[]
  submissionsData: TableCardData | null
  reviewData: TableCardData | null
  editingQueueData: TableCardData | null
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

  const config = await Config.getActive(groupId)
  const showSections: string[] = config?.formData?.dashboard?.showSections ?? []
  const showSubmissions = showSections.includes('submission')
  const showReviews = showSections.includes('review')
  const showEdits = showSections.includes('editor')

  const [
    authorManuscripts,
    reviewerManuscripts,
    editorManuscripts,
    reviewerStatusesByManuscriptId,
    dueTaskManuscripts,
  ] = await Promise.all([
    showSubmissions ? manuscriptsForRole(userId, groupId, [AUTHOR_ROLE]) : [],
    showReviews ? manuscriptsForRole(userId, groupId, REVIEWER_ROLES) : [],
    showEdits ? manuscriptsForRole(userId, groupId, EDITOR_ROLES) : [],
    showReviews
      ? getReviewerStatusesByManuscriptId(userId, groupId)
      : new Map<string, string>(),
    showSubmissions || showReviews || showEdits
      ? Manuscript.findManuscriptsWithOverdueTasksForUser(userId, groupId, {
          dueBefore: almostOverdueThreshold,
        })
      : [],
  ])

  const actionCardData: ActionCardItem[] = []

  authorManuscripts.forEach(manuscript => {
    let type: ActionType | null = null

    if (manuscript.status === 'new' && !manuscript.submittedDate) {
      type = 'authorSubmit'
    } else if (manuscript.status === 'revise') {
      type = 'authorRevise'
    } else if (manuscript.status === 'revising') {
      type = 'authorSubmitRevision'
    }

    if (type) {
      actionCardData.push({
        id: `${type}-${manuscript.id}`,
        type,
        bucket: 'submissions',
        manuscriptId: manuscript.id,
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
        manuscriptId: manuscript.id,
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
        manuscriptId: manuscript.id,
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
        manuscriptId: manuscript.id,
        shortId: String(manuscript.shortId),
        title: getManuscriptTitle(manuscript),
      })
    }
  })

  return {
    actionCardData,
    submissionsData: showSubmissions
      ? { totalCount: authorManuscripts.length }
      : null,
    reviewData: showReviews ? { totalCount: reviewerManuscripts.length } : null,
    editingQueueData: showEdits
      ? { totalCount: editorManuscripts.length }
      : null,
  }
}
