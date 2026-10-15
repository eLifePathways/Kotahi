import { Team as TeamBase, Transaction } from '@coko/server'

declare class Team extends TeamBase {
  static isUserInRolesForObject(
    userId: string,
    objectId: string,
    roles: string[],
    options?: { trx?: Transaction; excludeTeamId?: string },
  ): Promise<boolean>
}

export = Team
