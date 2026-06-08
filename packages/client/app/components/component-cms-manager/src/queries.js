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
  query CmsPages {
    cmsPages {
      ${cmsPageFields}
    }
  }
`

export const getCMSPage = gql`
  query CmsPage($id: ID!) {
    cmsPage(id: $id) {
      ${cmsPageFields}
    }
  }
`

export const createCMSPageMutation = gql`
  mutation CreateCMSPage($input: CMSPageInput!) {
    createCMSPage(input: $input) {
      ${createCmsPageFields}
    }
  }
`

export const updateCMSPageDataMutation = gql`
  mutation UpdateCMSPage($id: ID!, $input: CMSPageInput!) {
    updateCMSPage(id: $id, input: $input) {
        ${cmsPageFields}
    }
  }
`

export const deleteCMSPageMutation = gql`
  mutation DeleteCMSPage($id: ID!) {
    deleteCMSPage(id: $id) {
        ${deleteCmsPageFields}
    }
  }
`
export const rebuildFlaxSiteMutation = gql`
  mutation RebuildFlaxSite($params: String) {
    rebuildFlaxSite(params: $params) {
      status
      error
    }
  }
`

export const getCMSLayout = gql`
  query CmsLayout {
    cmsLayout {
      ${cmsLayoutFields}
    }
  }
`

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

export const addResourceToFolder = gql`
  mutation AddResourceToFolder($id: ID!, $type: Boolean!) {
    addResourceToFolder(id: $id, type: $type) {
      id
      name
      fileId
      parentId
    }
  }
`

export const deleteResource = gql`
  mutation DeleteResource($id: ID!) {
    deleteResource(id: $id) {
      id
      name
      fileId
      parentId
    }
  }
`

export const renameResource = gql`
  mutation RenameResource($id: ID!, $name: String!) {
    renameResource(id: $id, name: $name) {
      id
      name
      fileId
      parentId
    }
  }
`

export const updateResource = gql`
  mutation UpdateResource($id: ID!, $content: String!) {
    updateResource(id: $id, content: $content) {
      id
      content
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

export const updateFlaxRootFolder = gql`
  mutation UpdateFlaxRootFolder($id: ID!) {
    updateFlaxRootFolder(id: $id) {
      id
      name
      rootFolder
    }
  }
`

export const updateCMSLayoutMutation = gql`
  mutation UpdateCMSLayout($input: CMSLayoutInput!) {
    updateCMSLayout(input: $input) {
      ${cmsLayoutFields}
    }
  }
`

export const createFileMutation = gql`
  mutation CreateFile($file: Upload!, $meta: FileMetaInput!) {
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
  mutation DeleteFile($id: ID!) {
    deleteFile(id: $id)
  }
`

export const generateNewCoarAuthTokenMutation = gql`
  mutation GenerateNewToken($name: String!, $groupId: ID!) {
    generateNewToken(name: $name, groupId: $groupId)
  }
`

export const updateCollectionMutation = gql`
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

export const createCollectionMutation = gql`
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

export const deleteCollectionMutation = gql`
  mutation DeleteCollection($id: ID!) {
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
  query GetSubmissionForm($groupId: ID!) {
    submissionForm: formForPurposeAndCategory(purpose: "submit", category: "submission", groupId: $groupId) {
      ${formFields}
    }
  }
`
