import { gql } from '@apollo/client'

import { reviewFields } from './review.queries'

export const ARCHIVE_MANUSCRIPTS = gql`
  mutation ArchiveManuscripts($ids: [ID!]!) {
    archiveManuscripts(ids: $ids)
  }
`

export const UNARCHIVE_MANUSCRIPTS = gql`
  mutation UnarchiveManuscripts($ids: [ID!]!) {
    unarchiveManuscripts(ids: $ids)
  }
`

export const DELETE_MANUSCRIPT = gql`
  mutation DeleteManuscript($id: ID!) {
    deleteManuscript(id: $id)
  }
`

export const DELETE_MANUSCRIPTS = gql`
  mutation DeleteManuscripts($ids: [ID]!) {
    deleteManuscripts(ids: $ids)
  }
`

export const GET_MANUSCRIPTS_AND_FORM = gql`
  query Manuscripts(
    $sort: ManuscriptsSort
    $filters: [ManuscriptsFilter!]!
    $offset: Int
    $limit: Int
    $timezoneOffsetMinutes: Int
    $archived: Boolean!
    $groupId: ID!
  ) {
    paginatedManuscripts(
      sort: $sort
      filters: $filters
      offset: $offset
      limit: $limit
      timezoneOffsetMinutes: $timezoneOffsetMinutes
      archived: $archived
      groupId: $groupId
    ) {
      totalCount
      manuscripts {
        id
        shortId
        meta {
          manuscriptId
        }
        submission
        created
        updated
        firstVersionCreated
        status
        published
        teams {
          id
          role
          members {
            id
            user {
              id
              username
            }
          }
        }
        importSourceServer
        manuscriptVersions {
          id
          shortId
          meta {
            manuscriptId
          }
          submission
          created
          updated
          status
          published
          teams {
            id
            role
            members {
              id
              user {
                defaultIdentity {
                  identifier
                }
                id
                username
              }
            }
          }
          submitter {
            username
            isOnline
            defaultIdentity {
              id
              identifier
              name
            }
            id
            profilePicture
          }
          importSourceServer
        }
        submitter {
          username
          isOnline
          defaultIdentity {
            id
            identifier
            name
          }
          id
          profilePicture
        }
        searchSnippet
      }
    }

    formForPurposeAndCategory(
      purpose: "submit"
      category: "submission"
      groupId: $groupId
    ) {
      structure {
        children {
          id
          component
          name
          title
          shortDescription
          isReadOnly
          validate {
            id
            label
            value
            labelColor
            defaultValue
          }
          validateValue {
            minChars
            maxChars
            minSize
          }
          doiValidation
          doiUniqueSuffixValidation
          options {
            id
            label
            labelColor
            defaultValue
            value
          }
        }
      }
    }
  }
`

export const IMPORT_MANUSCRIPTS = gql`
  mutation ImportManuscripts($groupId: ID!) {
    importManuscripts(groupId: $groupId)
  }
`

export const IMPORTED_MANUSCRIPTS = gql`
  subscription ManuscriptsImportStatus {
    manuscriptsImportStatus
  }
`

const exportFields = `
  versionIdentifier
  created
  updated
  status
  decision
  submission
  importSourceServer
  shortId
  reviews {
    created
    updated
    username
    isDecision
    isHiddenReviewerName
    isHiddenFromAuthor
    isCollaborative
    jsonData
  }
  decisions {
    created
    updated
    username
    isDecision
    isHiddenReviewerName
    isHiddenFromAuthor
    isCollaborative
    isLock
    jsonData
  }
  teams {
    # created
    # updated
    role
    displayName
    members {
      user {
        username
      }
    }
  }
`

export const GET_MANUSCRIPTS_DATA = gql`
  query GetManuscriptsData($selectedManuscripts: [ID!]!) {
    getManuscriptsData(selectedManuscripts: $selectedManuscripts) {
      ${exportFields}
      manuscriptVersions {
        ${exportFields}
      }
    }
  }
`

export const CREATE_MANUSCRIPT = gql`
  mutation CreateManuscript($input: ManuscriptInput) {
    createManuscript(input: $input) {
      id
      created
      manuscriptVersions {
        id
      }
      teams {
        id
        role
        displayName
        objectId
        objectType
        members {
          id
          user {
            id
            username
          }
          status
        }
      }
      status
      reviews {
        open
        created
        user {
          id
          username
        }
      }
      meta {
        source
        manuscriptId
        history {
          type
          date
        }
      }
    }
  }
`

