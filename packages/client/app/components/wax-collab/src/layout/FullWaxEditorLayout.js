/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/display-name */

/* eslint-disable new-cap */

import { useContext, useEffect } from 'react'
import {
  WaxContext,
  WaxView,
  ComponentPlugin,
  DocumentHelpers,
} from 'wax-prosemirror-core'
import {
  Grid,
  EditorDiv,
  ReadOnlyEditorDiv,
  Menu,
  InfoContainer,
  FullWaxEditorGrid,
} from './EditorStyles'
import {
  NotesAreaContainer,
  ReadOnlyNotesAreaContainer,
  NotesContainer,
  NotesHeading,
} from './NotesStyles'
import 'wax-prosemirror-core/dist/index.css'
import 'wax-prosemirror-services/dist/index.css'

const getNotes = main => {
  const notes = DocumentHelpers.findChildrenByType(
    main.state.doc,
    main.state.schema.nodes.footnote,
    true,
  )

  return notes
}

const TopBar = ComponentPlugin('topBar')
const NotesArea = ComponentPlugin('notesArea')
const CounterInfo = ComponentPlugin('bottomRightInfo')

const FullWaxEditorLayout = (readOnly, getActiveViewDom) => props => {
  const {
    pmViews: { main },
    options,
    activeView,
  } = useContext(WaxContext)

  useEffect(() => {
    if (activeView.dom?.outerHTML && getActiveViewDom) {
      getActiveViewDom(activeView.dom?.outerHTML)
    }
  }, [activeView.dom, activeView])

  const notes = (main && getNotes(main)) ?? []

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
    <div id="wax-container" style={fullScreenStyles}>
      <Grid readonly={readOnly} readOnlyComments>
        {readOnly ? (
          <FullWaxEditorGrid useComments={false}>
            <ReadOnlyEditorDiv className="wax-surface-scroll panelWrapper">
              <WaxView {...props} />
            </ReadOnlyEditorDiv>
            {notes.length > 0 && (
              <ReadOnlyNotesAreaContainer className="panelWrapper">
                <NotesContainer id="notes-container">
                  <NotesHeading>Notes</NotesHeading>
                  <NotesArea view={main} />
                </NotesContainer>
              </ReadOnlyNotesAreaContainer>
            )}
            <InfoContainer>
              <CounterInfo />
            </InfoContainer>
          </FullWaxEditorGrid>
        ) : (
          <>
            <Menu className="waxmenu">
              <TopBar />
            </Menu>
            <FullWaxEditorGrid useComments={false}>
              <EditorDiv
                className="wax-surface-scroll panelWrapper"
                hideComments
              >
                <WaxView {...props} />
              </EditorDiv>
              {notes.length > 0 && (
                <NotesAreaContainer className="panelWrapper">
                  <NotesContainer id="notes-container">
                    <NotesHeading>Notes</NotesHeading>
                    <NotesArea view={main} />
                  </NotesContainer>
                </NotesAreaContainer>
              )}
              <InfoContainer>
                <CounterInfo />
              </InfoContainer>
            </FullWaxEditorGrid>
          </>
        )}
      </Grid>
    </div>
  )
}

export default FullWaxEditorLayout
