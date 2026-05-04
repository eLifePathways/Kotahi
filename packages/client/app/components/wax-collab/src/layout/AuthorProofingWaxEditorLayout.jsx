/* eslint-disable react-hooks/rules-of-hooks, react-hooks/exhaustive-deps */
/* eslint-disable react/display-name */

/* eslint-disable new-cap */

import { useCallback, useContext, useState, useEffect } from 'react'
import {
  WaxContext,
  WaxView,
  ComponentPlugin,
  DocumentHelpers,
} from 'wax-prosemirror-core'

import { NotesAreaContainer, NotesHeading, NotesContainer } from './NotesStyles'
import {
  Grid,
  Menu,
  ProductionEditorDiv,
  EditorContainer,
  InfoContainer,
  SideMenu,
  EditorArea,
  WaxSurfaceScroll,
} from './EditorStyles'
import {
  CommentsContainer,
  CommentsContainerNotes,
  CommentTrackToolsContainer,
  CommentTrackTools,
  // CommentTrackOptions,
} from './CommentsStyles'
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
const RightArea = ComponentPlugin('rightArea')
const CounterInfo = ComponentPlugin('bottomRightInfo')
// const CommentTrackToolBar = ComponentPlugin('commentTrackToolBar')
const LeftSideBar = ComponentPlugin('leftSideBar')
const CitationArea = ComponentPlugin('citationArea')

const AuthorProofingWaxEditorLayout = readOnly => props => {
  const {
    pmViews: { main },
    options,
  } = useContext(WaxContext)

  // added to bring in notes

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

  // added to bring in comments

  const commentsTracksCount =
    main && DocumentHelpers.getCommentsTracksCount(main)

  const trackBlockNodesCount =
    main && DocumentHelpers.getTrackBlockNodesCount(main)

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
          <ProductionEditorDiv>
            <SideMenu />
            <EditorArea className="editorArea production">
              <div>
                <WaxSurfaceScroll className="panelWrapper">
                  <EditorContainer>
                    <WaxView {...props} />
                  </EditorContainer>
                  <CitationArea />
                  <CommentsContainer>
                    <CommentTrackToolsContainer>
                      <CommentTrackTools>
                        <span style={{ marginRight: '1em' }}>
                          {commentsTracksCount + trackBlockNodesCount} COMMENTS
                          AND SUGGESTIONS
                        </span>
                      </CommentTrackTools>
                    </CommentTrackToolsContainer>
                    <RightArea area="main" />
                  </CommentsContainer>
                </WaxSurfaceScroll>
                {hasNotes && (
                  <NotesAreaContainer className="productionnotes panelWrapper">
                    <NotesContainer id="notes-container">
                      <NotesHeading>Notes</NotesHeading>
                      <NotesArea view={main} />
                    </NotesContainer>
                    <CommentsContainerNotes>
                      <RightArea area="notes" />
                    </CommentsContainerNotes>
                  </NotesAreaContainer>
                )}
              </div>
            </EditorArea>
          </ProductionEditorDiv>
        ) : (
          <>
            <Menu className="waxmenu">
              <TopBar />
            </Menu>
            <ProductionEditorDiv>
              <SideMenu>
                <LeftSideBar />
              </SideMenu>

              <EditorArea className="editorArea authorProofing">
                <div>
                  <WaxSurfaceScroll className="panelWrapper">
                    <EditorContainer>
                      <WaxView {...props} />
                    </EditorContainer>
                    <CitationArea />
                    <CommentsContainer>
                      <CommentTrackToolsContainer>
                        <CommentTrackTools>
                          <span style={{ marginRight: '1em' }}>
                            {commentsTracksCount + trackBlockNodesCount}{' '}
                            COMMENTS AND SUGGESTIONS
                          </span>
                        </CommentTrackTools>
                      </CommentTrackToolsContainer>
                      <RightArea area="main" />
                    </CommentsContainer>
                  </WaxSurfaceScroll>
                  {hasNotes && (
                    <NotesAreaContainer className="productionnotes panelWrapper">
                      <NotesContainer id="notes-container">
                        <NotesHeading>Notes</NotesHeading>
                        <NotesArea view={main} />
                      </NotesContainer>
                      <CommentsContainerNotes>
                        <RightArea area="notes" />
                      </CommentsContainerNotes>
                    </NotesAreaContainer>
                  )}
                </div>
              </EditorArea>
            </ProductionEditorDiv>
          </>
        )}
      </Grid>
      <InfoContainer>
        <CounterInfo />
      </InfoContainer>
    </div>
  )
}

export default AuthorProofingWaxEditorLayout
