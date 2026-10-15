import { BaseModel, Transaction } from '@coko/server'
import Group from '../group/group.model'

type Options = { trx?: Transaction }

declare class Token extends BaseModel {
  name: string
  value: string
  groupId: string

  group?: Group

  static deleteTokenById(tokenId: string, options?: Options): Promise<number>
  static deleteByNameAndGroupId(
    name: string,
    groupId: string,
    options?: Options,
  ): Promise<number>
  static generateToken(
    name: string,
    value: string,
    groupId: string,
    options?: Options,
  ): Promise<Token>
  static getTokenByNameAndGroupId(
    name: string,
    groupId: string,
    options?: Options,
  ): Promise<string | undefined>
}

export = Token
