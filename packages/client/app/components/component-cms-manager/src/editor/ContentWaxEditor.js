/* eslint-disable react/prop-types */

/* eslint-disable new-cap */

import { useRef } from 'react'

import { Wax } from 'wax-prosemirror-core'

import { CmsWidthAndHeightContainer } from '../style'

import ContentEditorLayout from './layout/ContentEditorLayout'
import ContentEditorConfig from './config/ContentEditorConfig'
import SimpleWaxEditorConfig from '../../../wax-collab/src/config/SimpleWaxEditorConfig'

// TODO Save this image via the server
const renderImage = file => {
  const reader = new FileReader()
  return new Promise((resolve, reject) => {
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    // Some extra delay to make the asynchronicity visible
    setTimeout(() => {
      reader.readAsDataURL(file)
    }, 150)
  })
}

const ContentWaxEditor = ({
  value,
  // placeholder,
  // fileUpload,
  readonly,
  user,
  onAssetManager,
  autocompleteConfig,
  ...rest
}) => {
  const waxUser = {
    userId: user.id || '-',
    userColor: {
      addition: 'royalblue',
      deletion: 'indianred',
    },
    username: user.username || 'demo',
  }

  const { simple } = rest
  const editorRef = useRef(null)

  const config = simple
    ? SimpleWaxEditorConfig({ autocompleteConfig })
    : ContentEditorConfig(onAssetManager)

  return (
    <CmsWidthAndHeightContainer>
      <Wax
        config={config}
        fileUpload={file => renderImage(file)}
        layout={ContentEditorLayout(readonly)}
        ref={editorRef}
        user={waxUser}
        value={value}
        {...rest}
      />
    </CmsWidthAndHeightContainer>
  )
}

ContentWaxEditor.defaultProps = {
  readonly: false,
  fileUpload: () => {},
  user: {},
}

export default ContentWaxEditor
