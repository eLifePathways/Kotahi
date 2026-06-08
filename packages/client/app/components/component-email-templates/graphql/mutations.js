import { gql } from '@apollo/client'

const commonEmailTemplateFields = `
  emailTemplate {
    id
    emailContent {
      cc
      subject
      body
      description
      ccEditors
    }
    emailTemplateType
    groupId
  }
  success
  error
`

export const DELETE_TEMPLATE = gql`
  mutation deleteEmailTemplate($id: ID!) {
    deleteEmailTemplate(id: $id) {
      success
      error
    }
  }
`

export const CREATE_TEMPLATE = gql`
  mutation createEmailTemplate($input: EmailTemplateInput!) {
    createEmailTemplate(input: $input) {
      ${commonEmailTemplateFields}
    }
  }
`

export const UPDATE_TEMPLATE = gql`
  mutation updateEmailTemplate($input: EmailTemplateInput!) {
    updateEmailTemplate(input: $input) {
      ${commonEmailTemplateFields}
    }
  }
`
