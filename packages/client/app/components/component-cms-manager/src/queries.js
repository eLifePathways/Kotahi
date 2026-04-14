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

const createCmsPageFields = `
    cmsPage {
      id
      url
      content
    }
    success
    error
    column
    errorMessage
`

const deleteCmsPageFields = `
    success
    error
`

export const getCMSPages = gql`
  query cmsPages {
    cmsPages {
      ${cmsPageFields}
    }
  }
`

export const getCMSPage = gql`
  query cmsPage($id: ID!) {
    cmsPage(id: $id) {
      ${cmsPageFields}
    }
  }
`

export const createCMSPageMutation = gql`
  mutation createCMSPage($input: CMSPageInput!) {
    createCMSPage(input: $input) {
      ${createCmsPageFields}
    }
  }
`

export const updateCMSPageDataMutation = gql`
  mutation updateCMSPage($id: ID!, $input: CMSPageInput!) {
    updateCMSPage(id: $id, input: $input) {
        ${cmsPageFields}
    }
  }
`

export const deleteCMSPageMutation = gql`
  mutation deleteCMSPage($id: ID!) {
    deleteCMSPage(id: $id) {
        ${deleteCmsPageFields}
    }
  }
`
export const rebuildFlaxSiteMutation = gql`
  mutation rebuildFlaxSite($params: String) {
    rebuildFlaxSite(params: $params) {
      status
      error
    }
  }
`

export const getCMSLayout = gql`
  query cmsLayout {
    cmsLayout {
      ${cmsLayoutFields}
    }
  }
`

export const getCmsFilesTree = gql`
  query getCmsFilesTree($folderId: ID) {
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
  query getCmsFileContent($id: ID!) {
    getCmsFileContent(id: $id) {
      id
      content
      name
      url
    }
  }
`

export const addResourceToFolder = gql`
  mutation addResourceToFolder($id: ID!, $type: Boolean!) {
    addResourceToFolder(id: $id, type: $type) {
      id
      name
      fileId
      parentId
    }
  }
`

export const deleteResource = gql`
  mutation deleteResource($id: ID!) {
    deleteResource(id: $id) {
      id
      name
      fileId
      parentId
    }
  }
`

export const renameResource = gql`
  mutation renameResource($id: ID!, $name: String!) {
    renameResource(id: $id, name: $name) {
      id
      name
      fileId
      parentId
    }
  }
`

export const updateResource = gql`
  mutation updateResource($id: ID!, $content: String!) {
    updateResource(id: $id, content: $content) {
      id
      content
    }
  }
`

export const getFoldersList = gql`
  query getFoldersList {
    getFoldersList {
      id
      name
      rootFolder
    }
  }
`

export const updateFlaxRootFolder = gql`
  mutation updateFlaxRootFolder($id: ID!) {
    updateFlaxRootFolder(id: $id) {
      id
      name
      rootFolder
    }
  }
`

export const updateCMSLayoutMutation = gql`
  mutation updateCMSLayout($input: CMSLayoutInput!) {
    updateCMSLayout(input: $input) {
      ${cmsLayoutFields}
    }
  }
`

export const createFileMutation = gql`
  mutation ($file: Upload!, $meta: FileMetaInput!) {
    createFile(file: $file, meta: $meta) {
      id
      created
      name
      updated
      tags
      objectId
      storedObjects {
        key
        mimetype
        url
      }
    }
  }
`

export const deleteFileMutation = gql`
  mutation ($id: ID!) {
    deleteFile(id: $id)
  }
`

export const generateNewCoarAuthTokenMutation = gql`
  mutation ($name: String!, $groupId: ID!) {
    generateNewToken(name: $name, groupId: $groupId)
  }
`

export const updateCollectionMutation = gql`
  mutation ($id: ID!, $input: PublishCollectionInput!) {
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

export const createCollectionMutation = gql`
  mutation ($input: PublishCollectionInput!) {
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

export const deleteCollectionMutation = gql`
  mutation ($id: ID!) {
    deleteCollection(id: $id) {
      success
    }
  }
`

export const getManuscriptData = gql`
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

export const getSubmissionForm = gql`
    query(
      $groupId: ID!
    ) {
      submissionForm: formForPurposeAndCategory(purpose: "submit", category: "submission", groupId: $groupId) {
      ${formFields}
    }
  }
`
