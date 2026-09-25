import { TeamMember as TeamMemberBase, Transaction } from '@coko/server'

type Options = { trx?: Transaction }

type ReviewerStatus = { manuscriptId: string; status: string }

type GetReviewerStatusesOptions = Options & { statusFilter?: string[] }

declare class TeamMember extends TeamMemberBase {
  isShared: boolean | null

  static getReviewerStatusesForUser(
    userId: string,
    groupId: string,
    options?: GetReviewerStatusesOptions,
  ): Promise<ReviewerStatus[]>
}

export = TeamMember
