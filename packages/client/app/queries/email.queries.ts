import { gql } from '@apollo/client'

export const SEND_EMAIL = gql`
  mutation SendEmail($input: String!) {
    sendEmail(input: $input) {
      invitation {
        id
      }
      response {
        success
      }
    }
  }
`

export const GET_TEMPLATE_VARIABLES = gql`
  query GetVariables($groupId: ID!) {
    getVariables(groupId: $groupId) {
      label
      value
      type
      form
    }
  }
`

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

export const DELETE_EMAIL_TEMPLATE = gql`
  mutation deleteEmailTemplate($id: ID!) {
    deleteEmailTemplate(id: $id) {
      success
      error
    }
  }
`

export const CREATE_EMAIL_TEMPLATE = gql`
  mutation createEmailTemplate($input: EmailTemplateInput!) {
    createEmailTemplate(input: $input) {
      ${commonEmailTemplateFields}
    }
  }
`

export const UPDATE_EMAIL_TEMPLATE = gql`
  mutation updateEmailTemplate($input: EmailTemplateInput!) {
    updateEmailTemplate(input: $input) {
      ${commonEmailTemplateFields}
    }
  }
`

export const GET_EMAIL_TEMPLATES = gql`
  query EmailTemplates {
    emailTemplates {
      id
      created
      updated
      emailTemplateType
      emailContent {
        cc
        subject
        body
        description
        ccEditors
      }
      groupId
    }
  }
`
