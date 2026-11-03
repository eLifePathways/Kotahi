import { Team as TeamBase, Transaction } from '@coko/server'
import TeamMember from '../teamMember/teamMember.model'
import User from '../user/user.model'

declare class Team extends TeamBase {
  static findActiveTeamsOfUserOnObject(
    userId: string,
    objectId: string,
    options?: { trx?: Transaction },
  ): Promise<Pick<Team, 'role'>[]>

  static findSharedReviewerMembers(
    manuscriptId: string,
    currentUserId: string,
    options?: { trx?: Transaction },
  ): Promise<{ userId: string }[]>

  static findNonInvitedMembersWithUser(
    objectId: string,
    roles: string[],
    options?: { trx?: Transaction },
  ): Promise<(TeamMember & { user: User })[]>

  static patchInvitedMemberStatus(
    objectId: string,
    role: string,
    userId: string,
    status: string,
    options?: { trx?: Transaction },
  ): Promise<number>

  static findWithUsers(
    objectId: string,
    roles: string[],
    options?: { trx?: Transaction },
  ): Promise<Team[]>

  static findCollaborativeReviewerTeams(
    manuscriptIds: string[],
    options?: { trx?: Transaction },
  ): Promise<Team[]>
}

export = Team
