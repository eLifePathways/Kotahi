import { BaseModel, Transaction } from '@coko/server'
import Identity from '../identity/identity.model'
import Review from '../review/review.model'
import Team from '../team/team.model'

type Options = { trx?: Transaction }

type ObjectRoles = {
  id: string
  roles: string[]
}

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
  recentTab: string | null
  preferredLanguage: string | null
  identities?: Identity[]
  defaultIdentity?: Identity | null
  teams?: Team[]
  reviews?: Review[]

  currentRoles(object?: {
    objectId: string
    objectType: string
  }): Promise<ObjectRoles[]>
  validPassword(password: string): Promise<boolean>

  static hashPassword(password: string): Promise<string>
  static findOneWithIdentity(
    userId: string,
    identityType: string,
  ): Promise<User | undefined>
  static findByUsernamePrefix(
    prefix: string,
    options?: Options,
  ): Promise<User[]>
  static ownersWithUsername(object: {
    owners: string[]
  }): Promise<Pick<User, 'id' | 'username'>[]>
}

export = User