export const UPDATE_MANUSCRIPT = gql`
  mutation UpdateManuscript($id: ID!, $input: String) {
    updateManuscript(id: $id, input: $input) {
      id
      id
      meta {
        source
        manuscriptId
      }
    }
  }
`

export const NEW_MANUSCRIPT_FRAGMENT = gql`
  fragment NewManuscript on Manuscript {
    id
  }
`

export const NEW_MANUSCRIPT_VERSION_FRAGMENT = gql`
  fragment NewManuscriptVersion on Manuscript {
    id
  }
`

const fragmentFields = `
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
  decision
  teams {
    id
    displayName
    role
    objectId
    objectType
    members {
      id
      user {
        id
        username
      }
      status
      isShared
    }
  }
  status
  meta {
    manuscriptId
    source
		comments
    history {
      type
      date
    }
  }
  submission
`

const formStructure = `
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
    }
  }
`

export const MANUSCRIPT = gql`
  query Manuscript($id: ID!, $groupId: ID) {
    manuscript(id: $id) {
      parentId
      ${fragmentFields}
      manuscriptVersions {
        ${fragmentFields}
      }
      channels {
        id
        type
        topic
      }
    }

    versionsOfManuscriptCurrentUserIsReviewerOf(manuscriptId: $id)

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

    submissionForm: formForPurposeAndCategory(purpose: "submit", category: "submission", groupId: $groupId) {
      ${formStructure}
    }

    reviewForm: formForPurposeAndCategory(purpose: "review", category: "review", groupId: $groupId) {
      ${formStructure}
    }

    decisionForm: formForPurposeAndCategory(purpose: "decision", category: "decision", groupId: $groupId) {
      ${formStructure}
    }
  }
`

export const userReviewFields = `
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

export const userFragmentFields = `
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
    ${userReviewFields}
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

export const USER_MANUSCRIPT = gql`
  query Manuscript($id: ID!, $groupId: ID, $submitPurpose: String!, $decisionPurpose: String!, $reviewPurpose: String!) {
    manuscript(id: $id) {
      ${userFragmentFields}
      manuscriptVersions {
        parentId
        ${userFragmentFields}
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

export const USER_UPDATE_MANUSCRIPT = gql`
  mutation UpdateManuscript($id: ID!, $input: String) {
    updateManuscript(id: $id, input: $input) {
      id
      ${userFragmentFields}
    }
  }
`

export const SUBMIT_MANUSCRIPT = gql`
  mutation SubmitManuscript($id: ID!, $input: String) {
    submitManuscript(id: $id, input: $input) {
      id
      ${userFragmentFields}
    }
  }
`

export const CREATE_NEW_MANUSCRIPT_VERSION = gql`
  mutation CreateNewVersion($id: ID!) {
    createNewVersion(id: $id) {
      id
      ${userFragmentFields}
    }
  }
`

const reviewFormFields = `
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
      isReadOnly
    }
  }
`

const manuscriptFields = `
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
      key
      mimetype
      url
    }
  }
  reviews {
    ${reviewFields}
  }
  decision
  invitations {
    id
    declinedReason
    responseComment
    responseDate
    suggestedReviewers {
      firstName
      lastName
      email
      affiliation
    }
    toEmail
    invitedPersonName
    updated
    status
    invitedPersonType
    userId
    isShared
    user {
      id
      username
      profilePicture
      isOnline
      defaultIdentity {
        id
        identifier
      }
    }
  }
  teams {
    id
    displayName
    role
    objectId
    objectType
    members {
      id
      user {
        id
        username
        profilePicture
        isOnline
        email
        defaultIdentity {
          id
          name
          identifier
        }
      }
      updated
      status
      isShared
    }
  }
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
  submission
  published
  formFieldsToPublish {
    objectId
    fieldsToPublish
  }
  tasks {
    id
    created
    updated
    manuscriptId
    description
    groupId
    title
    assignee {
      id
      username
      email
      profilePicture
    }
    assigneeUserId
    defaultDurationDays
    dueDate
    reminderPeriodDays
    sequenceIndex
    status
    assigneeType
    assigneeEmail
    assigneeName
    emailNotifications {
      id
      taskId
      recipientUserId
      recipientType
      notificationElapsedDays
      emailTemplateId
      recipientName
      recipientEmail
      recipientUser {
        id
        username
        email
      }
      sentAt
    }
    notificationLogs {
      id
      taskId
      senderEmail
      recipientEmail
      emailTemplateId
      content
      updated
      created
    }
  }
  
