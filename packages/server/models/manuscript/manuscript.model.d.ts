import { BaseModel, File, Transaction } from '@coko/server'
import Review from '../review/review.model'
import User from '../user/user.model'
import Team from '../team/team.model'
import Channel from '../channel/channel.model'

type Options = { trx?: Transaction }

type ManuscriptMeta = {
  title?: string
  abstract?: string | null
  source?: string
  comments?: Record<string, unknown>[] | null
  history?: Record<string, unknown>[] | null
  previousVersions?: Record<string, unknown>[] | null
}

type AuthorFeedback = {
  text?: string
  fileIds?: unknown[]
  submitterId?: string | null
  edited?: string | Record<string, unknown> | null
  submitted?: string | Record<string, unknown> | null
  assignedAuthors?: Record<string, unknown>[]
  previousSubmissions?: Record<string, unknown>[]
}

declare class Manuscript extends BaseModel {
  shortId: number
  parentId: string | null
  manuscriptVersions: Record<string, unknown> | null
  files: Record<string, unknown>[] | null
  teams: Record<string, unknown>[] | null
  tasks: Record<string, unknown>[] | null
  reviews: Record<string, unknown>[] | null
  status: string | null
  decision: string | null
  authors: Record<string, unknown>[] | null
  meta: ManuscriptMeta
  submission: any
  submittedDate: string | Record<string, unknown> | null
  submitterId: string | null
  published: string | Record<string, unknown> | null
  evaluationsHypothesisMap: any
  isImported: boolean | null
  importSource: string | null
  importSourceServer: string | null
  isHidden: boolean | null
  formFieldsToPublish: unknown[]
  doi: string | null
  searchableText: string
  groupId: string | null
  authorFeedback: AuthorFeedback | null

  getReviews(statuses?: string[], options?: Options): Promise<Review[]>
  getDecisions(options?: Options): Promise<Review[]>
  getManuscriptAuthor(options?: Options): Promise<User | null>
  getManuscriptEditor(options?: Options): Promise<User | null>
  createNewVersion(): Promise<Manuscript>

  static assignRole(
    userId: string,
    manuscriptId: string,
    role: string,
    options?: Options & {
      status?: string
      isShared?: boolean | null
      throwIfAssigned?: boolean
    },
  ): Promise<Team>

  static removeRole(
    userId: string,
    manuscriptId: string,
    role: string,
    options?: Options & { throwIfNotAssigned?: boolean },
  ): Promise<Team>

  static createTeams(manuscriptId: string, options?: Options): Promise<Team[]>

  static createChannels(
    manuscriptId: string,
    groupId: string,
    options?: Options,
  ): Promise<Channel[]>

  static createNewManuscript(
    data: Partial<Manuscript>,
    options?: Options & { assignSubmitter?: boolean },
  ): Promise<Manuscript>
  getManuscriptVersions(): Promise<Manuscript[]>

