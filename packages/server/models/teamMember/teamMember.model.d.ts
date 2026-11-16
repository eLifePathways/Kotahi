import { TeamMember as TeamMemberBase, Transaction } from '@coko/server'

type Options = { trx?: Transaction }

type ReviewerStatus = { manuscriptId: string; status: string }

type GetReviewerStatusesOptions = Options & { statusFilter?: string[] }

declare class TeamMember extends TeamMemberBase {
  isShared: boolean | null

  static findReviewerMemberOnManuscript(
    userId: string,
    manuscriptId: string,
    options?: Options,
  ): Promise<TeamMember | undefined>
  static hasCompletedReview(
    userId: string,
    manuscriptId: string,
    options?: Options,
  ): Promise<boolean>

  static patchByTeamId(
    teamId: string,
    data: Partial<TeamMember>,
    options?: { trx?: Transaction },
  ): Promise<number>
  static patchStatusByTeam(
    teamId: string,
    fromStatuses: string[],
    status: string,
    options?: { trx?: Transaction },
  ): Promise<number>
  static getReviewerStatusesForUser(
    userId: string,
    groupId: string,
    options?: GetReviewerStatusesOptions,
  ): Promise<ReviewerStatus[]>
}

export = TeamMember
