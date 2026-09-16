import { BaseModel } from '@coko/server'

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
}

export = User
