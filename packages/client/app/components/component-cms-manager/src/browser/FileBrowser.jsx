/* eslint-disable react/prop-types */

/* stylelint-disable alpha-value-notation, color-function-notation */

import { useState, useContext } from 'react'
import styled from 'styled-components'

import { useTranslation } from 'react-i18next'

import FolderTree from 'react-folder-tree'
import 'react-folder-tree/dist/style.css'

import { Link } from '../../../pubsweet'

import ModalMetadataReadOnly from './ModalMetadataReadOnly'

import DeleteIcon from './DeleteIcon'
import { Select } from '../../../shared'
import { ConfigContext } from '../../../config/src'

import { FormActionButton } from '../style'
import { color } from '../../../../theme'

const FolderTreeContainer = styled.div`
  /* stylelint-disable selector-class-pattern */
  .displayName {
    text-wrap: nowrap;
  }

  .TreeNode {
    display: flex;
  }

  .TreeNodeToolBar {
    display: flex;
  }

  flex: 1;
  margin: 0 10px;
  overflow-y: auto;

  .FolderTree {
    position: relative;

    .typeIconContainer svg {
      color: ${color.gray60};
      stroke: ${color.gray60};
    }

    .displayName {
      color: ${color.text};

      &:hover {
        color: ${color.brand1.base};
      }
    }

    .caretContainer svg {
      color: ${color.gray40};
      stroke: ${color.gray40};

      &:hover {
        color: ${color.brand1.base};
        stroke: ${color.brand1.base};
      }
    }

    .iconContainer.TreeNodeToolBar {
      background: white;
      font-size: 22px;
      padding: 0 3px 3px;
      position: absolute;
      right: 0;

      svg {
        color: ${color.brand1.base};
        height: 1em;
        stroke: ${color.brand1.base};
        width: 1em;
      }

      div {
        top: 0;

        svg {
          height: 1em;
          width: 0.9em;
        }
      }

      .CancelIcon {
        display: none;
      }
    }

    .editingName {
      input {
        background-color: ${color.brand1.tint70};
        font-size: inherit;
      }

      .editableNameToolbar {
        background: rgb(255 255 255 / 80%);
        display: flex;
        position: absolute;
        right: 0;
        transform: translate(0, -15%);

        svg:not(:hover) {
          color: ${color.gray40};
          stroke: ${color.gray40};
        }
      }
    }
  }
`

const ContainerBrowser = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`

const SpanActive = styled.span`
  display: flex;
  font-weight: bold;
`

const SpanUrl = styled.span`
  font-size: 14px;
`

const RootFolder = styled.div`
  margin: 20px 10px 0;
`

const FormActionButtonStyled = styled(FormActionButton)`
  margin-bottom: 10px;
  margin-top: 10px;
  width: 100%;
`

const FlaxLink = styled(Link)`
  margin-left: 10px;
  margin-top: 10px;
`

const findClickedFolder = (state, path) => {
  const currentItem = state.children[path.shift()]

  if (path.length > 0) {
    return findClickedFolder(currentItem, path)
  }

  return currentItem || state
}

const hidePriorSelectionControls = () => {
  const cancelIconElement = document.querySelector('.CancelIcon')
  if (cancelIconElement)
    cancelIconElement.dispatchEvent(
      new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
      }),
    )
}

const Browser = ({
  onSelect,
  getTreeData,
  treeData,
  addObject,
  displayShortIdAsIdentifier,
  folderLists,
  form,
  deleteObject,
  rebuildFlaxSite,
  renameObject,
  updateFlaxFolderFn,
}) => {
  const [metadataState, setMetadataState] = useState(false)
  const config = useContext(ConfigContext)
  const { groupName } = config

  const flaxSiteUrlForGroup = `${config.flaxSiteUrl}/${groupName}/`

  const { t } = useTranslation()

  const [submitButtonText, setSubmitButtonText] = useState(
    t('cmsPage.layout.Publish'),
  )

  const publish = async () => {
    setSubmitButtonText(t('cmsPage.layout.Saving data'))

    setSubmitButtonText(t('cmsPage.layout.Rebuilding Site'))
    await rebuildFlaxSite({
      variables: {
        params: JSON.stringify({
          path: 'pages',
        }),
      },
    })
    setSubmitButtonText(t('cmsPage.layout.Published'))
  }

  const onTreeStateChange = async (state, event) => {
    if (
      event.type === 'toggleOpen' &&
      event.params &&
      event.params[0] === true
    ) {
      const item = findClickedFolder(treeData, event.path)

      if (item && item.children.length === 0) {
        getTreeData({
          variables: {
            folderId: item.id,
          },
        })
      }
    } else if (event.type === 'addNode') {
      const item = findClickedFolder(treeData, event.path)

      await addObject({
        variables: {
          id: item.id,
          type: event.params[0],
        },
      })

      getTreeData({
        variables: {
          folderId: item.id,
        },
      })
    } else if (event.type === 'deleteNode') {
      const item = findClickedFolder(treeData, event.path)

      const deletedObj = await deleteObject({
        variables: {
          id: item.id,
        },
      })

      getTreeData({
        variables: {
          folderId: deletedObj.data.deleteResource.parentId,
        },
      })
    } else if (event.type === 'renameNode') {
      const item = findClickedFolder(treeData, event.path)

      await renameObject({
        variables: {
          id: item.id,
          name: event.params[0],
        },
      })
    }
  }

  const selectOptions = folderLists.map(fld => ({
    value: fld.id,
    label: fld.name,
    rootFolder: fld.rootFolder,
  }))

  const selectedOption = selectOptions.find(fld => fld.rootFolder === true)

  const onNameClick = ({ defaultOnClick, nodeData }) => {
    hidePriorSelectionControls()
    defaultOnClick()
    onSelect(nodeData)
  }

  const formWithSubmissionFieldsOnly = {
    ...form,
    children: form.children.filter(field =>
      field.name.startsWith('submission.'),
    ),
  }

  return (
    <ContainerBrowser>
      <RootFolder>
        <SpanActive>Root CMS folder:</SpanActive>
        <Select
          aria-label="Select Folder"
          isClearable={false}
          isDisabled={selectOptions.length === 1}
          label="Select Folder"
          onChange={async selected => {
            await updateFlaxFolderFn({ variables: { id: selected.value } })
          }}
          options={selectOptions}
          value={selectedOption?.value}
          width="100%"
        />
        <FormActionButtonStyled onClick={publish} primary type="button">
          {submitButtonText}
        </FormActionButtonStyled>
        <SpanUrl>
          Published CMS URL:
          <FlaxLink
            rel="noopener noreferrer"
            target="_blank"
            to={flaxSiteUrlForGroup}
          >
            {flaxSiteUrlForGroup}
          </FlaxLink>
        </SpanUrl>
        <FormActionButtonStyled
          onClick={() => setMetadataState(true)}
          primary
          type="button"
        >
          Metadata List
        </FormActionButtonStyled>
        <ModalMetadataReadOnly
          displayShortIdAsIdentifier={displayShortIdAsIdentifier}
          formWithSubmissionFieldsOnly={formWithSubmissionFieldsOnly}
          onClose={() => {
            setMetadataState(false)
          }}
          open={metadataState}
        />
      </RootFolder>
      <hr />
      <FolderTreeContainer>
        <FolderTree
          data={treeData}
          iconComponents={{
            DeleteIcon,
          }}
          initOpenStatus="custom"
          onChange={onTreeStateChange}
          onNameClick={onNameClick}
          showCheckbox={false}
        />
      </FolderTreeContainer>
    </ContainerBrowser>
  )
}

export default Browser
