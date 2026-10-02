import { BaseModel, Transaction } from '@coko/server'
import Review from '../review/review.model'
import User from '../user/user.model'
import Team from '../team/team.model'

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
  static getFirstVersionIdsOfManuscriptsUserHasARoleIn(
    userId: string,
    groupId: string,
  ): Promise<string[]>
  static addReviewer(
    manuscriptId: string,
    userId: string,
    invitationId: string | null,
    isCollaborative: boolean,
    options?: Options,
  ): Promise<Team>
  static findPublishedById(
    id: string,
    options?: Options,
  ): Promise<Manuscript | undefined>
  static getFirstVersionCreated(
    manuscript: Pick<Manuscript, 'id' | 'created' | 'parentId'>,
    options?: Options,
  ): Promise<string>
  static userIsReviewerOfAnyVersion(
    manuscriptId: string,
    userId: string,
    options?: Options,
  ): Promise<boolean>
}

export = Manuscript
