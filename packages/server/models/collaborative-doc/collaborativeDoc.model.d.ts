import { BaseModel } from '@coko/server'

import type Form from '../form/form.model'

declare class CollaborativeDoc extends BaseModel {
  objectId: string
  objectType: string
  groupId: string
  yDocState: Uint8Array

  readDocState(objName: string, objType: string): unknown

  static getFormData(
    objectId: string,
    form: Form,
  ): Promise<Record<string, unknown>>
}

export = CollaborativeDoc