  static getReviews(
    manuscriptId: string,
    statuses?: string[],
    options?: Options,
  ): Promise<Review[]>
  static getDecisions(
    manuscriptId: string,
    options?: Options,
  ): Promise<Review[]>
  static getEditorIds(
    manuscriptId: string,
    options?: Options,
  ): Promise<string[]>
  static findImageFileBySourceHash(
    manuscriptId: string,
    sourceHash: string,
    options?: Options,
  ): Promise<File | undefined>
  static getFirstVersionIdsOfManuscriptsUserHasARoleIn(
    userId: string,
    groupId: string,
  ): Promise<string[]>
  static userHasRoleInAnyVersion(
    userId: string,
    manuscriptId: string,
    options?: Options,
  ): Promise<boolean>
  static getLatestVersionsOfManuscriptsUserHasRolesIn(
    userId: string,
    groupId: string,
    roles: string[],
    options?: Options,
  ): Promise<Manuscript[]>
  static findManuscriptsWithOverdueTasksForUser(
    userId: string,
    groupId: string,
    options?: Options & { dueBefore?: Date },
  ): Promise<(Manuscript & { nextTaskDueDate: string })[]>
  static addReviewer(
    manuscriptId: string,
    userId: string,
    invitationId: string | null,
    isCollaborative: boolean,
    options?: Options,
  ): Promise<Team>
  static getOtherVersions(
    manuscriptId: string,
    options?: Options,
  ): Promise<Manuscript[]>
  static getSubmitter(
    manuscriptId: string,
    options?: Options,
  ): Promise<User | undefined>
  static getDoisInGroup(
    groupId: string,
    isHidden: boolean | null,
    options?: Options,
  ): Promise<string[]>
  static clearSubmitter(userId: string, options?: Options): Promise<number>
  static clearSubmitterInGroup(
    userId: string,
    groupId: string,
    options?: Options,
  ): Promise<number>
  static getLatestVersion(
    manuscriptId: string,
    options?: Options,
  ): Promise<Manuscript | undefined>
  static getFirstVersionId(
    versionId: string,
    options?: Options,
  ): Promise<string>
  static getLatestVersionId(
    versionId: string,
    options?: Options,
  ): Promise<string>
  static isActive(manuscriptId: string, options?: Options): Promise<boolean>
  static archiveNewUnlabelledCreatedBefore(
    groupId: string,
    cutoffDate: Date,
    options?: Options,
  ): Promise<number>
  static findByDoi(
    groupId: string,
    doi: string,
    options?: Options,
  ): Promise<Manuscript | undefined>
  static findBySourceUri(
    groupId: string,
    uri: string,
    options?: Options,
  ): Promise<Manuscript | undefined>
  static getGroupId(manuscriptId: string, options?: Options): Promise<string>
  static getFirstVersionIds(ids: string[], options?: Options): Promise<string[]>
  static setIsHiddenOnAllVersions(
    firstVersionIds: string[],
    isHidden: boolean,
    options?: Options,
  ): Promise<string[]>
  static findFilesOfManuscripts(
    manuscriptIds: string[],
    options?: Options,
  ): Promise<File[]>
  static backdateCreated(
    manuscriptId: string,
    created: string | Date,
    options?: Options,
  ): Promise<number>
  static getSupplementaryFiles(
    manuscriptId: string,
    options?: Options,
  ): Promise<File[]>
  static getChannels(
    manuscriptId: string,
    options?: Options,
  ): Promise<Channel[]>
  static findEditorialDiscussionChannel(
    manuscriptId: string,
    options?: Options,
  ): Promise<Channel | undefined>
  static findNonHiddenFirstVersions(options?: Options): Promise<Manuscript[]>
  static findPublishedLatestVersions(
    groupId: string,
    params?: { startDate?: string; limit?: number; offset?: number },
    options?: Options,
  ): Promise<(Manuscript & { totalCount: string })[]>
  static findByIdWithTeamUsersAndChannels(
    id: string,
    options?: Options,
  ): Promise<Manuscript | undefined>
  static findReadyToEvaluate(
    groupId: string,
    options?: Options,
  ): Promise<Manuscript[]>
  static getSummaryStatsForDateRange(
    groupId: string,
    startDate: number,
    endDate: number,
    options?: Options,
  ): Promise<Record<string, string | number | null>>
  static countPublishedSince(
    groupId: string,
    since: Date,
    options?: Options,
  ): Promise<number>
  static countRevisingNow(groupId: string, options?: Options): Promise<number>
  static getReviewAndCompletionDurations(
    groupId: string,
    dataStart: number,
    endDate: number,
    options?: Options,
  ): Promise<
    {
      submitted_ms: string
      review_duration_days: string | null
      full_duration_days: string | null
    }[]
  >
  static findFirstVersionsWithCompletedDate(
    groupId: string,
    dataStart: number,
    endDate: number,
    options?: Options,
  ): Promise<
    (Pick<Manuscript, 'id' | 'submittedDate' | 'published'> & {
      completedDate: string | null
    })[]
  >
  static getActivityByManuscript(
    groupId: string,
    startDate: number,
    endDate: number,
    options?: Options,
  ): Promise<Record<string, unknown>[]>
  static getActivityByEditor(
    groupId: string,
    startDate: number,
    endDate: number,
    options?: Options,
  ): Promise<Record<string, unknown>[]>
  static getActivityByReviewer(
    groupId: string,
    startDate: number,
    endDate: number,
    options?: Options,
  ): Promise<Record<string, unknown>[]>
  static findFirstVersionsWithTeamUsers(
    groupId: string,
    startDate: number,
    endDate: number,
    options?: Options,
  ): Promise<Manuscript[]>
  static findPublishedById(
    id: string,
    options?: Options,
  ): Promise<Manuscript | undefined>
  static getFirstVersionCreated(
    manuscript: Pick<Manuscript, 'id' | 'created' | 'parentId'>,
    options?: Options,
  ): Promise<string>
  static search(
    params: {
      sort: { field: string; isAscending: boolean } | null
      offset: number
      limit: number
      filters: { field: string; value: string }[]
      archived: boolean
      submissionForm: unknown
      timezoneOffsetMinutes: number
      manuscriptIds?: string[] | null
      groupId?: string | null
    },
    options?: Options,
  ): Promise<{
    totalCount: number
    results: {
      id: string
      searchRank: number | undefined
      searchSnippets: { field: string; html: string }[]
    }[]
  }>
  static userIsReviewerOfAnyVersion(
    manuscriptId: string,
    userId: string,
    options?: Options,
  ): Promise<boolean>
}

export = Manuscript
