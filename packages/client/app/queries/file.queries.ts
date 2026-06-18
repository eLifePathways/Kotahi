import { gql } from '@apollo/client'

export const CREATE_FILE = gql`
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

export const DELETE_FILES = gql`
  mutation DeleteFiles($ids: [ID!]!) {
    deleteFiles(ids: $ids)
  }
`

export const DELETE_FILE = gql`
  mutation DeleteFile($id: ID!) {
    deleteFile(id: $id)
  }
`

export const FILES_UPLOADED = gql`
  subscription FilesUploaded {
    filesUploaded
  }
`

export const FILES_DELETED = gql`
  subscription FilesDeleted {
    filesDeleted
  }
`

export const FILE_UPDATED = gql`
  subscription FileUpdated {
    fileUpdated {
      id
    }
  }
`

export const GET_ENTITY_FILES = gql`
  query GetEntityFilesQuery($input: EntityFilesInput) {
    getEntityFiles(input: $input) {
      id
      name
      alt
      objectId
      updated
      inUse
      storedObjects {
        type
        key
        mimetype
        size
        url
        imageMetadata {
          width
          height
          space
          density
        }
      }
    }
  }
`

export const GET_SPECIFIC_FILES = gql`
  query GetSpecificFilesQuery($ids: [ID!]!) {
    getSpecificFiles(ids: $ids) {
      id
      name
      alt
      objectId
      updated
      storedObjects {
        type
        key
        mimetype
        size
        url
        imageMetadata {
          width
          height
          space
          density
        }
      }
    }
  }
`

export const UPDATE_FILE = gql`
  mutation UpdateFile($input: UpdateFileInput!) {
    updateFile(input: $input) {
      id
    }
  }
`

export const UPLOAD_FILES = gql`
  mutation UploadFiles($files: [Upload]!, $fileType: String, $entityId: ID) {
    uploadFiles(files: $files, fileType: $fileType, entityId: $entityId) {
      id
    }
  }
`

export const UPLOAD_FILE = gql`
  mutation UploadFile($file: Upload!) {
    uploadFile(file: $file) {
      name
      storedObjects {
        type
        key
        size
        mimetype
        extension
        url
        imageMetadata {
          width
          height
          space
          density
        }
      }
    }
  }
`

export const UPDATE_FILE_TAGS = gql`
  mutation UpdateTagsFile($input: UpdateTagsFileInput!) {
    updateTagsFile(input: $input) {
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
  }
`