`

export const MANUSCRIPT_FOR_REVIEW = gql`
  query Manuscript($id: ID!, $groupId: ID!) {
    manuscript(id: $id) {
      ${manuscriptFields}
      manuscriptVersions {
        ${manuscriptFields}
      }
      channels {
        id
        type
        topic
      }
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

    submissionForm: formForPurposeAndCategory(purpose: "submit", category: "submission", groupId: $groupId) {
      ${reviewFormFields}
    }

    decisionForm: formForPurposeAndCategory(purpose: "decision", category: "decision", groupId: $groupId) {
      ${reviewFormFields}
    }

    reviewForm: formForPurposeAndCategory(purpose: "review", category: "review", groupId: $groupId) {
      ${reviewFormFields}
    }

    users {
      id
      username
      profilePicture
      isOnline
      email
      defaultIdentity {
        id
        identifier
      }
    }

    doisToRegister(id: $id)

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

export const PUBLISH_MANUSCRIPT = gql`
  mutation PublishManuscript($id: ID!) {
    publishManuscript(id: $id) {
      manuscript {
        id
        published
        status
      }
      steps {
        stepLabel
        succeeded
        errorMessage
      }
    }
  }
`

export const MAKE_DECISION = gql`
  mutation MakeDecision($id: ID!, $decision: String) {
    makeDecision(id: $id, decision: $decision) {
      id
      ${manuscriptFields}
    }
  }
`

export const SET_SHOULD_PUBLISH_FIELD = gql`
  mutation SetShouldPublishField($manuscriptId: ID!, $objectId: ID!, $fieldName: String!, $shouldPublish: Boolean!) {
    setShouldPublishField(
      manuscriptId: $manuscriptId
      objectId: $objectId
      fieldName: $fieldName
      shouldPublish: $shouldPublish
    ) {
      ${manuscriptFields}
    }
  }
`

const manuscriptFragment = `
  id
  shortId
  teams {
    id
    role
    displayName
    members {
      id
      user {
        id
        username
        email
      }
      status
    updated
    }
  }
  status
  authorFeedback {
    assignedAuthors {
      authorName
      assignedOnDate
    }
  }
  meta {
    manuscriptId
    history {
      type
      date
    }
  }
  submission
  created
  updated
  firstVersionCreated
  published
  hasOverdueTasksForUser
  invitations {
    id
    status
    toEmail
    invitedPersonType
    user {
    id
    }
  }
  rolesFound
`

const formForPurposeAndCategoryFragment = `
  formForPurposeAndCategory(purpose: "submit", category: "submission", groupId: $groupId) {
    structure {
      children {
        id
        component
        name
        title
        shortDescription
        isReadOnly
        validate {
          id
          label
          value
          labelColor
          defaultValue
        }
        validateValue {
          minChars
          maxChars
          minSize
        }
        doiValidation
        options {
          id
          label
          labelColor
          defaultValue
          value
        }
      }
    }
  }
`

export const DASHBOARD = gql`
  query Dashboard($reviewerStatus: String, $wantedRoles: [String]!, $sort: ManuscriptsSort, $filters: [ManuscriptsFilter!]!, $offset: Int, $limit: Int, $timezoneOffsetMinutes: Int, $groupId: ID!, $searchInAllVersions: Boolean!) {
    manuscriptsUserHasCurrentRoleIn(
      reviewerStatus: $reviewerStatus
      wantedRoles: $wantedRoles
      sort: $sort
      filters: $filters
      offset: $offset
      limit: $limit
      timezoneOffsetMinutes: $timezoneOffsetMinutes
      groupId: $groupId
      searchInAllVersions: $searchInAllVersions)
      {
        totalCount
        manuscripts {
          manuscriptVersions {
            ${manuscriptFragment}
            parentId
          }
          ${manuscriptFragment}
          searchSnippet
        }
      }
    ${formForPurposeAndCategoryFragment}
  }
`

export const FRONTPAGE = gql`
  query publishedManuscripts(
    $sort: String
    $offset: Int
    $limit: Int
    $groupId: ID!
  ) {
    publishedManuscripts(
      sort: $sort
      offset: $offset
      limit: $limit
      groupId: $groupId
    ) {
      totalCount
      manuscripts {
        id
        status
        files {
          id
          name
          tags
          storedObjects {
            mimetype
            url
          }
        }
        meta {
          manuscriptId
          source
        }
        published
        submission
        publishedArtifacts {
          id
          manuscriptId
          platform
          externalId
          title
          content
          hostedInKotahi
        }
      }
    }
  }
`

export const MANUSCRIPT_FOR_MANUSCRIPT_PAGE = gql`
  query Manuscript($id: ID!) {
    manuscript(id: $id) {
      id
      created
      status
      files {
        id
        tags
        storedObjects {
          mimetype
        }
      }
      meta {
        source
        comments
        manuscriptId
      }
      channels {
        id
        type
      }
    }
  }
`

export const PUBLISHED_MANUSCRIPT_AND_FORMS = gql`
  query PublishedManuscriptAndForms($id: ID!) {
    publishedManuscript(id: $id) {
      id
      meta {
        manuscriptId
      }
      submission
      publishedArtifacts {
        id
        updated
        manuscriptId
        platform
        externalId
        title
        content
        hostedInKotahi
        relatedDocumentUri
        relatedDocumentType
      }
    }
  }
`

const reviewPreviewManuscriptFragmentFields = `
  id
  shortId
  created
  status
  meta {
    manuscriptId
  }
  submission
  files {
    id
    name
    tags
    storedObjects {
      mimetype
      url
    }
  }
`

export const REVIEW_PREVIEW_MANUSCRIPT = gql`
  query($id: ID!, $groupId: ID) {
    manuscript(id: $id) {
      ${reviewPreviewManuscriptFragmentFields}
      manuscriptVersions {
        ${reviewPreviewManuscriptFragmentFields}
      }
    }

    formForPurposeAndCategory(purpose: "submit", category: "submission", groupId: $groupId) {
      structure {
        children {
          title
          shortDescription
          id
          component
          name
          isReadOnly
          hideFromReviewers
          format
        }
      }
    }
  }
`

const productionFileFragment = `
  files {
    id
    name
    tags
    created
    storedObjects {
      type
      key
      mimetype
      size
      url
    }
  }
`

const productionFragmentFields = `
  id
  created
  status
  teams {
    role
    members {
      user {
        id
        created
      }
    }
  }
  ${productionFileFragment}
  submission
  meta {
    source
    comments
    manuscriptId
    previousVersions {
      source
      created
      user {
        id
        userName
      }
    }
  }
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
    previousSubmissions {
      text
      fileIds
      edited
      submitted
      submitter {
        username
        id
      }
    }
  }
`

const productionFormFields = `
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

export const PRODUCTION_MANUSCRIPT = gql`
  query ProductionManuscript($id: ID!, $groupId: ID!, $isCms: Boolean!) {
    manuscript(id: $id) {
      ${productionFragmentFields}
      manuscriptVersions {
        ${productionFragmentFields}
      }
    }

    submissionForm: formForPurposeAndCategory(purpose: "submit", category: "submission", groupId: $groupId) {
      ${productionFormFields}
    }

    articleTemplate(groupId: $groupId, isCms: $isCms) {
      id
      name
      groupId
      ${productionFileFragment}
      article
      css
    }
  }
`

export const PRODUCTION_MANUSCRIPT_UPDATE = gql`
  mutation ProductionManuscriptUpdate($id: ID!, $input: String) {
    updateManuscript(id: $id, input: $input) {
      id
      ${productionFragmentFields}
    }
  }
`

export const SUBMIT_AUTHOR_PROOFING_FEEDBACK = gql`
  mutation($id: ID!, $input: String) {
    submitAuthorProofingFeedback(id: $id, input: $input) {
      id
      ${productionFragmentFields}
    }
  }
`

export const UPDATE_TEMPLATE = gql`
  mutation($id: ID!, $input: UpdateTemplateInput!) {
    updateTemplate(id: $id, input: $input) {
      id
      name
      groupId
      ${productionFileFragment}
      article
      css
    }
  }
`
