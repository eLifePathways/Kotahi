import { gql } from '@apollo/client'

const formFields = `
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
`

export default gql`
    query SubmissionForm(
      $groupId: ID!
    ) {
      submissionForm: formForPurposeAndCategory(purpose: "submit", category: "submission", groupId: $groupId) {
      ${formFields}
    }
  }
`
