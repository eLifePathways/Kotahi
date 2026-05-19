import { gql } from '@apollo/client'

export const reviewFields = `
  id
  created
  updated
  jsonData
  isDecision
  isHiddenFromAuthor
  isHiddenReviewerName
  canBePublishedPublicly
  user {
    id
    profilePicture
    defaultIdentity {
      id
      name
      identifier
    }
    username
  }
`

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
      parse
      format
      options {
        id
        label
        value
        labelColor
        defaultValue
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
      hideFromAuthors
      permitPublishing
      isReadOnly
    }
  }
`

export const fragmentFields = `
  id
  shortId
  created
  files {
    id
    created
    updated
    name
    tags
    storedObjects {
      extension
      key
      mimetype
      size
      type
      url
    }
  }
  reviews {
    ${reviewFields}
  }
  teams {
    id
    role
    objectId
    objectType
    members {
      id
      user {
        id
        username
      }
    }
  }
  decision
  status
  authorFeedback {
    text
    fileIds
    edited
    submitted
    submitter {
      username
      defaultIdentity {
        name
      }
      id
    }
    assignedAuthors {
      authorName
      assignedOnDate
    }
  }
  meta {
    manuscriptId
    source
		comments
    history {
      type
      date
    }
  }
  authors {
    firstName
    lastName
    email
    affiliation
  }
  submission
  formFieldsToPublish {
    objectId
    fieldsToPublish
  }
`

export const SEARCH_ROR = gql`
  query SearchRor($input: String!) {
    searchRor(input: $input) {
      id
      name
    }
  }
`

const query = gql`
  query($id: ID!, $groupId: ID, $submitPurpose: String!, $decisionPurpose: String!, $reviewPurpose: String!) {
    manuscript(id: $id) {
      ${fragmentFields}
      manuscriptVersions {
        parentId
        ${fragmentFields}
      }
      channels {
        id
        type
        topic
      }
    }

    submissionForm: formForPurposeAndCategory(purpose: $submitPurpose, category: "submission", groupId: $groupId) {
      ${formFields}
    }

    decisionForm: formForPurposeAndCategory(purpose: $decisionPurpose, category: "decision", groupId: $groupId) {
      ${formFields}
    }

    reviewForm: formForPurposeAndCategory(purpose: $reviewPurpose, category: "review", groupId: $groupId) {
      ${formFields}
    }

    threadedDiscussions(manuscriptId: $id) {
      id
      created
      updated
      manuscriptId
      threads {
        id
        comments {
          id
          manuscriptVersionId
		  created
		  updated
		  published
          commentVersions {
            id
            author {
              id
              username
              profilePicture
            }
            comment
            created
          }
          pendingVersion {
            author {
              id
              username
              profilePicture
            }
            comment
          }
        }
      }
      userCanAddComment
      userCanEditOwnComment
      userCanEditAnyComment
    }
  }
`

export default query
