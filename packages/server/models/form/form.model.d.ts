import { BaseModel } from '@coko/server'

type FormFieldOption = {
  label: string
  value: string
  labelColor: string
  id: string
}

type FormFieldValidateItem = {
  label: string
  value: string
  id: string
}

type FormFieldValidateValue = {
  minChars: string | null
  maxChars: string | null
  minSize: string | null
} | null

type FormField = {
  options: FormFieldOption[] | null
  title: string | null
  shortDescription: string | null
  id: string
  component: string
  name: string
  description: string | null
  uploadAttachmentSource: string
  s3Url: string
  s3AccessId: string
  s3AccessToken: string
  s3Bucket: string
  s3Region: string
  doiValidation: string | null
  placeholder: string | null
  isReadOnly: string | null
  hideFromReviewers: string | null
  inline: string | null
  sectioncss: string | null
  parse: string | null
  format: string | null
  validate: FormFieldValidateItem[] | null
  validateValue: FormFieldValidateValue
}

type FormStructure = {
  name: string | null
  description: string | null
  haspopup: string
  popuptitle: string | null
  popupdescription: string | null
  children: FormField[]
}

declare class Form extends BaseModel {
  purpose: string
  category: string
  structure: FormStructure
  groupId: string | null

  getFields(): FormField[]
}

export = Form
