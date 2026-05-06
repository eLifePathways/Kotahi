/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/prop-types, react/display-name */

/* eslint-disable new-cap */

import { useContext } from 'react'
import styled from 'styled-components'
import { WaxContext, ComponentPlugin, WaxView } from 'wax-prosemirror-core'
import { Grid, EditorDiv, Menu, FullWaxEditorGrid } from '../EditorStyles'
import HandlebarsAutocomplete from '../../../../component-email-templates/src/handlebarsAutocomplete/components/HandleBarsAutocomplete'
import 'wax-prosemirror-core/dist/index.css'
import 'wax-prosemirror-services/dist/index.css'

const WaxContainer = styled.div`
  height: 100%;
  position: relative;
`

const TopBar = ComponentPlugin('topBar')

const ContentEditorLayout =
  readOnly =>
  ({ useHandlebarsAutocomplete, ...props }) => {
    const { options } = useContext(WaxContext)

    // added to bring in full screen

    let fullScreenStyles = {}

    if (options.fullScreen) {
      fullScreenStyles = {
        backgroundColor: '#fff',
        height: '100%',
        left: '0',
        margin: '0',
        padding: '0',
        position: 'fixed',
        top: '0',
        width: '100%',
        zIndex: '99999',
      }
    }

    return (
      <WaxContainer id="wax-container" style={fullScreenStyles}>
        <Grid readonly={readOnly} readOnlyComments>
          <Menu className="waxmenu">
            <TopBar />
          </Menu>
          <FullWaxEditorGrid
            className="full-wax-editor-grid"
            useComments={false}
          >
            <EditorDiv className="wax-surface-scroll panelWrapper" hideComments>
              <WaxView {...props} />
              {useHandlebarsAutocomplete && <HandlebarsAutocomplete />}
            </EditorDiv>
          </FullWaxEditorGrid>
        </Grid>
      </WaxContainer>
    )
  }

export default ContentEditorLayout
