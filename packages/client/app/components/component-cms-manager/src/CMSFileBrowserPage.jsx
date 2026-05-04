/* eslint-disable react-hooks/exhaustive-deps, react-hooks/use-memo */

import { useState, useCallback, useEffect, useContext } from 'react'
import { debounce, isEmpty, pick } from 'lodash'
import styled from 'styled-components'
import { useQuery, useLazyQuery, useMutation } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import CodeMirror from '@uiw/react-codemirror'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import SplitPane, { Pane } from 'split-pane-react'
import 'split-pane-react/esm/themes/default.css'

import { serverUrl } from '@coko/client'

import Browser from './browser/FileBrowser'
import { CommsErrorBanner, Spinner } from '../../shared'
import UploadComponent from '../../component-production/src/components/uploadManager/UploadComponent'
import { EditPageContainer } from './style'
import { ConfigContext } from '../../config/src'

import {
  getCmsFileContent,
  updateResource,
  getCmsFilesTree,
  addResourceToFolder,
  deleteResource,
  renameResource,
  getFoldersList,
  updateFlaxRootFolder,
  rebuildFlaxSiteMutation,
  getSubmissionForm,
} from './queries'

const StyledCodeMirror = styled(CodeMirror)`
  flex: 1;
`

const StyledPane = styled(Pane)`
  height: 100%;
`

const SpanActive = styled.span`
  font-weight: bold;
`

const MainFileContent = styled.div`
  background-color: #f4f5f7;
  display: flex;
  height: 100%;
  overflow: auto;
`

const UploadContainer = styled.div`
  margin: auto 25%;
  width: 100%;
`

const searchAddChildren = (treeData, { id, children }) => {
  if (
    treeData.id === id &&
    (treeData.children.length === 0 ||
      treeData.children.length !== children.length)
  ) {
    return {
      ...treeData,
      isOpen: true,
      children: children.map(child => {
        return child.fileId
          ? pick(child, ['id', 'fileId', 'name'])
          : {
              ...pick(child, ['id', 'fileId', 'name']),
              isOpen: false,
              children: [],
            }
      }),
    }
  }

  if (treeData.children && treeData.children.length > 0) {
    return {
      ...treeData,
      name: treeData.name,
      children: treeData.children.map(child =>
        searchAddChildren(child, { id, children }),
      ),
    }
  }

  return treeData
}

