import { BaseModel, Transaction } from '@coko/server'

type EmailContent = {
  cc: string | null
  subject: string
  body: string
  description: string
  ccEditors: boolean
}

declare class EmailTemplate extends BaseModel {
  emailContent: EmailContent
  emailTemplateType: string | null
  emailTemplateKey: string
  groupId: string | null

  static findByDescription(
    groupId: string,
    type: string,
    description: string,
    options?: { trx?: Transaction },
  ): Promise<EmailTemplate[]>

  static patchBySubject(
    groupId: string,
    subject: string,
    data: Partial<Pick<EmailTemplate, 'emailTemplateType' | 'emailContent'>>,
    options?: { trx?: Transaction },
  ): Promise<number>
}

export = EmailTemplate
