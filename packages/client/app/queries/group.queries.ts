import { gql } from '@apollo/client'

const fileFields = `
  id
  name
  tags
  storedObjects {
    mimetype
    key
    url
    type
  }
`

export const GET_GROUPS = gql`
  query Groups {
    groups {
      id
      name
      isArchived
      oldConfig
      configs {
        id
        formData
        active
        logo {
          ${fileFields}
        }
        icon {
          ${fileFields}
        }
        flaxSiteUrl
    		translationOverrides
      }
    }
  }
`

export const UPDATE_CONFIG = gql`
  mutation UpdateConfig($id: ID!, $input: ConfigInput) {
    updateConfig(id: $id, input: $input) {
      id
      formData
      active
    }
  }
`

export const GET_CONFIG_AND_EMAIL_TEMPLATES = gql`
  query GetConfigAndEmailTemplates($id: ID!) {
    config(id: $id) {
      id
      formData
      active
      logo {
        ${fileFields}
      }
      
      icon {
        ${fileFields}
      }
      groupId
    }
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
      }
    }
  }
`