const CMSFileBrowserPage = () => {
  const { groupId, controlPanel } = useContext(ConfigContext)

  const [sizes, setSizes] = useState(['20%', '80%'])

  const { t } = useTranslation()

  const [imageSrc, setImageSrc] = useState('')
  const [treeData, setTreeData] = useState({})
  const [addObject] = useMutation(addResourceToFolder)
  const [deleteObject] = useMutation(deleteResource)
  const [renameObject] = useMutation(renameResource)
  const [updateFlaxFolder] = useMutation(updateFlaxRootFolder)
  const [rebuildFlaxSite] = useMutation(rebuildFlaxSiteMutation)

  const {
    loading: loadingFolders,
    data: dataFolders,
    refetch,
  } = useQuery(getFoldersList)

  const { data: metadata, loadingMetadata } = useQuery(getSubmissionForm, {
    variables: {
      groupId,
    },
  })

  const [activeContent, setActiveContent] = useState({
    id: null,
    name: '',
    content: '',
    isFolder: false,
    isImage: false,
  })

  const [updateObject] = useMutation(updateResource)

  const [getFileData] = useLazyQuery(getCmsFileContent, {
    onCompleted: ({ getCmsFileContent: Content }) => {
      const extension = Content.name.split('.').pop().toLowerCase()
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg']

      if (imageExtensions.includes(extension)) {
        setImageSrc(Content.url)
      }

      setActiveContent({
        id: Content.id,
        content: Content.content,
        name: Content.name,
        isImage: imageExtensions.includes(extension),
        isFolder: false,
      })
    },
  })

  const [getTreeData, { loading, error }] = useLazyQuery(getCmsFilesTree, {
    fetchPolicy: 'network-only',
    onCompleted: ({ getCmsFilesTree: data }) => {
      if (isEmpty(treeData)) {
        setTreeData({
          ...data,
          isOpen: true,
          children: data.children.map(child => {
            return child.fileId
              ? pick(child, ['id', 'name', 'fileId'])
              : {
                  ...pick(child, ['id', 'name', 'fileId']),
                  isOpen: false,
                  children: [],
                }
          }),
        })
      } else {
        const updatedTreeData = searchAddChildren(treeData, data)
        setTreeData({
          ...updatedTreeData,
        })
      }
    },
  })

  useEffect(() => {
    getTreeData({
      variables: {
        folderId: null,
      },
    })
  }, [])

  const onChangeContent = useCallback(
    debounce(async cont => {
      const updatedContent = {
        id: activeContent.id,
        content: cont,
      }

      await updateObject({
        variables: updatedContent,
      })
      setActiveContent({
        ...updatedContent,
        name: activeContent.name,
        isFolder: activeContent.isFolder,
      })
    }, '2000'),
    [activeContent.id],
  )

  const updateFlaxFolderFn = async variables => {
    await updateFlaxFolder(variables)
    refetch()
  }

  const uploadAssetsFn = async acceptedFiles => {
    const body = new FormData()

    acceptedFiles.forEach(f => body.append('files', f))

    body.append('id', activeContent.id)

    await fetch(`${serverUrl}/api/cmsUploadFiles`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body,
    })

    getTreeData({
      variables: {
        folderId: activeContent.id,
      },
    })
  }

  const onSelect = nodeData => {
    if (nodeData.fileId) {
      getFileData({
        variables: {
          id: nodeData.fileId,
        },
      })
    } else {
      setActiveContent({
        id: nodeData.id,
        name: nodeData.name,
        content: null,
        isImage: false,
        isFolder: true,
      })
    }
  }

  if (loadingFolders || loading || loadingMetadata) return <Spinner />

  if (error) return <CommsErrorBanner error={error} />

  const { submissionForm = {} } = metadata || {}

  const form = submissionForm?.structure ?? {
    name: '',
    children: [],
    description: '',
    haspopup: 'false',
  }

  return (
    <EditPageContainer>
      <SplitPane onChange={setSizes} sizes={sizes} split="vertical">
        <StyledPane maxSize="50%" minSize={50}>
          <Browser
            addObject={addObject}
            dataFolders={dataFolders}
            deleteObject={deleteObject}
            displayShortIdAsIdentifier={controlPanel?.displayManuscriptShortId}
            folderLists={dataFolders.getFoldersList || []}
            form={form}
            getTreeData={getTreeData}
            onSelect={onSelect}
            rebuildFlaxSite={rebuildFlaxSite}
            renameObject={renameObject}
            treeData={treeData}
            updateFlaxFolderFn={updateFlaxFolderFn}
          />
        </StyledPane>
        <MainFileContent>
          {!activeContent.isFolder &&
            activeContent.id &&
            !activeContent.isImage && (
              <StyledCodeMirror
                extensions={[css(), html()]}
                onChange={onChangeContent}
                value={activeContent.content}
              />
            )}
          {activeContent.isFolder && activeContent.id && (
            <UploadContainer>
              Upload To Folder <SpanActive>{activeContent.name}</SpanActive>:
              <UploadComponent
                label={t('dragndrop.Drag and drop other files here')}
                uploadAssetsFn={uploadAssetsFn}
              />
            </UploadContainer>
          )}
          {activeContent.isImage && <img alt="Preview" src={imageSrc} />}
        </MainFileContent>
      </SplitPane>
    </EditPageContainer>
  )
}

export default CMSFileBrowserPage
