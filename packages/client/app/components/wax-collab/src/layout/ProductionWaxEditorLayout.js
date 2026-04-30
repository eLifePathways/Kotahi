/* eslint-disable react-hooks/rules-of-hooks, react-hooks/exhaustive-deps */
/* eslint-disable new-cap */
/* eslint-disable default-param-last */

import { useCallback, useContext, useState, useEffect, useMemo } from 'react'
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
  CommentTrackOptions,
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
const CommentTrackToolBar = ComponentPlugin('commentTrackToolBar')
const LeftSideBar = ComponentPlugin('leftSideBar')
const CitationArea = ComponentPlugin('citationArea')

const ProductionWaxEditorLayout =
  /* eslint-disable-next-line no-unused-vars */
  (readOnly, authorComments = null, leftBar = true, commentsToolPosition) =>
    props => {
      const {
        pmViews: { main },
        activeView,
        options,
      } = useContext(WaxContext)

      const [isWaxMounted, setWaxMounted] = useState(false)

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

      useEffect(() => {
        if (localStorage.getItem('activeTabKey').includes('editor')) {
          setTimeout(() => {
            setWaxMounted(true)
          })
        }

        function handleClick(e) {
          if (e.target?.parentNode?.getAttribute('contenteditable')) return

          const text = e.target.textContent || e.target.innerText

          if (
            text === 'Editor' ||
            text === 'Manuscript text' ||
            text === 'Review'
          ) {
            setWaxMounted(true)
          }
        }

        document.addEventListener('click', handleClick)
        return () => document.removeEventListener('click', handleClick)
      }, [localStorage.getItem('activeTabKey'), isWaxMounted])

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

      let commentTrackToolBarStyles = {}

      if (commentsToolPosition) {
        commentTrackToolBarStyles = {
          position: commentsToolPosition,
        }
      }

      return useMemo(
        () => (
          <div id="main-wax-editor" style={fullScreenStyles}>
            <Grid production readonly={readOnly}>
              <>
                <Menu className="waxmenu">
                  <TopBar />
                </Menu>
                <ProductionEditorDiv>
                  {leftBar && (
                    <SideMenu>
                      <LeftSideBar />
                    </SideMenu>
                  )}
                  <EditorArea className="editorArea production">
                    <WaxSurfaceScroll className="panelWrapper">
                      <EditorContainer>
                        <WaxView {...props} />
                      </EditorContainer>
                      <CitationArea />
                      <CommentsContainer>
                        <CommentTrackToolsContainer
                          style={commentTrackToolBarStyles}
                        >
                          <CommentTrackTools>
                            {commentsTracksCount + trackBlockNodesCount}{' '}
                            COMMENTS AND SUGGESTIONS
                            <CommentTrackOptions>
                              <CommentTrackToolBar />
                            </CommentTrackOptions>
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
                  </EditorArea>
                  <InfoContainer>
                    <CounterInfo />
                  </InfoContainer>
                </ProductionEditorDiv>
              </>
            </Grid>
          </div>
        ),
        [isWaxMounted, options.fullScreen, activeView.dom],
      )
    }

export default ProductionWaxEditorLayout
