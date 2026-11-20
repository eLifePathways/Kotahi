/* eslint-disable react/prop-types */

/* eslint-disable new-cap */

import { useRef, useMemo } from 'react'
import styled from 'styled-components'

import { Wax } from '../wax-prosemirror-core'

import ContentEditorLayout from './layout/ContentEditorLayout'
import ContentEditorConfig from './config/ContentEditorConfig'
import SimpleWaxEditorConfig from '../wax-collab/config/SimpleWaxEditorConfig'

const Container = styled.div`
  height: 96%;
  position: relative;
  width: 100%;

  @media screen and (width >= 1440px) {
    .full-wax-editor-grid {
      height: 100%;
      min-height: 250px;
      position: absolute;
      width: 100%;
    }
  }
`

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
  fileUpload = file => renderImage(file),
  readonly = false,
  user = {},
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

  const config = useMemo(
    () =>
      simple
        ? SimpleWaxEditorConfig({ autocompleteConfig })
        : ContentEditorConfig(onAssetManager),
    [simple, autocompleteConfig, onAssetManager],
  )

  const layout = useMemo(() => ContentEditorLayout(readonly), [readonly])

  return (
    <Container>
      <Wax
        config={config}
        fileUpload={fileUpload}
        layout={layout}
        ref={editorRef}
        user={waxUser}
        value={value}
        {...rest}
      />
    </Container>
  )
}

export default ContentWaxEditor
