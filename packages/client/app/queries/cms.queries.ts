import { gql } from '@apollo/client'

// #region template

const fileFragment = `
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

export const ARTICLE_TEMPLATE = gql`
  query($groupId: ID!, $isCms: Boolean!) {

    submissionForm: formForPurposeAndCategory(purpose: "submit", category: "submission", groupId: $groupId) {
      ${formFields}
    }

    articleTemplate(groupId: $groupId, isCms: $isCms) {
      id
      name
      groupId
      ${fileFragment}
      article
      css
    }
	}
`

export const CMS_GET_SUBMISSION_FORM = gql`
  query GetSubmissionForm($groupId: ID!) {
    submissionForm: formForPurposeAndCategory(purpose: "submit", category: "submission", groupId: $groupId) {
      ${formFields}
    }
  }
`

export const UPDATE_TEMPLATE = gql`
  mutation($id: ID!, $input: UpdateTemplateInput!) {
    updateTemplate(id: $id, input: $input) {
      id
      name
      groupId
      ${fileFragment}
      article
      css
    }
  }
`

// #endregion template

// #region collections

export const GET_COLLECTIONS = gql`
  query GetPublishingCollection($groupId: ID!) {
    publishingCollection(groupId: $groupId) {
      id
      created
      updated
      formData {
        title
        description
        publicationDate
        image
        issueNumber
      }
      active
      manuscripts {
        id
        submission
      }
      groupId
    }
  }
`

export const DELETE_COLLECTION = gql`
  mutation DeleteCollection($id: ID!) {
    deleteCollection(id: $id) {
      success
    }
  }
`

export const CREATE_COLLECTION = gql`
  mutation CreateCollection($input: PublishCollectionInput!) {
    createCollection(input: $input) {
      id
      created
      updated
      formData {
        title
        description
        publicationDate
        image
        issueNumber
      }
      active
      manuscripts {
        id
        submission
      }
      groupId
    }
  }
`

export const UPDATE_COLLECTION = gql`
  mutation UpdateCollection($id: ID!, $input: PublishCollectionInput!) {
    updateCollection(id: $id, input: $input) {
      id
      created
      updated
      formData {
        title
        description
        publicationDate
        image
        issueNumber
      }
      active
      manuscripts {
        id
        submission
      }
      groupId
    }
  }
`

// #endregion collections

// #region cmspage

const cmsPageFields = `
  id
  content
  created
  url
  status
  title
  updated
  published
  edited
  creator {
    id
    username
  }
`

export const GET_CMS_PAGES = gql`
  query CmsPages {
    cmsPages {
      ${cmsPageFields}
    }
  }
`

export const GET_CMS_PAGE = gql`
  query CmsPage($id: ID!) {
    cmsPage(id: $id) {
      ${cmsPageFields}
    }
  }
`

export const UPDATE_CMS_PAGE_DATA = gql`
  mutation UpdateCMSPage($id: ID!, $input: CMSPageInput!) {
    updateCMSPage(id: $id, input: $input) {
        ${cmsPageFields}
    }
  }
`

export const CREATE_CMS_PAGE = gql`
  mutation CreateCMSPage($input: CMSPageInput!) {
    createCMSPage(input: $input) {
      cmsPage {
        id
        url
        content
      }
      success
      error
      column
      errorMessage
    }
  }
`

export const DELETE_CMS_PAGE = gql`
  mutation DeleteCMSPage($id: ID!) {
    deleteCMSPage(id: $id) {
      success
      error
    }
  }
`

// #endregion cmspage

// #region cmslayout

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

const flaxPageConfigFields = `
    id
    title
    sequenceIndex
    shownInMenu
    url
`

const cmsLayoutFields = `
    id
    created
    updated
    primaryColor
    secondaryColor
    footerText
    published
    edited
    isPrivate
    hexCode
    flaxHeaderConfig {
      ${flaxPageConfigFields}
    }
    flaxFooterConfig {
      ${flaxPageConfigFields}
    }
    partners {
      id
      url
      sequenceIndex
      file {
       ${fileFields}
      }
    }
    logo {
      ${fileFields}
    }
    css
`

export const GET_CMS_LAYOUT = gql`
  query CmsLayout {
    cmsLayout {
      ${cmsLayoutFields}
    }
  }
`

export const UPDATE_CMS_LAYOUT = gql`
  mutation UpdateCMSLayout($input: CMSLayoutInput!) {
    updateCMSLayout(input: $input) {
      ${cmsLayoutFields}
    }
  }
`

// #endregion cmslayour

// #region resource

export const ADD_RESOURCE_TO_FOLDER = gql`
  mutation AddResourceToFolder($id: ID!, $type: Boolean!) {
    addResourceToFolder(id: $id, type: $type) {
      id
      name
      fileId
      parentId
    }
  }
`

export const DELETE_RESOURCE = gql`
  mutation DeleteResource($id: ID!) {
    deleteResource(id: $id) {
      id
      name
      fileId
      parentId
    }
  }
`

export const RENAME_RESOURCE = gql`
  mutation RenameResource($id: ID!, $name: String!) {
    renameResource(id: $id, name: $name) {
      id
      name
      fileId
      parentId
    }
  }
`

export const UPDATE_RESOURCE = gql`
  mutation UpdateResource($id: ID!, $content: String!) {
    updateResource(id: $id, content: $content) {
      id
      content
    }
  }
`

// #endregion resource

// #region flax

export const REBUILD_FLAX_SITE = gql`
  mutation RebuildFlaxSite($params: String) {
    rebuildFlaxSite(params: $params) {
      status
      error
    }
  }
`

export const UPDATE_FLAX_ROOT_FOLDER = gql`
  mutation UpdateFlaxRootFolder($id: ID!) {
    updateFlaxRootFolder(id: $id) {
      id
      name
      rootFolder
    }
  }
`

// #endregion flax

// #region files

export const getCmsFilesTree = gql`
  query GetCmsFilesTree($folderId: ID) {
    getCmsFilesTree(folderId: $folderId) {
      id
      name
      fileId
      children {
        id
        name
        fileId
        parentId
      }
      parentId
    }
  }
`

export const getCmsFileContent = gql`
  query GetCmsFileContent($id: ID!) {
    getCmsFileContent(id: $id) {
      id
      content
      name
      url
    }
  }
`

export const getFoldersList = gql`
  query GetFoldersList {
    getFoldersList {
      id
      name
      rootFolder
    }
  }
`

// #endregion files

// #region manuscript

export const CMS_GET_MANUSCRIPT_DATA = gql`
  query Manuscripts(
    $sort: ManuscriptsSort
    $filters: [ManuscriptsFilter!]!
    $offset: Int
    $limit: Int
    $timezoneOffsetMinutes: Int
    $groupId: ID!
  ) {
    paginatedManuscripts(
      sort: $sort
      filters: $filters
      offset: $offset
      limit: $limit
      timezoneOffsetMinutes: $timezoneOffsetMinutes
      archived: false
      groupId: $groupId
    ) {
      manuscripts {
        id
        submission
      }
    }
  }
`

// #endregion manuscript
