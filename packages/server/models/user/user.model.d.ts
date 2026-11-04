import { BaseModel, Transaction } from '@coko/server'
import Identity from '../identity/identity.model'
import Review from '../review/review.model'
import Team from '../team/team.model'

type Options = { trx?: Transaction }

declare class User extends BaseModel {
  admin: boolean | null
  email: string | null
  username: string
  passwordHash: string | null
  online: boolean | null
  passwordResetToken: string | null
  passwordResetTimestamp: string | Record<string, unknown> | null
  profilePicture: string | null
  lastOnline: string | Record<string, unknown> | null
  preferredLanguage: string | null
  identities?: Identity[]
  defaultIdentity?: Identity | null
  teams?: Team[]
  reviews?: Review[]

  static findOneWithIdentity(
    userId: string,
    identityType: string,
    options?: Options,
  ): Promise<User | undefined>
  static getTeams(userId: string, options?: Options): Promise<Team[]>
  static getObjectIdsWithRoles(
    userId: string,
    roles: string[],
    objectIds: string[],
    options?: Options,
  ): Promise<string[]>
  static findByIdentity(
    type: string,
    identifier: string,
    options?: Options,
  ): Promise<User | undefined>
  static countAll(options?: Options): Promise<number>
  static countInTeamsOfObject(
    objectId: string,
    options?: Options,
  ): Promise<number>
  static findByUsernamePrefix(
    prefix: string,
    options?: Options,
  ): Promise<User[]>
  static hasGlobalRole(
    userId: string,
    role: string,
    options?: Options,
  ): Promise<boolean>
  static hasRoleOnObject(
    userId: string,
    role: string,
    objectId: string,
    options?: Options,
  ): Promise<boolean>
  static isEditorOfManuscript(
    userId: string,
    manuscriptId: string,
    options?: Options,
  ): Promise<boolean>
  static isEditorOfAnyManuscript(
    userId: string,
    options?: Options,
  ): Promise<boolean>
  static getGroupAndGlobalRoles(
    userId: string,
    groupId: string,
    options?: Options,
  ): Promise<{ groupRoles: string[]; globalRoles: string[] }>
  static findGroupManagersAndAdmins(
    groupId: string,
    options?: Options,
  ): Promise<User[]>
  static findUsersInGroup(groupId: string, options?: Options): Promise<User[]>
  static findPaginated(
    params: {
      allUsers?: boolean
      groupId?: string
      sort?: string | null
      offset?: number | null
      limit?: number | null
    },
    options?: Options,
  ): Promise<{ totalCount: number; users: User[] }>
}

export = User
