/* eslint-disable react-hooks/rules-of-hooks, react-hooks/exhaustive-deps */
/* eslint-disable react/display-name */

/* eslint-disable new-cap */

import { useContext, useEffect, useCallback, useState } from 'react'
import {
  WaxContext,
  ComponentPlugin,
  DocumentHelpers,
  WaxView,
} from 'wax-prosemirror-core'
import {
  NotesAreaContainer,
  NotesHeading,
  NotesContainer,
  ReadOnlyNotesAreaContainer,
} from './NotesStyles'
import {
  Grid,
  Menu,
  ProductionEditorDiv,
  EditorContainer,
  InfoContainer,
  ReadOnlyEditorDiv,
  SideMenu,
} from './EditorStyles'
import { CommentsContainerNotes } from './CommentsStyles'
import 'wax-prosemirror-core/dist/index.css'
import 'wax-prosemirror-services/dist/index.css'

const TopBar = ComponentPlugin('topBar')
const NotesArea = ComponentPlugin('notesArea')
const RightArea = ComponentPlugin('rightArea')
const CounterInfo = ComponentPlugin('bottomRightInfo')
const LeftSideBar = ComponentPlugin('leftSideBar')
// const CommentTrackToolBar = ComponentPlugin('commentTrackToolBar')

const ProductionWaxEditorNoCommentsLayout = readOnly => props => {
  const getNotes = main => {
    const notes = DocumentHelpers.findChildrenByType(
      main.state.doc,
      main.state.schema.nodes.footnote,
      true,
    )

    return notes
  }

  const {
    pmViews: { main },
    options,
  } = useContext(WaxContext)

  const notes = (main && getNotes(main)) ?? []

  const areNotes = notes && !!notes.length && notes.length > 0

  const [hasNotes, setHasNotes] = useState(areNotes)

  const showNotes = () => {
    setHasNotes(areNotes)
  }

  const delayedShowedNotes = useCallback(
    setTimeout(() => showNotes(), 100),
    [],
  )

  useEffect(() => {}, [delayedShowedNotes])

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
    <div style={fullScreenStyles}>
      <Grid production readonly={readOnly}>
        {readOnly ? (
          <ReadOnlyEditorDiv className="wax-surface-scroll">
            <WaxView {...props} />
          </ReadOnlyEditorDiv>
        ) : (
          <>
            <Menu className="waxmenu">
              <TopBar />
            </Menu>
            <ProductionEditorDiv className="wax-surface-scroll">
              <SideMenu>
                <LeftSideBar />
              </SideMenu>
              <EditorContainer>
                <WaxView {...props} />
              </EditorContainer>
            </ProductionEditorDiv>
          </>
        )}
        {hasNotes && (
          <NotesAreaContainer>
            <NotesHeading>Notes</NotesHeading>
            <NotesContainer id="notes-container">
              <NotesArea view={main} />
            </NotesContainer>
            <CommentsContainerNotes>
              <RightArea area="notes" />
            </CommentsContainerNotes>
          </NotesAreaContainer>
        )}
      </Grid>
      {readOnly && notes.length > 0 && (
        <ReadOnlyNotesAreaContainer>
          <NotesHeading>Notes</NotesHeading>
          <NotesContainer id="notes-container">
            <NotesArea view={main} />
          </NotesContainer>
        </ReadOnlyNotesAreaContainer>
      )}
      <InfoContainer>
        <CounterInfo />
      </InfoContainer>
    </div>
  )
}

export default ProductionWaxEditorNoCommentsLayout
