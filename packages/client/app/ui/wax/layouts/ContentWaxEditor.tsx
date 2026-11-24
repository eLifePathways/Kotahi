import { useMemo, useState, type ReactNode } from 'react'
import styled from 'styled-components'

import { WaxProvider, WaxSurface } from '../editor'
import type { HandlebarsVariable } from '../features/handlebars'
import { createHandlebarsListener, HandlebarsAutocomplete } from '../ui'
import type { AssetFile, UploadResult } from '../features/images'
import { contentFeatures, simpleFeatures } from './featureSets'
import BlurArea from './shared/BlurArea'
import { inlineImage } from './shared/imageUpload'
import { FullToolbar, SimpleToolbar, fullScreenStyle } from './shared/toolbars'
import { toWaxUser, type KotahiUser } from './shared/user'
import {
  EditorDiv,
  FullWaxEditorGrid,
  Grid,
  Menu,
} from './styles/contentStyles'

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

const WaxContainer = styled.div`
  height: 100%;
  position: relative;
`

export type ContentWaxEditorProps = {
  value?: string
  onChange?: (html: string) => void
  onBlur?: (html: string) => void
  placeholder?: string
  fileUpload?: (file: File) => Promise<UploadResult>
  readonly?: boolean
  user?: KotahiUser
  onAssetManager?: () => Promise<AssetFile | AssetFile[] | null>
  handlebarsVariables?: HandlebarsVariable[]
  simple?: boolean
}

const ContentWaxEditor = ({
  value = '',
  onChange,
  onBlur,
  placeholder = '',
  fileUpload = inlineImage,
  readonly = false,
  user,
  onAssetManager,
  handlebarsVariables,
  simple = false,
}: ContentWaxEditorProps): ReactNode => {
  const [fullScreen, setFullScreen] = useState(false)
  const [listener] = useState(createHandlebarsListener)
  const withHandlebars = !!handlebarsVariables

  const features = useMemo(
    () =>
      simple
        ? simpleFeatures({
            handlebarsActions: withHandlebars ? listener.onAction : undefined,
          })
        : contentFeatures(),
    [simple, withHandlebars, listener],
  )

  return (
    <Container>
      <WaxProvider
        features={features}
        onChange={onChange}
        placeholder={placeholder}
        readonly={readonly}
        user={toWaxUser(user)}
        value={value}
      >
        <BlurArea onBlur={onBlur}>
          <WaxContainer id="wax-container" style={fullScreenStyle(fullScreen)}>
            <Grid $readonly={readonly}>
              <Menu className="waxmenu">
                {simple ? (
                  <SimpleToolbar />
                ) : (
                  <FullToolbar
                    findAndReplace={false}
                    fullScreen={{ value: fullScreen, onChange: setFullScreen }}
                    images={{
                      upload: fileUpload,
                      pickFromAssets: onAssetManager,
                    }}
                    notes={false}
                  />
                )}
              </Menu>
              <FullWaxEditorGrid
                $useComments={false}
                className="full-wax-editor-grid"
              >
                <EditorDiv
                  $hideComments
                  className="wax-surface-scroll panelWrapper"
                >
                  <WaxSurface />
                  {handlebarsVariables ? (
                    <HandlebarsAutocomplete
                      listener={listener}
                      variables={handlebarsVariables}
                    />
                  ) : null}
                </EditorDiv>
              </FullWaxEditorGrid>
            </Grid>
          </WaxContainer>
        </BlurArea>
      </WaxProvider>
    </Container>
  )
}

export default ContentWaxEditor
