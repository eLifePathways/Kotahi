import { gql } from '@apollo/client'

export const GET_SUBMISSION_FORM_COMPONENTS = gql`
  query FormForPurposeAndCategory($groupId: ID!) {
    formForPurposeAndCategory(
      purpose: "submit"
      category: "submission"
      groupId: $groupId
    ) {
      structure {
        children {
          name
          component
          aiPrompt
        }
      }
    }
  }
`

export const GET_SUBMISSION_FORM = gql`
  query SubmissionForm($groupId: ID!) {
    submissionForm: formForPurposeAndCategory(
      purpose: "submit"
      category: "submission"
      groupId: $groupId
    ) {
      structure {
        name
        description
        haspopup
        popuptitle
        popupdescription
        children {
          title
          shortDescription
          id
          component
          name
          description
          doiValidation
          doiUniqueSuffixValidation
          allowFutureDatesOnly
          placeholder
          permitPublishing
          parse
          format
          options {
            id
            label
            labelColor
            defaultValue
            value
          }
          validate {
            id
            label
            value
          }
          validateValue {
            minChars
            maxChars
            minSize
          }
        }
      }
    }
  }
`

const formFieldsSegment = `
  id
  created
  updated
  purpose
  category
  groupId
  structure {
    name
    description
    haspopup
    popuptitle
    popupdescription
    children {
      title
      shortDescription
      id
      component
      name
      description
      doiValidation
      doiUniqueSuffixValidation
      allowFutureDatesOnly
      uploadAttachmentSource
      isS3Component
      s3Url
      s3Bucket
      s3Region
      allowFutureDatesOnly
      placeholder
      inline
      sectioncss
      parse
      format
      options {
        id
        label
        labelColor
        defaultValue
        value
      }
      validate {
        id
        label
        value
      }
      validateValue {
        minChars
        maxChars
        minSize
      }
      isReadOnly
      hideFromReviewers
      hideFromAuthors
      permitPublishing
      publishingTag
      aiPrompt
      metadataMapping
    }
  }
`

export const CREATE_FORM = gql`
  mutation CreateForm($form: CreateFormInput!) {
    createForm(form: $form) {
      id
    }
  }
`

export const UPDATE_FORM = gql`
  mutation UpdateForm($form: FormInput!) {
    updateForm(form: $form) {
      ${formFieldsSegment}
    }
  }
`

export const UPDATE_FORM_ELEMENT = gql`
  mutation UpdateFormElement($element: FormElementInput!, $formId: ID!) {
    updateFormElement(element: $element, formId: $formId) {
      id
    }
  }
`

export const DELETE_FORM_ELEMENT = gql`
  mutation DeleteFormElement($formId: ID!, $elementId: ID!) {
    deleteFormElement(formId: $formId, elementId: $elementId) {
      id
    }
  }
`

export const DELETE_FORM = gql`
  mutation DeleteForm($formId: ID!) {
    deleteForm(formId: $formId) {
      query {
        forms {
          id
        }
      }
    }
  }
`

export const GET_FORM = gql`
  query GetForm($category: String!, $groupId: ID) {
    formsByCategory(category: $category, groupId: $groupId) {
      ${formFieldsSegment}
    }
  }
`
